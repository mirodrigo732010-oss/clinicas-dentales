# Dockerfile para EasyPanel - Clínica Dental
FROM node:20-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat openssl

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install

# Generar cliente de Prisma
RUN npx prisma generate

# Copiar el resto del proyecto
COPY . .

# Construir la aplicación
RUN npm run build

# Copiar archivos estáticos
RUN cp -r .next/static .next/standalone/.next/ && \
    cp -r public .next/standalone/

# Crear directorio para la base de datos
RUN mkdir -p /app/.next/standalone/prisma/db && \
    chmod -R 777 /app/.next/standalone/prisma

# Crear directorio para datos
RUN mkdir -p /app/.next/standalone/data && \
    chmod -R 777 /app/.next/standalone/data

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/.next/standalone/prisma/db/clinica.db"
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Directorio de trabajo final
WORKDIR /app/.next/standalone

# Script de inicio
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
