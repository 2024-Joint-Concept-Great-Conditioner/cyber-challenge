FROM python:3.9
WORKDIR /tmp/build/backend
RUN pip install poetry
COPY README.md /tmp/build/
COPY backend/pyproject.toml backend/poetry.lock /tmp/build/backend/
COPY backend/joint/ /tmp/build/backend/joint/
RUN poetry build -f wheel

FROM python:3.9
COPY --from=0 /tmp/build/backend/dist/ /tmp/build/backend/dist/
RUN pip install /tmp/build/backend/dist/*
ENTRYPOINT ["joint"]
