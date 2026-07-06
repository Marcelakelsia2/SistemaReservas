#!/bin/sh

echo "=== Variáveis de ambiente ==="

echo "DATABASE_URL=$DATABASE_URL"
echo "JWT_SECRET=$JWT_SECRET"
echo "GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID"
echo "PORT=$PORT"

echo "============================="

echo "A aplicar migrações..."
npx prisma migrate deploy

echo "A correr seed..."
npx prisma db seed

echo "A iniciar servidor..."
node dist/server.js