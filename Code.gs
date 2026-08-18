/**
 * ABASTO PEDIDOS — Backend (Google Apps Script)
 * Lupey
 *
 * INSTRUCCIONES DE INSTALACIÓN (ver README.md para el detalle paso a paso):
 * 1. Crea una Hoja de Cálculo de Google nueva.
 * 2. Extensiones > Apps Script.
 * 3. Borra todo el contenido y pega este archivo completo.
 * 4. Cambia ADMIN_KEY más abajo por una clave secreta tuya.
 * 5. Implementar > Nueva implementación > Aplicación web.
 *    - Ejecutar como: Yo
 *    - Quién tiene acceso: Cualquier usuario
 * 6. Copia la URL que te da y pégala en index.html y admin.html (variable API_URL).
 */

// ⚠️ CAMBIA ESTA CLAVE por una tuya antes de publicar. Es la "contraseña" del panel admin.
const ADMIN_KEY = 'lupey2026';

const SHEET_PRODUCTOS = 'Productos';
const SHEET_CLIENTES = 'Clientes';
const SHEET_PEDIDOS = 'Pedidos';

function getSS_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getOrCreateSheet_(name, headers) {
  const ss = getSS_();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function ensureSheets_() {
  getOrCreateSheet_(SHEET_PRODUCTOS, ['ID', 'Producto', 'Categoria', 'Presentacion', 'Precio', 'Activo']);
  getOrCreateSheet_(SHEET_CLIENTES, ['Codigo', 'RazonSocial', 'Activo']);
  getOrCreateSheet_(SHEET_PEDIDOS, ['Fecha', 'PedidoID', 'Codigo', 'RazonSocial', 'Telefono', 'Producto', 'Presentacion', 'Cantidad', 'PrecioUnit', 'Subtotal']);
}

function sheetToObjects_(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  const rows = data.slice(1);
  return rows
    .filter(row => row.some(cell => cell !== '' && cell !== null))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  ensureSheets_();
  const action = e.parameter.action;

  if (action === 'catalogo') {
    const sheet = getOrCreateSheet_(SHEET_PRODUCTOS, ['ID', 'Producto', 'Categoria', 'Presentacion', 'Precio', 'Activo']);
    const productos = sheetToObjects_(sheet).filter(p => String(p.Activo).toUpperCase() !== 'NO');
    return jsonOut_({ ok: true, productos: productos });
  }

  if (action === 'cliente') {
    const codigo = String(e.parameter.codigo || '').trim().toLowerCase();
    const sheet = getOrCreateSheet_(SHEET_CLIENTES, ['Codigo', 'RazonSocial', 'Activo']);
    const clientes = sheetToObjects_(sheet);
    const match = clientes.find(c => String(c.Codigo).trim().toLowerCase() === codigo && String(c.Activo).toUpperCase() !== 'NO');
    if (match) {
      return jsonOut_({ ok: true, valido: true, razonSocial: match.RazonSocial });
    }
    return jsonOut_({ ok: true, valido: false });
  }

  if (action === 'admin_clientes') {
    if (e.parameter.key !== ADMIN_KEY) return jsonOut_({ ok: false, error: 'No autorizado' });
    const sheet = getOrCreateSheet_(SHEET_CLIENTES, ['Codigo', 'RazonSocial', 'Activo']);
    return jsonOut_({ ok: true, clientes: sheetToObjects_(sheet) });
  }

  if (action === 'admin_productos') {
    if (e.parameter.key !== ADMIN_KEY) return jsonOut_({ ok: false, error: 'No autorizado' });
    const sheet = getOrCreateSheet_(SHEET_PRODUCTOS, ['ID', 'Producto', 'Categoria', 'Presentacion', 'Precio', 'Activo']);
    return jsonOut_({ ok: true, productos: sheetToObjects_(sheet) });
  }

  return jsonOut_({ ok: false, error: 'Acción no reconocida' });
}

function doPost(e) {
  ensureSheets_();
  const body = JSON.parse(e.postData.contents);
  const action = body.action;

  if (action === 'pedido') {
    const sheet = getOrCreateSheet_(SHEET_PEDIDOS, ['Fecha', 'PedidoID', 'Codigo', 'RazonSocial', 'Telefono', 'Producto', 'Presentacion', 'Cantidad', 'PrecioUnit', 'Subtotal']);
    const fecha = new Date();
    const pedidoId = Utilities.getUuid().slice(0, 8);
    body.items.forEach(item => {
      sheet.appendRow([
        fecha,
        pedidoId,
        body.codigo,
        body.razonSocial,
        body.telefono,
        item.producto,
        item.presentacion,
        item.cantidad,
        item.precioUnit,
        Number(item.cantidad) * Number(item.precioUnit)
      ]);
    });
    return jsonOut_({ ok: true, pedidoId: pedidoId });
  }

  if (action === 'admin_guardarCliente') {
    if (body.key !== ADMIN_KEY) return jsonOut_({ ok: false, error: 'No autorizado' });
    const sheet = getOrCreateSheet_(SHEET_CLIENTES, ['Codigo', 'RazonSocial', 'Activo']);
    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim().toLowerCase() === String(body.codigoOriginal || body.codigo).trim().toLowerCase()) {
        rowIndex = i + 1;
        break;
      }
    }
    const rowData = [body.codigo, body.razonSocial, body.activo === false ? 'NO' : 'SI'];
    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, 3).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }
    return jsonOut_({ ok: true });
  }

  if (action === 'admin_guardarProducto') {
    if (body.key !== ADMIN_KEY) return jsonOut_({ ok: false, error: 'No autorizado' });
    const sheet = getOrCreateSheet_(SHEET_PRODUCTOS, ['ID', 'Producto', 'Categoria', 'Presentacion', 'Precio', 'Activo']);
    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;
    let id = body.id;
    if (!id) {
      id = Utilities.getUuid().slice(0, 6);
    } else {
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(id)) {
          rowIndex = i + 1;
          break;
        }
      }
    }
    const rowData = [id, body.producto, body.categoria, body.presentacion, body.precio, body.activo === false ? 'NO' : 'SI'];
    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, 6).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }
    return jsonOut_({ ok: true, id: id });
  }

  return jsonOut_({ ok: false, error: 'Acción no reconocida' });
}
