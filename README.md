# Abasto Pedidos — Lupey

Web para que tus clientes hagan pedidos de verduras, tubérculos, frutas y especias, y a ti te lleguen ordenados en un Google Sheet (descargable como Excel en un clic).

## Qué incluye

- **index.html** → la página que le envías a tus clientes (ingresan su código, eligen productos, envían el pedido).
- **admin.html** → tu panel privado para crear clientes (código + negocio) y productos (con categoría, presentación y precio).
- **Code.gs** → el backend, en Google Apps Script, que guarda todo en un Google Sheet.

## Instalación (15 minutos, una sola vez)

### 1. Crea el Google Sheet + backend
1. Ve a [sheets.google.com](https://sheets.google.com) y crea una hoja de cálculo nueva. Ponle de nombre, por ejemplo, **"Abasto Pedidos — Datos"**.
2. Ve a **Extensiones → Apps Script**.
3. Borra todo el contenido que aparece por defecto y pega el contenido completo de `Code.gs`.
4. Dentro del código, busca la línea:
   ```
   const ADMIN_KEY = 'lupey2026';
   ```
   y cámbiala por una clave secreta tuya (esta es la "contraseña" para entrar a tu panel admin).
5. Guarda (ícono de disquete o Ctrl+S).
6. Arriba a la derecha, click en **Implementar → Nueva implementación**.
   - Tipo: **Aplicación web**.
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquier usuario**.
7. Click en **Implementar**. Te pedirá autorizar permisos — acepta (es tu propia cuenta).
8. Copia la **URL de la aplicación web** que te entrega (termina en `/exec`).

### 2. Conecta la web con el backend
1. Abre `index.html` en un editor de texto, busca la línea:
   ```
   const API_URL = 'PEGA_AQUI_TU_URL_DE_APPS_SCRIPT';
   ```
   y reemplázala con la URL que copiaste.
2. Haz lo mismo en `admin.html`.

### 3. Sube todo a GitHub Pages (como ya sueles hacer)
Sube `index.html` y `admin.html` a tu repositorio de GitHub Pages. Recomiendo:
- `index.html` en la raíz o en una carpeta tipo `/abasto/` → esta es la que le compartes a tus clientes.
- `admin.html` en una ruta que solo tú conozcas (ej. `/abasto/panel-lupey.html`) → no la publiques ni la compartas.

### 4. Carga tus productos y clientes
1. Abre `admin.html` en tu navegador, ingresa la clave que pusiste en `ADMIN_KEY`.
2. Pestaña **Productos**: agrega cada producto con su categoría, presentación y precio. Si "Papa" existe por Kilo y por Saco, agrégala dos veces (una por cada presentación) — ambas aparecerán juntas en el catálogo del cliente.
3. Pestaña **Clientes**: crea un código por cada negocio (ej. código `rosanautica` → razón social "Restaurante Rosa Náutica").

### 5. Comparte el link con tus clientes
Envíales el link de `index.html` por WhatsApp junto con su código de acceso. La primera vez lo ingresan, y su navegador lo recuerda para las próximas veces (si cambian de dispositivo, solo vuelven a ingresar el código).

## Cómo ver los pedidos

Todos los pedidos llegan como filas nuevas a la hoja **"Pedidos"** dentro de tu Google Sheet, con fecha, cliente, teléfono, producto, presentación, cantidad y subtotal. Para exportar a Excel: **Archivo → Descargar → Microsoft Excel (.xlsx)**.

## Notas

- Cada línea de un pedido con varios productos comparte el mismo `PedidoID`, así puedes agrupar pedidos completos si lo necesitas (ej. con una tabla dinámica).
- Puedes desactivar un cliente o producto sin borrarlo (útil si un producto se acaba de temporada).
- Si más adelante quieres conectar esto a Paqari, este mismo Google Sheet puede servir como fuente para un flujo de automatización (n8n/Apps Script) que suba los pedidos allá.
