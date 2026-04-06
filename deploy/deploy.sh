#!/usr/bin/env bash
set -euo pipefail

echo "APP_DIR=${APP_DIR}"
cd "${APP_DIR}"

echo "Current dir:"
pwd

echo "Files here:"
ls -la

COMPOSE_FILE=""
for f in compose.yml compose.yaml docker-compose.yml docker-compose.yaml; do
  if [ -f "$f" ]; then
    COMPOSE_FILE="$f"
    break
  fi
done

if [ -z "$COMPOSE_FILE" ]; then
  echo "No Compose file found in $(pwd)"
  exit 1
fi

echo "Using compose file: $COMPOSE_FILE"

cat > .env <<EOF
APP_PORT=${APP_PORT}
POSTGRES_DB=${POSTGRES_DB}
POSTGRES_USER=${POSTGRES_USER}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
DATABASE_URL=${DATABASE_URL}
TURNSTILE_SECRET_KEY=${TURNSTILE_SECRET_KEY}
EOF

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed on the server."
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
else
  echo "Docker Compose is not installed."
  exit 1
fi

echo "Using: $COMPOSE_CMD"

$COMPOSE_CMD -f "$COMPOSE_FILE" config
$COMPOSE_CMD -f "$COMPOSE_FILE" pull || true
$COMPOSE_CMD -f "$COMPOSE_FILE" up -d --build
$COMPOSE_CMD -f "$COMPOSE_FILE" ps