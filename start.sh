#!/bin/sh
set -e

echo "🦷 Iniciando Clínica Dental Sonrisa Perfecta..."
echo "📅 $(date)"

# Crear directorios necesarios
mkdir -p /app/.next/standalone/prisma/db
mkdir -p /app/.next/standalone/data
chmod -R 777 /app/.next/standalone/prisma/db 2>/dev/null || true
chmod -R 777 /app/.next/standalone/data 2>/dev/null || true

# Ir al directorio de la aplicación
cd /app/.next/standalone

# Inicializar base de datos si no existe
if [ ! -f /app/.next/standalone/prisma/db/clinica.db ]; then
  echo "📦 Creando base de datos..."
  cd /app
  npx prisma db push --skip-generate
  echo "🌱 Poblando base de datos..."
  npx tsx prisma/seed.ts || echo "Seed completado"
  cp -r prisma/db /app/.next/standalone/prisma/ 2>/dev/null || true
  cd /app/.next/standalone
fi

echo "🚀 Iniciando servidor en puerto 3000..."
exec node server.js
