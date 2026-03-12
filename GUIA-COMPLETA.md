# 🦷 GUÍA PASO A PASO - Clínica Dental en tu VPS Contabo

## 📋 LO QUE VAMOS A HACER

1. Instalar EasyPanel en tu VPS (1 comando)
2. Crear cuenta en GitHub
3. Subir el proyecto a GitHub
4. Desplegar en EasyPanel

**Tiempo total: ~30 minutos**

---

# PASO 1: INSTALAR EASYPANEL EN TU VPS

## 1.1 Abrir terminal (o Putty en Windows)

Si usas **Windows**, descarga **Putty** gratis:
- Ve a: https://www.putty.org
- Descarga e instala

## 1.2 Conectar a tu servidor

Abre Putty (o terminal) y conecta a tu servidor:

**En Putty:**
- Host Name: `TU_IP_DEL_SERVIDOR`
- Port: `22`
- Haz clic en "Open"
- Usuario: `root`
- Contraseña: (la contraseña de root de tu Contabo)

**En terminal Mac/Linux:**
```bash
ssh root@TU_IP_DEL_SERVIDOR
```

## 1.3 Instalar EasyPanel

**Copia y pega este comando completo:**

```bash
curl -sSL https://local.easypanel.io | sudo bash
```

Presiona **Enter** y espera 3-5 minutos.

Cuando termine, verás algo como:
```
✅ EasyPanel installed successfully
```

## 1.4 Abrir EasyPanel

Abre tu navegador (Chrome, Firefox) y ve a:

```
http://TU_IP_DEL_SERVIDOR:3000
```

**Primera vez:**
- Te pedirá crear usuario y contraseña
- **ANOTA ESTOS DATOS** (los necesitarás después)

---

# PASO 2: CREAR CUENTA EN GITHUB

## 2.1 Si NO tienes GitHub

1. Ve a: https://github.com
2. Haz clic en **"Sign up"**
3. Sigue los pasos (usa tu email personal)
4. Verifica tu email

## 2.2 Crear repositorio

1. En GitHub, haz clic en **"+"** (esquina superior derecha)
2. Selecciona **"New repository"**
3. Configura:
   - **Repository name:** `clinicas-dentales`
   - **Public** (selecciona esta opción)
   - **NO** marques "Add a README"
4. Haz clic en **"Create repository"**

---

# PASO 3: SUBIR EL PROYECTO A GITHUB

## OPCIÓN A: Subir desde esta plataforma (Más fácil)

**Dime:** "Quiero la Opción A" y te generaré un archivo ZIP pequeño que puedas subir directo a GitHub.

## OPCIÓN B: Desde tu computadora

### 3.1 Descargar el proyecto
El proyecto está en: `/home/z/my-project/public/clinicas-dentales.zip`

### 3.2 Descomprimir
- Windows: Clic derecho → "Extraer todo"
- Mac: Doble clic en el archivo

### 3.3 Instalar GitHub Desktop (recomendado si no sabes usar Git)

1. Ve a: https://desktop.github.com
2. Descarga e instala
3. Abre GitHub Desktop
4. Inicia sesión con tu cuenta de GitHub

### 3.4 Subir el proyecto

**En GitHub Desktop:**

1. Ve a **File → Add Local Folder**
2. Selecciona la carpeta descomprimida
3. Ve a **Repository → Publish repository**
4. Nombre: `clinicas-dentales`
5. Haz clic en **"Publish repository"**

---

# PASO 4: CONECTAR GITHUB CON EASYPANEL

## 4.1 En EasyPanel

1. Haz clic en **"Settings"** (ícono de engranaje ⚙️)
2. Busca **"Git Credentials"**
3. Haz clic en **"Connect GitHub"**
4. Autoriza a EasyPanel

---

# PASO 5: CREAR LA APLICACIÓN EN EASYPANEL

## 5.1 Crear proyecto

1. En EasyPanel, haz clic en **"Create Project"**
2. Nombre: `clinicas-dentales`
3. Haz clic en **"Create"**

## 5.2 Crear servicio

1. Dentro del proyecto, haz clic en **"Create Service"**
2. Selecciona **"App"**
3. Configura:
   - **Provider:** GitHub
   - **Repository:** clinicas-dentales
   - **Branch:** main
4. Haz clic en **"Create"**

---

# PASO 6: CONFIGURAR PUERTO Y VOLUMEN

## 6.1 Configurar puerto

1. En tu aplicación, busca **"Ports"** o **"Networking"**
2. Agrega:
   - **Container Port:** `3000`

## 6.2 Configurar volumen (IMPORTANTE para no perder datos)

1. Busca **"Volumes"** o **"Persistent Storage"**
2. Haz clic en **"Add Volume"**
3. Configura:
   - **Name:** `clinica-db`
   - **Mount Path:** `/app/.next/standalone/prisma/db`
4. Guarda

---

# PASO 7: DESPLEGAR

1. Haz clic en el botón **"Deploy"** (botón azul o verde)
2. Espera 3-5 minutos
3. Verás el progreso en los logs

**Posibles errores:**

| Si ves... | Haz esto |
|-----------|----------|
| "Build failed" | Haz clic en "Redeploy" |
| Se queda cargando | Espera, puede tomar 5 min |
| "Out of memory" | Tu VPS necesita más RAM |

---

# PASO 8: VERIFICAR

## 8.1 Abrir la página

En tu navegador, ve a:

```
http://TU_IP_DEL_SERVIDOR:3000
```

Deberías ver la página de la clínica dental. 🦷

## 8.2 Probar Elena (Chatbot)

1. Haz clic en el botón de chat (esquina inferior derecha)
2. Escribe: "Hola"
3. Elena debe responder

## 8.3 Probar el Admin

1. Ve a: `http://TU_IP_DEL_SERVIDOR:3000/admin`
2. Inicia sesión con:
   - **Email:** `admin@sonrisaperfecta.es`
   - **Contraseña:** `admin123`

---

# PASO 9: CONFIGURAR DOMINIO (OPCIONAL)

## Si tienes un dominio (ej: midominio.com)

### 9.1 En EasyPanel

1. Ve a tu aplicación
2. Busca **"Domains"**
3. Haz clic en **"Add Domain"**
4. Escribe tu dominio: `midominio.com`

### 9.2 Configurar DNS

Ve a donde compraste tu dominio (GoDaddy, Namecheap, etc.):

1. Busca "DNS" o "Administrar DNS"
2. Agrega estos registros:

| Tipo | Nombre | Valor |
|------|--------|-------|
| A | @ | TU_IP_DEL_SERVIDOR |
| A | www | TU_IP_DEL_SERVIDOR |

### 9.3 SSL automático

EasyPanel configurará automáticamente HTTPS (el candado verde 🔒).

---

# ✅ ¡LISTO!

Tu clínica dental está funcionando en:

| Página | URL |
|--------|-----|
| Página principal | `http://TU_IP:3000` |
| Panel Admin | `http://TU_IP:3000/admin` |

---

# 🔐 CREDENCIALES

| Servicio | Usuario | Contraseña |
|----------|---------|------------|
| Admin de la clínica | admin@sonrisaperfecta.es | admin123 |
| EasyPanel | (el que creaste) | (la que creaste) |

⚠️ **CAMBIA LA CONTRASEÑA DEL ADMIN después del primer login**

---

# ❓ PROBLEMAS COMUNES

## La página no carga
1. Verifica que el deploy terminó (ve a EasyPanel)
2. Espera 2-3 minutos después del deploy
3. Revisa que el puerto 3000 no esté bloqueado por el firewall

## Elena no responde
1. Verifica los logs en EasyPanel
2. Debe responder con mensajes predefinidos

## Error en el deploy
1. Haz clic en "Redeploy"
2. Si persiste, verifica los logs

---

# 📱 DATOS DE LA CLÍNICA

- **Teléfono/WhatsApp:** 5517489261
- **Dirección:** Jacarandas 54 Col. Ahuehuetes, Tlalnepantla, Edo. Méx. CP 54150
- **Moneda:** MXN (Pesos Mexicanos)

---

# 🆘 NECESITAS AYUDA?

Si tienes problemas, dime:
1. En qué paso estás
2. Qué error ves
3. Te ayudo a solucionarlo

---

**¿Listo para empezar? Dime la IP de tu servidor Contabo y comenzamos.** 🚀
