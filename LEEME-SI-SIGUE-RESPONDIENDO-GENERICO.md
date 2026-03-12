# Si el bot sigue respondiendo genérico

Eso significa que **NO está entrando a Gemini** y está usando el modo de respaldo.

## Paso 1: revisa variables en EasyPanel
Debes tener exactamente estas variables:

- `GEMINI_API_KEY` = tu clave de Gemini
- `GEMINI_MODEL` = `gemini-2.5-flash`
- `NODE_ENV` = `production`

## Paso 2: guarda y haz redeploy
Después de cambiar variables, haz deploy otra vez.

## Paso 3: prueba este enlace en tu dominio
Abre en tu navegador:

`https://TU-DOMINIO.com/api/elena/chat`

Debe mostrar un JSON con la configuración.

## Paso 4: prueba el POST desde el navegador con una herramienta simple
Si tienes una pantalla para probar APIs en EasyPanel, envía este JSON a:

`/api/elena/chat`

```json
{
  "message": "hola",
  "sessionId": "prueba-1"
}
```

## Paso 5: revisa el campo `usedAI`
Si responde:

- `"usedAI": true` → Gemini ya funciona
- `"usedAI": false` → sigue fallando Gemini

## Paso 6: revisa `debugError`
Ahora el sistema devuelve `debugError` cuando Gemini falla.
Ese texto te dirá la causa exacta.

Ejemplos:

- `Falta la variable GEMINI_API_KEY` → no pusiste la clave
- `Gemini API error 400` → modelo incorrecto o petición inválida
- `Gemini API error 403` → la API key no tiene acceso
- `Gemini API error 429` → límite de uso
- `User location is not supported for the API use` → el IP del servidor está bloqueado por geolocalización de Google

## Paso 7: si aparece problema de ubicación
Si el error dice algo como:

`User location is not supported for the API use`

entonces el problema no es tu chatbot. El problema es el servidor/IP donde está desplegado.
En ese caso conviene:

- cambiar de servidor o región en EasyPanel/hosting
- usar otra salida IP
- o cambiar a OpenAI en lugar de Gemini

## Importante
En este ZIP también mejoré el modo de respaldo.
Aunque Gemini falle, ahora `hola`, `información`, `servicios`, `precios` y `citas` ya no deben responder siempre lo mismo.
