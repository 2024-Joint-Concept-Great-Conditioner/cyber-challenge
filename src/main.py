#!/usr/bin/env python3
from fastapi import FastAPI, Request
from jinja2 import Environment, FileSystemLoader
import os
import json

# We need the directory this file is in to figure out where the templates are stored.
FILE_PATH = os.path.dirname(__file__)

APP = FastAPI()

TEMPLATES = Environment(loader=FileSystemLoader(f"{FILE_PATH}/templates"), autoescape=False)
TEMPLATE_PROCESS_EVENT = TEMPLATES.get_template("prompts/PROCESS_EVENT.md")

@APP.post("/aws-logs")
async def aws_logs(request: Request):
    records = (await request.json())["Records"]

    return TEMPLATE_PROCESS_EVENT.render(event=json.dumps(records[0]))
