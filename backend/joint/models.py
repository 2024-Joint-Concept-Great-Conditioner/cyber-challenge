from typing import Optional

from sqlmodel import Field, SQLModel, create_engine

from joint import env


class Severity(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    severity: str


class Status(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    status: str


class Event(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: int
    event_type: str
    severity: int = Field(foreign_key="severity.id")
    summary: str
    fix: str
    status: int = Field(foreign_key="status.id")


session_url = "mysql+pymysql://{}:{}@{}:{}/{}?charset=utf8mb4".format(
    env.MYSQL_USER, env.MYSQL_PASSWORD, env.MYSQL_HOST, env.MYSQL_PORT, env.MYSQL_DB
)

engine = create_engine(session_url)
SQLModel.metadata.create_all(engine)
