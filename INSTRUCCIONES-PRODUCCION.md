# 🦷 Guía de Producción - Clínica Dental Sonrisa Perfecta
## Despliegue en EasyPanel (Contabo VPS)

---

## ✅ ESTADO ACTUAL

| Componente | Estado |
|------------|--------|
| Elena (Chatbot) | ✅ Funciona con respuestas inteligentes (sin API key) |
| Base de datos | ✅ SQLite (no requiere configuración) |
| API Key IA | ⏳ Opcional - funciona sin ella |

---

## 📋 LO QUE NECESITAS (Solo 2 cosas)

1. **Tu servidor Contabo** (IP y acceso root)
2. **Cuenta de GitHub** (gratis)

**¡Eso es todo! Elena ya funciona con respuestas inteligentes.**

---

## PASO 1: Instalar EasyPanel en tu VPS

### Conecta por SSH:
```bash
ssh root@TU_IP_DEL_SERVIDOR
```

### Ejecuta este comando:
```bash
curl -sSL https://local.easypanel.io | sudo bash
```

Espera 2-5 minutos. Cuando termine, abre en tu navegador:
```
http://TU_IP_DEL_SERVIDOR:3000
```

Crea tu usuario y contraseña de administrador.

---

## PASO 2: Subir el Proyecto a GitHub

### Crear repositorio:
1. Ve a [github.com/new](https://github.com/new)
2. Repository name: `clinica-dental`
3. Haz clic en **"Create repository"**

### Subir archivos:
1. Haz clic en **"uploading an existing file"**
2. Arrastra TODOS los archivos del proyecto
3. Haz clic en **"Commit changes"**

---

## PASO 3: Conectar GitHub con EasyPanel

1. En EasyPanel, ve a **Settings** ⚙️
2. Haz clic en **"Connect GitHub"**
3. Autoriza a EasyPanel

---

## PASO 4: Crear la Aplicación

1. Clic en **"Create Project"** → Nombre: `clinica-dental`
2. Dentro del proyecto, clic en **"Create Service"** → **"App"**
3. Configura:
   - Provider: **GitHub**
   - Repository: **clinica-dental**
   - Branch: **main**
4. Clic en **"Create"**

---

## PASO 5: Configurar Puerto y Volumen

### Puerto:
Busca **"Ports"** y pon: `3000`

### Volumen (IMPORTANTE para no perder datos):
1. Busca **"Volumes"**
2. Clic en **"Add Volume"**
3. Configura:
   - Name: `clinica-db`
   - Mount Path: `/app/.next/standalone/prisma/db`

---

## PASO 6: Desplegar

1. Haz clic en **"Deploy"** (botón azul/verde)
2. Espera 3-5 minutos
3. ¡Listo!

---

## PASO 7: Verificar

Abre en tu navegador:
```
http://TU_IP_DEL_SERVIDOR:3000
```

Deberías ver la página de la clínica dental.

### Probar Elena:
1. Clic en el botón de chat (esquina inferior derecha)
2. Escribe: "Hola"
3. Elena debe responder

### Probar Admin:
1. Ve a: `http://TU_IP:3000/admin`
2. Login:
   - Email: `admin@sonrisaperfecta.es`
   - Password: `admin123`

---

## 📱 Configurar Dominio (Opcional)

### En EasyPanel:
1. Ve a **"Domains"**
2. Clic en **"Add Domain"**
3. Escribe tu dominio

### En tu proveedor de dominio:
Agrega estos registros DNS:

| Tipo | Nombre | Valor |
|------|--------|-------|
| A | @ | IP de tu servidor |
| A | www | IP de tu servidor |

EasyPanel configurará SSL automáticamente (HTTPS 🔒)

---

## 🔐 Credenciales

| Servicio | Usuario | Contraseña |
|----------|---------|------------|
| Admin | admin@sonrisaperfecta.es | admin123 |
| EasyPanel | (el que creaste) | (la que creaste) |

⚠️ **CAMBIA la contraseña del admin después del primer login**

---

## 🎯 Datos de la Clínica

- **Teléfono/WhatsApp**: 5517489261
- **Dirección**: Jacarandas 54 Col. Ahuehuetes, Tlalnepantla, Edo. Méx. CP 54150
- **Moneda**: MXN (Pesos Mexicanos)

---

## 🔄 Agregar IA Real (Opcional)

Elena funciona con respuestas inteligentes, pero si quieres IA real:

### Opción 1: Groq (Recomendado - Gratis)
1. Ve a [console.groq.com](https://console.groq.com)
2. Crea cuenta y API Key
3. En EasyPanel, agrega variable de entorno:
   ```
   GROQ_API_KEY = tu_api_key
   ```
4. Modifica `src/app/api/elena/chat/route.ts` para usar la función `callGroq`

### Opción 2: Z.AI (Cuando tengas contrato)
1. Agrega las variables de entorno de Z.AI
2. Cambia el código para usar el SDK

---

## ❓ Solución de Problemas

| Problema | Solución |
|----------|----------|
| La página no carga | Espera 2 min, verifica los logs |
| Error 502 | La app está iniciando, espera |
| Elena no responde | Funciona sin IA, debe responder |
| Se perdieron datos | Verifica que configuraste el volumen |

---

## ✅ Checklist

- [ ] EasyPanel instalado
- [ ] Proyecto en GitHub
- [ ] App creada en EasyPanel
- [ ] Puerto 3000 configurado
- [ ] Volumen configurado
- [ ] Deploy exitoso
- [ ] Elena responde
- [ ] Dominio configurado (opcional)

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en EasyPanel
2. Verifica la conexión SSH
3. Asegúrate de que el puerto 3000 esté accesible

---

¡Tu clínica dental lista para producción! 🎉
