FROM python:3.9
WORKDIR /tmp/build/backend
RUN pip install poetry
COPY README.md /tmp/build/
COPY backend/pyproject.toml backend/poetry.lock /tmp/build/backend/
COPY backend/joint/ /tmp/build/backend/joint/
RUN poetry build -f wheel

FROM node:23.1 
WORKDIR /tmp/build/frontend
COPY frontend/build.js frontend/package.json frontend/package-lock.json /tmp/build/frontend
RUN npm i
COPY frontend/src /tmp/build/frontend/src
RUN npm run build

FROM python:3.9
COPY --from=0 /tmp/build/backend/dist/ /tmp/build/backend/dist/
RUN pip install /tmp/build/backend/dist/*
COPY --from=1 /tmp/build/frontend/dist/index.html /usr/local/share/index.html
ENV INDEX_HTML=/usr/local/share/index.html
ENTRYPOINT ["joint"]

