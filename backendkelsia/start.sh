#!/bin/sh
echo "A aplicar migrações..."
npx prisma migrate deploy

echo "A correr seed..."
npx prisma db seed

echo "A iniciar servidor..."
node dist/server.js