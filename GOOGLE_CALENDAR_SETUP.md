# Configuración de Google Calendar

Para que las citas se agenden en Google Calendar, necesitas configurar las credenciales de OAuth2.

## Paso 1: Crear proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google Calendar API**:
   - Ve a "APIs & Services" > "Library"
   - Busca "Google Calendar API"
   - Haz clic en "Enable"

## Paso 2: Crear credenciales OAuth2

1. Ve a "APIs & Services" > "Credentials"
2. Haz clic en "Create Credentials" > "OAuth client ID"
3. Selecciona "Web application"
4. Añade estas URLs autorizadas:
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `https://developers.google.com/oauthplayground`
5. Copia el **Client ID** y **Client Secret**

## Paso 3: Obtener Refresh Token

1. Ve a [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Haz clic en el engranaje ⚙️ (OAuth 2.0 Configuration)
3. Marca "Use your own OAuth credentials"
4. Pega tu Client ID y Client Secret
5. En "Select & authorize APIs", busca "Calendar API v3"
6. Selecciona `https://www.googleapis.com/auth/calendar.events`
7. Haz clic en "Authorize APIs"
8. Autoriza con la cuenta de Google (loboyaisha20@gmail.com)
9. Haz clic en "Exchange authorization code for tokens"
10. Copia el **Refresh token**

## Paso 4: Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
GOOGLE_REFRESH_TOKEN=tu_refresh_token_aqui
```

## Verificar configuración

Una vez configurado, al agendar una cita:
1. Se guardará en la base de datos local
2. Se creará un evento en Google Calendar en loboyaisha20@gmail.com
3. Se enviará un recordatorio por email al paciente (si proporcionó email)

## Notas importantes

- El Refresh Token puede expirar si no se usa por 6 meses
- Si cambias la contraseña de Google, necesitarás un nuevo Refresh Token
- Para producción, usa una cuenta de servicio de Google Workspace
