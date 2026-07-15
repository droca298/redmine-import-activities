# Redmine – Importador masivo de imputaciones

Aplicación web para importar de forma masiva "time entries" (imputaciones de horas/actividades) en Redmine mediante una plantilla Excel, y para consultar las imputaciones propias por rango de fechas.

## Arquitectura

- `server/`: backend Express (TypeScript) que actúa de proxy hacia la API REST de Redmine.
- `client/`: frontend React + Vite (TypeScript).

La API key y la URL de Redmine se configuran en la propia app (pestaña "Ajustes") y se guardan solo en el navegador (localStorage) si se marca "Recordar". El backend no las persiste: las recibe en cada petición vía headers y las reenvía a Redmine.

## Puesta en marcha

```bash
npm install
npm run dev
```

Esto levanta:
- Backend en `http://localhost:3001`
- Frontend (Vite) en `http://localhost:5173`, accesible también desde otros dispositivos de tu misma red LAN usando la IP que Vite imprime en consola (gracias a `--host`).

Abre la URL de Vite desde el navegador de cualquier dispositivo (PC, móvil, tablet) de tu red local.

## Errores de certificado TLS al conectar con Redmine

Si al "Probar conexión" (o al usar cualquier pestaña) ves un error de certificado (`unable to verify the first certificate` / `UNABLE_TO_VERIFY_LEAF_SIGNATURE`), significa que el servidor Redmine no está enviando la cadena de certificados completa (falta el certificado intermedio). Los navegadores lo toleran (ya tienen o completan ese certificado intermedio automáticamente), pero Node.js no lo hace por defecto.

**Solución correcta**: pide a quien administre el servidor/proxy de Redmine que sirva la cadena completa (certificado del servidor + intermedio(s)), o consigue el certificado raíz/intermedio de la CA interna y arranca el backend con:

```bash
NODE_EXTRA_CA_CERTS=/ruta/a/ca-interna.pem npm run dev --workspace=server
```

**Solución rápida (solo para redes internas de confianza)**: si es una red interna controlada y asumes el riesgo de no verificar el certificado, crea un fichero `server/.env` con:

```
REDMINE_ALLOW_INSECURE_TLS=true
```

y reinicia el backend. Esto desactiva la verificación del certificado **solo** para las llamadas a Redmine, no afecta a nada más de la app. No lo uses si Redmine es accesible por una red que no controlas.

## Uso

1. **Ajustes**: introduce la URL base de tu Redmine (p.ej. `https://redmine.dominio.dorlet.com`) y tu API key personal (Mi cuenta > API access key en Redmine). Marca "Recordar" si quieres que se guarde en este navegador.
2. **Importar**: descarga la plantilla Excel (incluye tus proyectos y actividades reales como referencia/desplegable), rellénala con tus imputaciones del mes, y súbela pulsando "Importar". La barra de progreso y la tabla de resultados muestran el estado fila a fila.
3. **Consultar**: elige un rango de fechas (desde/hasta) para ver tus imputaciones ya registradas en Redmine en ese periodo, con el total de horas.

## Despliegue para compartir con compañeros (solo red/VPN de la empresa)

En producción, un único proceso Node sirve tanto la API como el frontend ya compilado (nada de puertos separados ni proxy de Vite).

### 1. Compilar

```bash
npm install
npm run build
```

Esto genera `server/dist` (backend compilado) y `client/dist` (frontend estático), que el propio servidor Express sirve automáticamente si detecta esa carpeta.

### 2. Configurar (opcional)

Crea `server/.env` si necesitas fijar el puerto o el workaround de TLS visto arriba:

```
PORT=3001
REDMINE_ALLOW_INSECURE_TLS=true
```

### 3. Arrancar

```bash
npm start
```

Esto ejecuta `node server/dist/index.js`, escuchando en `0.0.0.0:3001` (o el `PORT` que hayas fijado) — accesible por IP desde cualquier equipo de tu misma red/VPN, no solo `localhost`.

### 4. Mantenerlo arrancado (sobrevivir a cierres de sesión/reinicios)

Con [pm2](https://pm2.keymetrics.io/):

```bash
npm install -g pm2
pm2 start server/dist/index.js --name redmine-import
pm2 save
pm2-startup install   # (usa el paquete "pm2-windows-startup" en Windows para que arranque solo)
```

Alternativa sin instalar nada extra: crea una tarea en el Programador de tareas de Windows que ejecute `npm start` desde la carpeta del proyecto al iniciar sesión.

### 5. Abrir el puerto en el firewall de Windows

Por defecto, Windows bloqueará las conexiones entrantes de otros equipos a ese puerto. Abre PowerShell **como administrador** y ejecuta:

```powershell
New-NetFirewallRule -DisplayName "Redmine Import Activities" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow -Profile Private,Domain
```

(Ajusta `3001` si usaste otro `PORT`. No lo abras en el perfil "Public" si tu portátil se conecta también a redes públicas.)

### 6. Averiguar la IP para compartir el enlace

```powershell
ipconfig
```

Busca la IP de tu adaptador de red de la empresa/VPN (normalmente algo como `10.x.x.x` o `192.168.x.x`). El enlace a compartir con tus compañeros conectados a la misma VPN/red será:

```
http://<tu-ip>:3001
```

Pide a un compañero conectado a la VPN que lo pruebe antes de darlo por bueno — según cómo esté montada la VPN de tu empresa (acceso remoto vs. red completa), puede que necesites confirmar con IT que tu IP es alcanzable desde fuera de tu propia máquina. Si tu IP cambia con el tiempo (DHCP), pide a IT una IP fija o resérvala en el router, para que el enlace no cambie.

### Notas de seguridad

- Cada compañero configura su **propia** API key en la pestaña Ajustes de su navegador — no se comparte ninguna credencial entre usuarios ni se guarda en el servidor.
- El tráfico va en HTTP plano dentro de tu red/VPN (no HTTPS). Si tu VPN ya cifra el túnel hasta la puerta de enlace de la empresa, el riesgo añadido es bajo, pero si te preocupa que otros equipos de la misma LAN puedan husmear el tráfico, puedes poner un proxy inverso (Caddy o Nginx) delante con un certificado (autofirmado o de una CA interna) para servir en HTTPS. Dilo si quieres que te lo monte.
