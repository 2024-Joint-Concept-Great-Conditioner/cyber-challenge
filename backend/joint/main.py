#!/usr/bin/env python3
import json
import asyncio
import dateutil.parser
import os

from sqlmodel import Session, select
import uvicorn
import re
from fastapi import FastAPI, Request, BackgroundTasks
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

from joint import ai, env, db
from joint.db import Severity, Status, Event, engine
from joint.templates import template_process_event

directory = os.path.dirname(os.path.abspath(__file__))
os.chdir(directory)

codeblock_regex = re.compile(r"```(?:\w+\s+)?(.*?)```", re.DOTALL)

app = FastAPI()
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

aws_jobs: dict[int, tuple[int, int]] = {}
job_lock = asyncio.Lock()

@app.get("/", response_class=HTMLResponse)
def index_html():
    with open(env.INDEX_HTML) as file:
        return file.read()

@app.post("/aws-logs")
async def aws_logs(request: Request, background_tasks: BackgroundTasks):
    records = (await request.json())["Records"]

    async with job_lock:
        new_id = len(aws_jobs)
        aws_jobs[new_id] = (0, len(records))

    async def background_job():
        outputs = []
        tasks = []

        for index, record in enumerate(records):
            rendered_template = template_process_event.render(event=json.dumps(record))

            async def run_completion():
                output = await ai.get_completion(rendered_template)
                async with job_lock:
                    data = aws_jobs[new_id]
                    aws_jobs[new_id] = (data[0] + 1, data[1])
                return record, output

            tasks.append(run_completion())

            if len(tasks) == env.MAX_POOL_SIZE:
                outputs.extend(await asyncio.gather(*tasks))
                tasks = []

        outputs.extend(await asyncio.gather(*tasks))
        db_updates = []

        for record, output in outputs:
            blocks = codeblock_regex.findall(output)

            # We can't find the JSON output, so just skip for now.
            if len(blocks) == 0:
                print(f"Failed to find code block in output: {output}")
                continue
            # Same goes if we can't properly parse the JSON.
            code = blocks[0].strip()
            try:
                data = json.loads(code)
            except json.decoder.JSONDecodeError:
                print(f"Failed to parse JSON: {code}")
                continue

            # If there's no issue, skip it.
            if data == None:
                continue

            with Session(engine) as session:
                data_severity = data["severity"]

                def get_severity():
                    statement = select(Severity).where(
                        Severity.severity == data_severity
                    )
                    return session.exec(statement).first()

                severity = get_severity()

                if severity == None:
                    new_severity = Severity(severity=data_severity)
                    session.add(new_severity)
                    session.commit()
                    severity = get_severity()

                timestamp = int(dateutil.parser.parse(record["eventTime"]).timestamp())

                try:
                    event_type = data["eventType"]
                    summary = data["shortDescription"][:50]
                    fix = data["longDescription"][:300]
                except KeyError as e:
                    print(f"Missing key ({e.args[0]}): {data}")
                    continue

                new_event = Event(
                    timestamp=timestamp,
                    event_type=event_type,
                    severity=severity.id,
                    summary=summary,
                    fix=fix,
                    status=db.STATUS_NEW,
                )
                db_updates.append(new_event)

        with Session(engine) as session:
            for update in db_updates:
                session.add(update)
            session.commit()

    background_tasks.add_task(background_job)
    return {"id": new_id}


@app.get("/aws-logs/{job_id}")
async def aws_logs_status(job_id: int):
    async with job_lock:
        data = aws_jobs[job_id]
        return {
            "current_status": data[0] * 100 / data[1],
        }


@app.get("/events")
async def issues():
    with Session(engine) as session:
        statement = select(Event, Status, Severity).join(Status).join(Severity)
        results = session.exec(statement).all()
        output = []

        for result in results:
            event = result[0].model_dump()
            event["status"] = result[1].status
            event["severity"] = result[2].severity
            output.append(event)

        return output


def main():
    config = uvicorn.Config(app, host="0.0.0.0", port=8000, log_level="info")
    server = uvicorn.Server(config)
    server.run()


if __name__ == "__main__":
    main()
