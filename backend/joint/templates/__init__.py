import os

from jinja2 import Environment, FileSystemLoader

# We need the directory this file is in to figure out where the templates are stored.
file_path = os.path.dirname(__file__)

templates = Environment(loader=FileSystemLoader(file_path), autoescape=False)
template_process_event = templates.get_template("prompts/PROCESS_EVENT.md")
templates_ai_msg = templates.get_template("AI_MSG.md")
