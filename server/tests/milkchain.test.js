/**
 * =====================================================================
 *  Pruebas Unitarias — MilkChain Backend
 *  Framework : Jest (con mocks manuales para aislar la BD y bcrypt)
 *  Autor     : Maria Daniela Fernandez Gotusso
 *  Fecha     : 03/06/2026
 *
 *  Prueba 1: login()          → 400 si el email no existe en BD
 *  Prueba 2: validarStock()   → lanza Error si stock insuficiente
 *  Prueba 3: finalizarPedido()→ 400 si faltan datos obligatorios
 * =====================================================================
 */

import { jest } from "@jest/globals";

// =====================================================================================
//  1. SIMULACIÓN DE LA BASE DE DATOS (MOCK DE LA BASE DE DATOS)
// =====================================================================================
// ¿Por qué hacemos esto? 
// Para que los tests no dependan de una base de datos real. Así, no necesitamos tener 
// encendido MySQL. Creamos una base de datos de juguete (mockPool) que simula estar activa.

// "mockQuery" será la función espía que simulará responder a las consultas SQL.
const mockQuery = jest.fn();

// Cuando una función realiza una compra, inicia una transacción en MySQL.
// Simulamos el objeto de conexión individual que Express obtiene de la base de datos.
const mockConnection = {
  query: mockQuery,
  release: jest.fn(),             // Simula liberar la conexión y devolverla al pool
  beginTransaction: jest.fn(),    // Simula el inicio de la transacción ("Todo o nada")
  commit: jest.fn(),              // Simula guardar de forma permanente los cambios
  rollback: jest.fn(),            // Simula deshacer y borrar los cambios si ocurre un error
};

// Simulamos el pool de conexiones general de la base de datos.
const mockPool = {
  query: mockQuery,
  // Cuando el código haga "await pool.getConnection()", le entregamos la conexión falsa de arriba.
  getConnection: jest.fn().mockResolvedValue(mockConnection),
};

// Reemplazamos el archivo real de base de datos "../src/db.js" por nuestro mock simulado.
// A partir de ahora, cualquier importación de la BD recibirá este mockPool de mentira.
jest.unstable_mockModule("../src/db.js", () => ({
  pool: mockPool,
}));


// =====================================================================================
//  2. SIMULACIÓN DE OTRAS LIBRERÍAS (JWT Y PDF)
// =====================================================================================
// Simulamos librerías externas para evitar errores y hacer que las pruebas corran al instante.

// Simula la creación del token de sesión de forma rápida.
jest.unstable_mockModule("../src/libs/jwt.js", () => ({
  createAccessToken: jest.fn().mockResolvedValue("fake.jwt.token"),
}));

// Clave secreta estática para firmar tokens en entorno de pruebas.
jest.unstable_mockModule("../src/config.js", () => ({
  TOKEN_SECRET: "test_secret",
}));

// Reemplazamos las librerías de generación de PDFs por funciones vacías,
// ya que en los tests unitarios no queremos crear ni descargar archivos PDF reales.
jest.unstable_mockModule("jspdf", () => ({ default: jest.fn() }));
jest.unstable_mockModule("jspdf-autotable", () => ({}));


// =====================================================================================
//  3. CARGA DINÁMICA DE CONTROLADORES BAJO PRUEBA
// =====================================================================================
// IMPORTANTE: En ES Modules de Node.js, debemos importar las funciones reales del proyecto
// de forma dinámica con "await import" DESPUÉS de haber definido los mocks anteriores.
const { finalizarPedido, guardarDireccion, actualizarEstado } = await import("../src/controllers/pago.controlador.js");


// =====================================================================================
//  4. CREACIÓN DE PETICIONES Y RESPUESTAS SIMULADAS DE EXPRESS (REQ y RES)
// =====================================================================================
// Express requiere los parámetros (req, res). Esta función crea un objeto "res" falso
// equipado con funciones espía de Jest (jest.fn()) para comprobar qué respondió el servidor.
const crearRespuestaFalsa = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);      // Permite encadenar llamadas: res.status().json()
  res.json    = jest.fn().mockReturnValue(res);      // Registra qué datos JSON se le enviaron al cliente
  res.cookie  = jest.fn().mockReturnValue(res);      // Registra si se enviaron cookies
  res.sendStatus = jest.fn().mockReturnValue(res);  // Registra códigos de estado rápidos
  return res;
};


// =====================================================================================
//  PRUEBA 1 — finalizarPedido(): Validación de Stock (Flujo Alternativo / Excepción)
// =====================================================================================
describe("PRUEBA 1 — finalizarPedido() - Validación de Stock", () => {
  // Antes de cada test, limpiamos los registros de llamadas anteriores para iniciar desde cero.
  beforeEach(() => jest.clearAllMocks());

  test("Debe retornar status 500 y hacer rollback si la cantidad pedida supera el stock real", async () => {
    // 1. SIMULACIÓN: Programamos a la base de datos simulada para que responda 3 consultas seguidas:
    //    - Consulta 1 (Crear Pedido): INSERT exitoso, devuelve ID del pedido = 99.
    //    - Consulta 2 (Detalles): INSERT exitoso.
    //    - Consulta 3 (Verificar Stock): Devuelve que en la base de datos solo quedan 3 unidades.
    mockQuery
      .mockResolvedValueOnce([{ insertId: 99 }])   
      .mockResolvedValueOnce([{}])                  
      .mockResolvedValueOnce([[{ stock: 3 }]]);     

    // 2. ENTRADA: El cliente envía un pedido solicitando comprar 10 unidades.
    const req = {
      body: {
        id_usuario: 1,
        id_metodo_pago: 1,
        Total: 5000,
        detalles: [
          { id_producto: 5, Cantidad: 10, Precio_Unitario: 500 }, // Cantidad pedida: 10 (supera el stock de 3)
        ],
      },
    };
    const res = crearRespuestaFalsa();

    // 3. EJECUCIÓN: Llamamos a la función real del servidor.
    await finalizarPedido(req, res);

    // 4. VERIFICACIÓN:
    // - Al no haber stock, el sistema debió ejecutar rollback() para borrar los inserts del paso 1 y 2.
    expect(mockConnection.rollback).toHaveBeenCalled();
    // - El servidor debió retornar status de error 500.
    expect(res.status).toHaveBeenCalledWith(500);
    // - La respuesta JSON debió contener el mensaje de "Stock insuficiente".
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Stock insuficiente"),
      })
    );
  });
});


// =====================================================================================
//  PRUEBA 2 — finalizarPedido(): Validación de Campos Obligatorios
// =====================================================================================
describe("PRUEBA 2 — finalizarPedido() - Campos Obligatorios", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Debe retornar status 400 si falta el id_usuario en la petición", async () => {
    // 1. ENTRADA: Enviamos datos de compra, pero omitimos el campo id_usuario.
    const req = {
      body: {
        id_metodo_pago: 1,
        Total: 1000,
        detalles: [{ id_producto: 1, Cantidad: 1, Precio_Unitario: 1000 }],
      },
    };
    const res = crearRespuestaFalsa();

    // 2. EJECUCIÓN: Procesamos el pedido.
    await finalizarPedido(req, res);

    // 3. VERIFICACIÓN:
    // - El servidor debió rechazarlo con status 400.
    expect(res.status).toHaveBeenCalledWith(400);
    // - La base de datos nunca debió ser consultada porque la validación frena la petición antes.
    expect(mockPool.getConnection).not.toHaveBeenCalled();
  });

  test("Debe retornar status 400 si el carrito de detalles llega vacío", async () => {
    // 1. ENTRADA: Enviamos la petición pero con el carrito de productos vacío.
    const req = {
      body: {
        id_usuario: 1,
        id_metodo_pago: 1,
        Total: 0,
        detalles: [], // Carrito vacío
      },
    };
    const res = crearRespuestaFalsa();

    // 2. EJECUCIÓN: Procesamos la petición.
    await finalizarPedido(req, res);

    // 3. VERIFICACIÓN:
    // - Debe responder con status 400 de petición incorrecta.
    expect(res.status).toHaveBeenCalledWith(400);
  });
});


// =====================================================================================
//  PRUEBA 3 — guardarDireccion(): Flujo Normal y Excepciones
// =====================================================================================
describe("PRUEBA 3 — guardarDireccion()", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Debe retornar status 201 y el ID de dirección si todos los campos son válidos", async () => {
    // 1. SIMULACIÓN: Simulamos que la inserción de la dirección en la BD devuelve el ID = 42.
    mockPool.query.mockResolvedValueOnce([{ insertId: 42 }]);

    // 2. ENTRADA: Enviamos todos los datos requeridos por el contrato.
    const req = {
      body: {
        calle: "Av. Siempre Viva",
        numero: 742,
        telefono: "12345678",
        id_localidad: 3,
        id_usuario: 10,
      },
    };
    const res = crearRespuestaFalsa();

    // 3. EJECUCIÓN: Llamamos a la función.
    await guardarDireccion(req, res);

    // 4. VERIFICACIÓN:
    // - Debe responder con código 201 (Creado con éxito).
    expect(res.status).toHaveBeenCalledWith(201);
    // - El JSON debe retornar el ID de la dirección insertada (42).
    expect(res.json).toHaveBeenCalledWith({ id: 42 });
  });

  test("Debe retornar status 400 y el mensaje 'Campos no válidos' si faltan datos requeridos", async () => {
    // 1. ENTRADA: Enviamos el formulario omitiendo la calle, el teléfono y el usuario.
    const req = {
      body: {
        numero: 742,
        id_localidad: 3,
      },
    };
    const res = crearRespuestaFalsa();

    // 2. EJECUCIÓN: Intentamos guardar la dirección incompleta.
    await guardarDireccion(req, res);

    // 3. VERIFICACIÓN:
    // - El servidor debe rechazar la petición con status 400 y mandar el mensaje de campos no válidos.
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Campos no válidos" });
  });
});


// =====================================================================================
//  PRUEBA 4 — actualizarEstado(): Flujo Normal y Excepciones
// =====================================================================================
describe("PRUEBA 4 — actualizarEstado()", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Debe retornar status 200 y confirmar si el estado del pedido cambia con éxito", async () => {
    // 1. SIMULACIÓN: La base de datos responde al SELECT con el estado actual (1) y acepta el UPDATE.
    mockPool.query
      .mockResolvedValueOnce([[{ id_estado: 1 }]])
      .mockResolvedValueOnce([{}]);

    // 2. ENTRADA: Enviamos el ID del pedido a actualizar (20) y el nuevo ID del estado (2).
    const req = {
      params: { id: 20 },
      body: { nuevoEstadoId: 2 },
    };
    const res = crearRespuestaFalsa();

    // 3. EJECUCIÓN: Llamamos al controlador de actualizarEstado.
    await actualizarEstado(req, res);

    // 4. VERIFICACIÓN:
    // - El JSON de respuesta debe confirmar el éxito y el ID del nuevo estado.
    expect(res.json).toHaveBeenCalledWith({
      message: "Estado actualizado correctamente",
      id_estado: 2,
    });
  });

  test("Debe retornar status 400 y el mensaje 'Campos no válidos' si no se selecciona ningún estado", async () => {
    // 1. ENTRADA: El administrador no elige ninguna opción (envía un string vacío en el formulario).
    const req = {
      params: { id: 20 },
      body: { nuevoEstadoId: "" }, // Estado vacío
    };
    const res = crearRespuestaFalsa();

    // 2. EJECUCIÓN: Intentamos actualizar.
    await actualizarEstado(req, res);

    // 3. VERIFICACIÓN:
    // - El servidor bloquea el guardado retornando status 400 y mensaje de error de selección.
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Campos no válidos" });
    // - La base de datos no se consulta ya que falla la validación previa.
    expect(mockPool.query).not.toHaveBeenCalled();
  });

  test("Debe retornar status 404 y el mensaje 'Pedido no encontrado' si el pedido no existe en la base de datos", async () => {
    // 1. SIMULACIÓN: La base de datos responde con 0 filas para la búsqueda (pedido no existe).
    mockPool.query.mockResolvedValueOnce([[]]);

    // 2. ENTRADA: Enviamos el ID de un pedido inexistente (e.g. 999).
    const req = {
      params: { id: 999 },
      body: { nuevoEstadoId: 2 },
    };
    const res = crearRespuestaFalsa();

    // 3. EJECUCIÓN: Intentamos actualizar.
    await actualizarEstado(req, res);

    // 4. VERIFICACIÓN:
    // - Debe responder con status 404.
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Pedido no encontrado" });
  });

  test("Debe retornar status 400 y el mensaje 'El pedido ya se encuentra en ese estado' si el nuevo estado es idéntico al actual", async () => {
    // 1. SIMULACIÓN: El pedido ya tiene estado 2 en la base de datos.
    mockPool.query.mockResolvedValueOnce([[{ id_estado: 2 }]]);

    // 2. ENTRADA: Enviamos nuevoEstadoId: 2 (el mismo estado).
    const req = {
      params: { id: 20 },
      body: { nuevoEstadoId: 2 },
    };
    const res = crearRespuestaFalsa();

    // 3. EJECUCIÓN: Intentamos actualizar.
    await actualizarEstado(req, res);

    // 4. VERIFICACIÓN:
    // - Debe responder con status 400.
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "El pedido ya se encuentra en ese estado" });
  });
});
