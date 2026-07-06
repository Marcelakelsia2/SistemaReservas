#!/bin/sh

echo "=== Variáveis de ambiente ==="
echo "DATABASE_URL=$DATABASE_URL"
echo "JWT_SECRET=$JWT_SECRET"
echo "GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID"
echo "PORT=$PORT"
echo "============================="

# --- AGUARDAR PELO POSTGRES ---
echo "A aguardar que a base de dados (postgres:5432) esteja pronta..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "Base de dados ativa e online!"
# ------------------------------

echo "A aplicar migrações..."
npx prisma migrate deploy

echo "A correr seed..."
npx prisma db seed

echo "A iniciar servidor..."
node dist/server.js