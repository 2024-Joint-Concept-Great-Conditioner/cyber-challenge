import logging
import os

from dotenv import load_dotenv

__all__ = [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_REGION",
    "AWS_BEDROCK_MODEL",
    "MYSQL_USER",
    "MYSQL_PASSWORD",
    "MYSQL_DB",
    "MYSQL_HOST",
    "MYSQL_PORT",
    "INDEX_HTML",
]

AWS_ACCESS_KEY_ID: str = ""
AWS_SECRET_ACCESS_KEY: str = ""
AWS_REGION: str = "us-east-1"
AWS_BEDROCK_MODEL: str = "anthropic.claude-3-5-sonnet-20241022-v2:0"

MYSQL_USER: str = ""
MYSQL_PASSWORD: str = ""
MYSQL_DB: str = ""
MYSQL_HOST: str = ""
MYSQL_PORT: str = "3306"
MAX_POOL_SIZE = 10
INDEX_HTML: str = ""

load_dotenv()

bad_var = False

for var in __all__:
    env_var = os.environ.get(var)

    if globals()[var] == "" and env_var is None:
        logging.error(f"The `{var}` environment variable needs to be set.")
        bad_var = True

    elif env_var is not None:
        globals()[var] = env_var

if bad_var:
    exit(1)
