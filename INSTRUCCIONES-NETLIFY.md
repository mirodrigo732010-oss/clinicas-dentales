# 🦷 Desplegar en Netlify con Neon (PostgreSQL Gratis)

## 📋 Resumen

Netlify necesita una base de datos externa. Usaremos **Neon** (PostgreSQL gratis).

---

## PASO 1: Crear Base de Datos en Neon

### 1.1 Ir a Neon
1. Abre: **https://neon.tech**
2. Haz clic en **"Sign Up"**
3. Regístrate con **GitHub** o **Google** (más fácil)

### 1.2 Crear proyecto
1. Haz clic en **"Create a project"**
2. Nombre: `clinica-dental`
3. Región: Selecciona la más cercana (US East o US West)
4. Haz clic en **"Create project"**

### 1.3 Copiar Connection String
1. Después de crear, verás algo como:
   ```
   postgresql://neondb_owner:abc123xyz@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
2. **COPIA ESTA URL** (necesitarás pegarla en Netlify)

---

## PASO 2: Configurar Netlify

### 2.1 Ir a Site Settings
1. En Netlify, ve a tu sitio
2. Haz clic en **"Site settings"**

### 2.2 Agregar Variable de Entorno
1. Ve a **"Build & deploy"** → **"Environment"**
2. Haz clic en **"Add a variable"**
3. Configura:
   - **Key:** `DATABASE_URL`
   - **Value:** (pega la connection string de Neon)
4. Haz clic en **"Save"**

### 2.3 Redesplegar
1. Ve a **"Deploys"**
2. Haz clic en **"Trigger deploy"** → **"Clear cache and deploy site"**
3. Espera 2-3 minutos

---

## PASO 3: Inicializar la Base de Datos

Después del deploy exitoso, necesitas crear las tablas:

### Opción A: Desde tu computadora (recomendado)

1. Descarga el proyecto
2. Crea un archivo `.env` con tu DATABASE_URL:
   ```
   DATABASE_URL=postgresql://neondb_owner:abc123xyz@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Ejecuta:
   ```bash
   npm install
   npx prisma db push
   npx prisma db seed
   ```

### Opción B: Usar Neon SQL Editor

1. Ve a tu proyecto en Neon
2. Haz clic en **"SQL Editor"**
3. Pega y ejecuta este SQL:

```sql
-- Tablas principales
CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE,
  "name" TEXT,
  "phone" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP
);

CREATE TABLE "Appointment" (
  "id" TEXT PRIMARY KEY,
  "patientName" TEXT NOT NULL,
  "patientEmail" TEXT,
  "patientPhone" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "time" TEXT NOT NULL,
  "treatment" TEXT DEFAULT 'Valoración inicial',
  "notes" TEXT,
  "status" TEXT DEFAULT 'confirmed',
  "userId" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP
);

CREATE TABLE "AdminUser" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT,
  "role" TEXT DEFAULT 'admin',
  "lastLogin" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP
);

CREATE TABLE "AssistantConfig" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT DEFAULT 'Elena',
  "title" TEXT DEFAULT 'Asistente Virtual',
  "welcomeMessage" TEXT DEFAULT '¡Hola! ¿En qué puedo ayudarte?',
  "headerColor" TEXT DEFAULT '#0077B6',
  "buttonColor" TEXT DEFAULT '#0077B6',
  "buttonIcon" TEXT DEFAULT 'message-circle',
  "position" TEXT DEFAULT 'bottom-right',
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP
);

CREATE TABLE "Reminder" (
  "id" TEXT PRIMARY KEY,
  "appointmentId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "scheduledFor" TIMESTAMP NOT NULL,
  "status" TEXT DEFAULT 'pending',
  "channel" TEXT DEFAULT 'whatsapp',
  "message" TEXT NOT NULL,
  "sentAt" TIMESTAMP,
  "error" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "ReminderConfig" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT DEFAULT 'Recordatorio de Cita',
  "isActive" BOOLEAN DEFAULT true,
  "reminder24hEnabled" BOOLEAN DEFAULT true,
  "reminder2hEnabled" BOOLEAN DEFAULT true,
  "reminder1hEnabled" BOOLEAN DEFAULT false,
  "whatsappTemplate" TEXT DEFAULT '¡Hola {nombre}! Te recordamos tu cita.',
  "smsTemplate" TEXT DEFAULT 'Recordatorio de cita.',
  "clinicPhone" TEXT DEFAULT '5517489261',
  "clinicName" TEXT DEFAULT 'Clínica Dental Sonrisa Perfecta',
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP
);

-- Insertar admin por defecto
INSERT INTO "AdminUser" (id, email, "passwordHash", name, role)
VALUES ('admin-001', 'admin@sonrisaperfecta.es', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.wOq.0a8.gOMKGS', 'Admin', 'admin');

-- Crear índices
CREATE INDEX idx_appointment_date ON "Appointment"(date);
CREATE INDEX idx_appointment_status ON "Appointment"(status);
CREATE INDEX idx_reminder_status ON "Reminder"(status, "scheduledFor");
```

---

## PASO 4: Verificar

1. Abre tu sitio en Netlify
2. Ve a `/admin`
3. Inicia sesión con:
   - Email: `admin@sonrisaperfecta.es`
   - Password: `admin123`

---

## ⚠️ Importante sobre Netlify Functions

Netlify tiene limitaciones:
- **No soporta WebSockets** (el servicio de recordatorios no funcionará)
- **Functions tienen timeout de 10 segundos** (plan gratis)
- **Filesystem es efímero** (por eso usamos Neon)

Para funcionalidad completa, usa **EasyPanel en tu VPS Contabo**.

---

## 🔧 Si tienes problemas

### Error: "Can't reach database server"
- Verifica que la connection string esté correcta
- Asegúrate de incluir `?sslmode=require` al final

### Error: "Table doesn't exist"
- Ejecuta los comandos de Prisma:
  ```bash
  npx prisma db push
  ```

### El admin no funciona
- Verifica que la tabla AdminUser tenga el registro inicial
- La contraseña hasheada es para `admin123`

---

## 📱 Datos de la Clínica

- **Teléfono:** 5517489261
- **WhatsApp:** +52 55 1748 9261
- **Dirección:** Jacarandas 54 Col. Ahuehuetes, Tlalnepantla, Edo. Méx.
