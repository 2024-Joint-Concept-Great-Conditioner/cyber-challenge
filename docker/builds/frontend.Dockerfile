FROM node:23.1

WORKDIR /tmp/build/frontend
COPY frontend/build.js frontend/package.json frontend/package-lock.json /tmp/build/frontend
RUN npm i

ARG BACKEND_URL
COPY frontend/src /tmp/build/frontend/src
RUN npm run build

FROM nginx:1.27.2
COPY --from=0 /tmp/build/frontend/dist/index.html /usr/share/nginx/html/
