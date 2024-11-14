#!/usr/bin/env python3
import json
import asyncio

import uvicorn
from fastapi import FastAPI, Request, BackgroundTasks

from joint import ai, env
from joint.templates import template_process_event

app = FastAPI()

aws_jobs: dict[int, tuple[int, int]] = {}
job_lock = asyncio.Lock()

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
                await ai.get_completion(rendered_template)
                async with job_lock:
                    data = aws_jobs[new_id]
                    aws_jobs[new_id] = (data[0] + 1, data[1])

            tasks.append(run_completion())

            if len(tasks) == env.MAX_POOL_SIZE:
                outputs.extend(await asyncio.gather(*tasks))
                tasks = []

        outputs.extend(await asyncio.gather(*tasks))

    background_tasks.add_task(background_job)
    return {"id": new_id}


@app.get("/aws-logs/{job_id}")
async def aws_logs_status(job_id: int):
    async with job_lock:
        data = aws_jobs[job_id]
        return {
            "current_status": data[0]*100 / data[1],
        }


def main():
    config = uvicorn.Config(app, port=8000, log_level="info")
    server = uvicorn.Server(config)
    server.run()


if __name__ == "__main__":
    main()
