# Guía de Despliegue en VPS | SpeakUp Express (Astro SSR)

Esta aplicación fue migrada a **Astro SSR con adaptador Node.js (`@astrojs/node`)** para permitir la colaboración multiusuario en tiempo real a través de un VPS sin necesidad de archivos `.bat` locales.

---

## 🚀 Características del Proyecto Astro

1. **Modo Standalone SSR:** Corre con un solo comando de Node (`node ./dist/server/entry.mjs`) o mediante `npm run start`.
2. **Endpoint de Sincronización en Tiempo Real (`/api/status`):**
   - **`GET /api/status`**: Devuelve los estados y notas actualizadas.
   - **`POST /api/status`**: Guarda cambios de estado, asignaciones de agentes y notas de seguimiento en `data/status-store.json`.
3. **Polling en Vivo (5s):** Cualquier agente que actualice un estado o deje una nota sincroniza automáticamente la pantalla de sus compañeros sin recargar.
4. **Persistencia en Disco:** Toda la información se guarda en `data/status-store.json`, sobreviviendo a reinicios del servidor.

---

## 🛠️ Requisitos en el VPS

- **Sistema Operativo:** Ubuntu 22.04 / 24.04 LTS, Debian, CentOS o cualquier Linux.
- **Node.js:** Versión 18.x o superior (recomendado Node 20 o 22 LTS).
- **Gestor de procesos (opcional pero recomendado):** `pm2` o `docker`.

---

## 📦 Opción 1: Despliegue Directo con Node / PM2 (Recomendado)

### 1. Clonar o subir la carpeta `astro-calendar` a tu VPS:
```bash
# Ejemplo con rsync o git
rsync -avz ./astro-calendar/ usuario@ip-de-tu-vps:/var/www/speakup-calendar
```

### 2. En el VPS, entrar e instalar dependencias:
```bash
cd /var/www/speakup-calendar
npm install
```

### 3. Compilar la aplicación Astro:
```bash
npm run build
```

### 4. Ejecutar en producción con PM2:
```bash
# Instalar pm2 si no lo tienes
sudo npm install -g pm2

# Iniciar la app con el archivo de configuración incluido
pm2 start ecosystem.config.cjs

# Guardar para que inicie automáticamente tras reinicios del VPS
pm2 save
pm2 startup
```

Tu aplicación estará corriendo en el puerto **`4321`** (o en el puerto que definas en la variable `PORT`).

---

## 🐳 Opción 2: Despliegue con Docker / Docker Compose

Si tu VPS tiene Docker instalado:

```bash
cd /var/www/speakup-calendar

# Construir y levantar en segundo plano
docker compose up -d --build
```

El volumen `./data:/app/data` garantiza que todas las notas y estados de tus compañeros se mantengan guardados en el disco del VPS.

---

## 🌐 Configuración con Nginx (Para dominio o puerto 80 / 443)

Si deseas apuntar un subdominio (ej. `eventos.tuempresa.com`):

```nginx
server {
    server_name eventos.tuempresa.com;

    location / {
        proxy_pass http://127.0.0.1:4321;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Luego habilitas SSL gratuito con Certbot:
```bash
sudo certbot --nginx -d eventos.tuempresa.com
```

---

## 👥 Cómo interactúan los agentes en el VPS

1. Cada agente ingresa a la URL de tu VPS desde su navegador.
2. Al abrir la ficha de un evento (*"Ficha & Bitácora de Equipo"*), escribe su nombre y sus notas.
3. Al hacer clic en *"Guardar Nota en Servidor"*, la información se guarda en el VPS y los demás compañeros la ven reflejada en su pantalla en segundos.
