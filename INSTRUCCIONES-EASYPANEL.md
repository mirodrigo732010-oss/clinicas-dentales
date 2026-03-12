# 🦷 Instrucciones para desplegar en EasyPanel (Contabo)

## 📋 Resumen
Vamos a subir tu clínica dental a tu VPS de Contabo usando EasyPanel. EasyPanel es un panel visual que hace todo muy fácil.

---

## PASO 1: Descargar el proyecto

1. Descarga el archivo `clinica-dental-easypanel.zip`
2. Descomprime el archivo en tu computadora
3. Guarda la carpeta en un lugar que recuerdes (ej: Escritorio)

---

## PASO 2: Crear cuenta en GitHub (si no tienes)

1. Ve a [github.com](https://github.com)
2. Haz clic en **"Sign up"**
3. Crea tu cuenta con tu email

---

## PASO 3: Subir el proyecto a GitHub

### Opción A: Usando GitHub Desktop (más fácil)

1. Descarga [GitHub Desktop](https://desktop.github.com)
2. Abre GitHub Desktop y conecta tu cuenta
3. Ve a **File → New Repository**
4. Nombre: `clinica-dental`
5. Selecciona la carpeta descomprimida
6. Haz clic en **"Create Repository"**
7. Haz clic en **"Publish repository"**

### Opción B: Usando la web de GitHub

1. Ve a [github.com/new](https://github.com/new)
2. Repository name: `clinica-dental`
3. Haz clic en **"Create repository"**
4. Luego haz clic en **"uploading an existing file"**
5. Arrastra todos los archivos de la carpeta descomprimida
6. Haz clic en **"Commit changes"**

---

## PASO 4: Conectar GitHub con EasyPanel

1. Abre EasyPanel en tu VPS (normalmente en `http://tu-ip:3000` o el dominio que configuraste)
2. En el menú lateral, haz clic en **"Settings"** (o el ícono de engranaje)
3. Busca la sección **"Git Credentials"** o **"GitHub"**
4. Haz clic en **"Connect GitHub"**
5. Autoriza a EasyPanel para acceder a tus repositorios

---

## PASO 5: Crear la aplicación en EasyPanel

1. En EasyPanel, haz clic en **"Create Project"**
2. Nombre del proyecto: `clinica-dental`
3. Dentro del proyecto, haz clic en **"Create Service"**
4. Selecciona **"App"**
5. Configura:

   | Campo | Valor |
   |-------|-------|
   | **Provider** | GitHub |
   | **Repository** | clinica-dental |
   | **Branch** | main (o master) |

6. Haz clic en **"Create"**

---

## PASO 6: Configurar la aplicación

En la configuración de la aplicación:

### 6.1 Configurar Build
Busca la sección **"Build"** y verifica:
- **Build Type**: Dockerfile
- **Dockerfile Path**: `Dockerfile` (dejar vacío si no aparece)

### 6.2 Configurar Puerto
Busca la sección **"Ports"** o **"Networking"**:
- **Container Port**: `3000`

### 6.3 Variables de Entorno (Opcional)
Busca **"Environment Variables"** y agrega si es necesario:
```
DATABASE_URL=file:./prisma/db/clinica.db
NODE_ENV=production
```

### 6.4 Configurar Volúmenes (IMPORTANTE para no perder datos)
Busca la sección **"Volumes"** o **"Persistent Storage"**:
1. Haz clic en **"Add Volume"**
2. Configura:
   - **Name**: `clinica-db`
   - **Mount Path**: `/app/.next/standalone/prisma/db`
3. Guarda

---

## PASO 7: Desplegar la aplicación

1. Haz clic en el botón **"Deploy"** (normalmente azul o verde)
2. Espera 3-5 minutos mientras se construye
3. Verás el progreso en los logs

### Posibles errores y soluciones:

| Error | Solución |
|-------|----------|
| "Build failed" | Espera unos minutos y haz clic en "Redeploy" |
| "Port already in use" | Cambia el puerto en la configuración |
| "Out of memory" | Tu VPS necesita más RAM |

---

## PASO 8: Configurar el dominio

### Si tienes un dominio:

1. En EasyPanel, ve a **"Domains"** en tu aplicación
2. Haz clic en **"Add Domain"**
3. Escribe tu dominio: `tudominio.com`
4. EasyPanel te mostrará los registros DNS que necesitas configurar
5. Ve a tu proveedor de dominio (IONOS, GoDaddy, etc.)
6. Configura los registros DNS:
   - **Tipo A**: Apunta a la IP de tu VPS
   - O **CNAME**: Apunta al dominio de EasyPanel

### SSL automático:
EasyPanel configurará automáticamente HTTPS (candado verde) usando Let's Encrypt.

---

## PASO 9: Verificar que funciona

1. Abre tu navegador
2. Ve a tu dominio o IP: `http://tu-ip:3000`
3. Deberías ver la página de la clínica dental

### Probar el admin:
1. Ve a `http://tu-dominio.com/admin`
2. Inicia sesión con:
   - **Email**: `admin@sonrisaperfecta.es`
   - **Password**: `admin123`

---

## 🔧 Comandos útiles (solo si necesitas)

Si necesitas entrar por SSH a tu VPS:

```bash
# Conectar por SSH
ssh root@tu-ip-del-vps

# Ver logs de la aplicación
docker logs clinica-dental

# Ver todos los contenedores
docker ps

# Reiniciar la aplicación
docker restart clinica-dental
```

---

## 📞 Soporte

Si tienes problemas:

1. **La página no carga**: Verifica que el puerto 3000 esté abierto en el firewall de Contabo
2. **Error 502**: La aplicación está iniciando, espera 1-2 minutos
3. **No guarda datos**: Verifica que configuraste el volumen persistente
4. **Elena no responde**: La IA puede tardar unos segundos en cargar

---

## ✅ ¡Listo!

Tu clínica dental debería estar funcionando en:
- **Página principal**: `https://tudominio.com`
- **Panel admin**: `https://tudominio.com/admin`
- **WhatsApp del doctor**: Configurado para +52 1 55 1748 9261

---

## 🔐 Credenciales

| Servicio | Usuario | Contraseña |
|----------|---------|------------|
| Admin | admin@sonrisaperfecta.es | admin123 |

⚠️ **IMPORTANTE**: Cambia la contraseña después del primer login.

---

## 📱 WhatsApp del Doctor

El botón de WhatsApp enviará mensajes a: **+52 1 55 1748 9261**

Para cambiarlo, edita el archivo `src/components/dental/footer.tsx` y busca el número de teléfono.
