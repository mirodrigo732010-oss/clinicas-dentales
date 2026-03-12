# Instalación paso a paso para que el chatbot responda con Gemini

Estas instrucciones están hechas para alguien sin conocimientos técnicos.

## 1) Descarga este proyecto modificado
Usa el archivo ZIP que te entregué en esta conversación.

## 2) Saca tu API key de Gemini
1. Abre Google AI Studio.
2. Inicia sesión con tu cuenta de Google.
3. Busca la opción para crear una API key.
4. Copia esa clave.
5. Guárdala en un bloc de notas porque la vas a pegar en EasyPanel.

## 3) Sube el proyecto a GitHub
1. Entra a tu repositorio en GitHub.
2. Borra los archivos viejos del proyecto, o súbelos encima para reemplazarlos.
3. Sube el contenido del ZIP nuevo.
4. Espera a que GitHub termine de cargar todo.

## 4) Abre EasyPanel
1. Entra a EasyPanel.
2. Abre el proyecto de esta clínica dental.
3. Ve a la parte de Variables de entorno o Environment Variables.

## 5) Crea estas variables exactamente así
Agrega estas 3 líneas:

- `GEMINI_API_KEY` = aquí pegas tu clave real de Gemini
- `GEMINI_MODEL` = `gemini-1.5-flash`
- `NODE_ENV` = `production`

Muy importante: no pongas comillas.

## 6) Guarda los cambios
Después de guardar las variables, vuelve a desplegar el proyecto.

Si EasyPanel te muestra botones como estos, usa el que diga algo parecido a:
- Redeploy
- Rebuild
- Deploy again
- Restart + Rebuild

## 7) Espera a que termine el despliegue
Cuando el despliegue termine sin errores, abre tu página.

## 8) Haz una prueba simple
Escribe en el chatbot algo como:

`Hola, ¿qué tratamientos manejan y cuáles son sus horarios?`

Si ya funciona bien, el bot debe responder de forma natural, no genérica.

## 9) Cómo saber si realmente está usando Gemini
Haz esta prueba:
1. Abre tu página web.
2. Abre el chat.
3. Envía un mensaje.
4. Presiona F12 en el navegador.
5. Entra a la pestaña Network.
6. Busca una petición llamada `/api/elena/chat`.
7. Haz clic en esa petición.
8. Busca la respuesta JSON.

Si todo salió bien, debe aparecer algo parecido a esto:

```json
{
  "response": "...",
  "assistantName": "Elena",
  "usedAI": true,
  "provider": "gemini",
  "model": "gemini-1.5-flash"
}
```

## 10) Si sigue respondiendo genérico
Revisa esto en este orden:

### A. La API key está mal pegada
Solución:
- vuelve a copiar la clave
- pégala otra vez en EasyPanel
- guarda
- vuelve a desplegar

### B. No hiciste redeploy
Solución:
- haz redeploy otra vez

### C. GitHub sigue con archivos viejos
Solución:
- confirma que el archivo `src/app/api/elena/chat/route.ts` sí fue reemplazado
- vuelve a subir el ZIP correcto

### D. El deploy falló
Solución:
- entra a Logs en EasyPanel
- busca errores en color rojo
- si quieres, me pegas esos errores y te digo exactamente qué corregir

## 11) Qué fue lo que ya te dejé arreglado en este ZIP
En este proyecto ya quedó hecho lo siguiente:

- el chat ahora usa Gemini
- el prompt principal ya se manda bien como instrucciones del sistema
- el backend devuelve si usó IA real o no
- si Gemini falla, entra un respaldo para que el sitio no se rompa
- se agregó un archivo `.env.example` como guía

## 12) Qué no debes tocar
No cambies estos nombres:
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `NODE_ENV`

No cambies la ruta:
- `src/app/api/elena/chat/route.ts`

## 13) Recomendación final
Primero haz solo esto:
- subir ZIP
- pegar API key
- redeploy
- probar chat

Cuando eso ya funcione, luego vemos voz, WhatsApp, agenda o base de datos.
