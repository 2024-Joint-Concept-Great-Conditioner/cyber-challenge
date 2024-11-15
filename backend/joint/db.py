from typing import Optional

from sqlmodel import Field, SQLModel, create_engine, Session, select

from joint import env

__all__ = [
    "Severity",
    "Status",
    "Event",
    "engine",
    "STATUS_OPEN",
    "STATUS_NOT_A_FINDING",
    "STATUS_NOT_REVIEWED",
    "STATUS_NOT_APPLICABLE",
]


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
    summary: str = Field(max_length=50)
    fix: str = Field(max_length=300)
    status: int = Field(foreign_key="status.id")


session_url = "mysql+pymysql://{}:{}@{}:{}/{}?charset=utf8mb4".format(
    env.MYSQL_USER, env.MYSQL_PASSWORD, env.MYSQL_HOST, env.MYSQL_PORT, env.MYSQL_DB
)

# Start up the database.
engine = create_engine(session_url)
SQLModel.metadata.create_all(engine)

# Create the statuses if they don't already exist.
statuses = ["Open", "Not A Finding", "Not Reviewed", "Not Applicable"]

with Session(engine) as session:
    for status in statuses:

        def get_status_id():
            status_statement = select(Status).where(Status.status == status)
            result = session.exec(status_statement).first()
            if result is not None:
                return result.id

        status_id = get_status_id()

        if status_id == None:
            new_status = Status(status=status)
            session.add(new_status)
            session.commit()
            status_id = get_status_id()

        var_name = "STATUS_" + status.upper().replace(" ", "_")
        globals()[var_name] = status_id
