FROM node:24-trixie-slim

LABEL maintainer="aria2-shell"
LABEL description="Aria2 Web Shell - Docker Image"

ENV DEBIAN_FRONTEND=noninteractive
ENV DATA_DIR=/app/data
ENV ARIA2_CONF_DIR=/app/data/aria2
ENV SERVER_DATA_DIR=/app/data/server
ENV NODE_ENV=production

RUN apt-get update && \
    apt-get install -y --no-install-recommends aria2 nginx && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY server/dist/ ./server/dist/
COPY server/package.json ./server/
COPY web/dist/ ./web/
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY aria2/aria2.conf /app/aria2.conf.template
COPY docker/entrypoint.sh /app/entrypoint.sh

RUN cd /app/server && npm install --production && \
    chmod +x /app/entrypoint.sh && \
    mkdir -p /app/data/aria2 /app/data/server /app/data/downloads && \
    touch /app/data/aria2/aria2.session && \
    ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log && \
    rm -f /etc/nginx/sites-enabled/default

EXPOSE 8080 65004 6800

VOLUME ["/app/data"]

ENTRYPOINT ["/app/entrypoint.sh"]