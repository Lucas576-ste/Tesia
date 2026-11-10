#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
NOME=tesia-db-teste
PORTA=${PORTA:-54329}
export PGPASSWORD=teste
export PGOPTIONS="-c client_min_messages=warning"

docker rm -f "$NOME" >/dev/null 2>&1 || true
trap 'docker rm -f "$NOME" >/dev/null 2>&1 || true' EXIT

docker run -d --name "$NOME" -e POSTGRES_PASSWORD=teste -p "127.0.0.1:$PORTA:5432" pgvector/pgvector:pg17 >/dev/null
until docker exec "$NOME" pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done
sleep 1

rodar() {
  psql -h 127.0.0.1 -p "$PORTA" -U postgres -d postgres -v ON_ERROR_STOP=1 -q -X "$@"
}

aplicar() {
  rodar -f teste/auth_local.sql
  for arquivo in migrations/*.sql; do rodar -f "$arquivo"; done
  for arquivo in seeds/*.sql; do rodar -f "$arquivo"; done
  for arquivo in seeds/*.sql; do rodar -f "$arquivo"; done
}

aplicar
echo "Migrations e seeds aplicados (seeds rodados duas vezes)"
rodar -f teste/rls.sql

rodar -c "drop schema public cascade; drop schema auth cascade; drop role anon, authenticated, service_role; create schema public;"
aplicar
echo "Migrations aplicadas de novo do zero"
