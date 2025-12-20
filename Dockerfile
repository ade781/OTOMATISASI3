FROM node:20-bookworm AS frontend-build

WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend .
ARG VITE_API_URL=/
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

FROM node:20-bookworm AS backend-build

WORKDIR /build/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend .

FROM node:20-bookworm

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
  && apt-get install -y --no-install-recommends nginx supervisor gettext-base ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=backend-build /build/backend /app/backend
COPY --from=frontend-build /build/frontend/dist /usr/share/nginx/html
COPY deploy/nginx.railway.conf.template /etc/nginx/conf.d/default.conf.template
COPY deploy/supervisord.railway.conf /etc/supervisor/conf.d/supervisord.conf
COPY deploy/entrypoint.railway.sh /usr/local/bin/entrypoint.railway.sh

RUN chmod +x /usr/local/bin/entrypoint.railway.sh \
  && mkdir -p /app/uploads

ENV PORT=8080 \
  BACKEND_PORT=5000

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/entrypoint.railway.sh"]
