# 🦷 Configuración de Base de Datos Neon

Esta guía te ayudará a configurar una base de datos PostgreSQL gratuita en Neon para tu clínica dental.

## ¿Por qué Neon?

- ✅ **Gratis** - 0.5 GB de almacenamiento
- ✅ **Serverless** - Perfecto para Netlify
- ✅ **Automático** - Se escala automáticamente
- ✅ **Seguro** - SSL incluido
- ✅ **Rápido** - Bases de datos en múltiples regiones

## Paso 1: Crear cuenta en Neon

1. Ve a [neon.tech](https://neon.tech)
2. Haz clic en **"Sign up"**
3. Puedes usar GitHub, Google o email

## Paso 2: Crear un proyecto

1. En el dashboard, haz clic en **"New Project"**
2. Nombre del proyecto: `clinica-dental`
3. Región: Selecciona la más cercana a tus usuarios (recomendado: `US East (Ohio)` para México)
4. Haz clic en **"Create project"**

## Paso 3: Obtener las URLs de conexión

Después de crear el proyecto, verás las conexiones:

1. Busca la sección **"Connection Details"**
2. Copia la **"Connection string"** - esta es tu `DATABASE_URL`
3. Para obtener la `DIRECT_DATABASE_URL`, cambia `?sslmode=require&pgbouncer=true` por `?sslmode=require`

Ejemplo:
```
DATABASE_URL="postgresql://alex:AbC123dEf@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://alex:AbC123dEf@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

## Paso 4: Configurar en Netlify

1. Ve a tu sitio en [Netlify](https://app.netlify.com)
2. Navega a **Site settings** > **Environment variables**
3. Agrega las variables:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | Tu conexión string con pgbouncer |
| `DIRECT_DATABASE_URL` | Tu conexión string sin pgbouncer |

## Paso 5: Ejecutar migraciones

Después de configurar las variables, Netlify ejecutará automáticamente las migraciones durante el build.

### Para desarrollo local:

1. Crea un archivo `.env` en la raíz del proyecto con tus URLs
2. Ejecuta:
```bash
npm run db:push
npm run db:seed
```

## Verificar la conexión

Puedes verificar que todo funciona en el dashboard de Neon:
1. Ve a **"Tables"** en el sidebar
2. Deberías ver las tablas creadas: `Appointment`, `FAQ`, `DoctorAvailability`, etc.

## Límites del plan gratuito

- **Almacenamiento**: 0.5 GB
- **Computo**: 300 horas/mes
- **Proyectos**: 1 proyecto

Para una clínica dental pequeña, esto es más que suficiente.

## Problemas comunes

### Error: "Can't reach database server"
- Verifica que las URLs estén correctas
- Asegúrate de que el proyecto no esté en "Idle" (dormido)
- Los proyectos gratuitos se duermen después de inactividad

### Error: "Authentication failed"
- Verifica usuario y contraseña en la URL
- Regenera la contraseña en el dashboard de Neon

### Error: "Database is paused"
- Los proyectos gratuitos se pausan por inactividad
- Haz una petición a tu sitio para "despertar" la base de datos

## Soporte

Si tienes problemas:
1. [Documentación de Neon](https://neon.tech/docs)
2. [Discord de Neon](https://discord.gg/neon)
