#!/bin/sh

# 1. Se positionner dans le répertoire du backend (important pour npx et paths)
pwd
ls -la
cd /app/apps/backend

# 2. Exécuter les migrations de base de données
echo "Running Prisma migrations..."
npx prisma migrate deploy

# 3. Exécuter le seeding de la base de données
echo "Running database seeding..."
npx prisma db seed

# 4. Démarrer l'application (utilise les arguments passés à CMD)
echo "Starting application..."
exec "$@"