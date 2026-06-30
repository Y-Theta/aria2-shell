FROM --platform=linux/amd64 node:24-trixie-slim

LABEL maintainer="aria2-shell"
LABEL description="Aria2 Web Shell - Docker Image"

ENV DEBIAN_FRONTEND=noninteractive
ENV DATA_DIR=/app/data
ENV ARIA2_CONF_DIR=/app/data/aria2
ENV SERVER_DATA_DIR=/app/data/server
ENV NODE_ENV=production

RUN apt-get update &amp;&amp; \
    apt-get install -y --no-install-recommends \
    aria2 \
    nginx &amp;&amp; \
    apt-get clean &amp;&amp; \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY server/dist/ ./server/dist/
COPY server/package.json ./server/
COPY web/dist/ ./web/
COPY nginx/nginx.conf /etc/nginx/sites-available/default
COPY aria2/aria2.conf /app/aria2.conf.template
COPY docker/entrypoint.sh /app/entrypoint.sh

RUN cd /app/server &amp;&amp; npm install --production &amp;&amp; \
    chmod +x /app/entrypoint.sh &amp;&amp; \
    mkdir -p /app/data/aria2 /app/data/server /app/data/downloads &amp;&amp; \
    touch /app/data/aria2/aria2.session &amp;&amp; \
    ln -sf /dev/stdout /var/log/nginx/access.log &amp;&amp; \
    ln -sf /dev/stderr /var/log/nginx/error.log &amp;&amp; \
    rm -f /etc/nginx/sites-enabled/default &amp;&amp; \
    ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/

EXPOSE 8080 65004 6800

VOLUME ["/app/data"]

ENTRYPOINT ["/app/entrypoint.sh"]