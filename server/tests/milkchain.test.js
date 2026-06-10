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
// 1. SIMULACIÓN DE LA BASE DE DATOS (MOCKS)
// =====================================================================================
// Creamos una función espía (mock) para simular las consultas SQL (query)
const mockQuery = jest.fn();

// Simulamos una conexión a la base de datos (con transacciones)
const mockConnection = {
  query: mockQuery,
  release: jest.fn(),
  beginTransaction: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn(),
};

// Simulamos el "pool" que gestiona las conexiones en db.js
const mockPool = {
  query: mockQuery,
  getConnection: jest.fn().mockResolvedValue(mockConnection),
};

// Le decimos a Jest que cuando un archivo importe '../src/db.js', le entregue nuestro mockPool
jest.unstable_mockModule("../src/db.js", () => ({
  pool: mockPool,
}));

// =====================================================================================
// 2. SIMULACIÓN DE OTRAS LIBRERÍAS (JWT Y PDF)
// =====================================================================================
jest.unstable_mockModule("../src/libs/jwt.js", () => ({
  createAccessToken: jest.fn().mockResolvedValue("fake.jwt.token"),
}));

jest.unstable_mockModule("../src/config.js", () => ({
  TOKEN_SECRET: "test_secret",
}));

// Evitamos que intente crear o guardar un PDF real durante las pruebas
jest.unstable_mockModule("jspdf", () => ({ default: jest.fn() }));
jest.unstable_mockModule("jspdf-autotable", () => ({}));


// =====================================================================================
// 3. IMPORTACIÓN DE CONTROLADORES
// =====================================================================================
// Importamos dinámicamente los controladores después de configurar todos los mocks
const { finalizarPedido, guardarDireccion, actualizarEstado } = await import("../src/controllers/pago.controlador.js");


// =====================================================================================
// 4. FUNCIÓN PARA SIMULAR LA RESPUESTA DE EXPRESS (res)
// =====================================================================================
// Express responde usando res.status().json(). Esta función simula ese comportamiento.
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockImplementation((code) => {
    console.log(`      [Respuesta HTTP] Código de Estado: ${code}`);
    return res;
  });
  res.json   = jest.fn().mockImplementation((data) => {
    console.log(`      [Respuesta HTTP] Cuerpo JSON:`, JSON.stringify(data, null, 2));
    return res;
  });
  return res;
};


// =====================================================================================
// PRUEBAS DE "finalizarPedido" (PROCESAMIENTO DE COMPRAS)
// =====================================================================================
describe("Controlador: finalizarPedido()", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Debe fallar (status 500) si el stock en base de datos es menor a la cantidad pedida", async () => {
    // Simulamos las respuestas de la base de datos para esta prueba:
    mockQuery
      .mockResolvedValueOnce([{ insertId: 99 }])   // 1. crearPedido: insert exitoso con ID 99
      .mockResolvedValueOnce([{}])                  // 2. registrarDetalles: insert exitoso
      .mockResolvedValueOnce([[{ stock: 3 }]]);     // 3. validarStockDisponibilidad: stock actual es 3

    // Petición de ejemplo con cantidad = 10 (mayor al stock de 3)
    const req = {
      body: {
        id_usuario: 1,
        id_metodo_pago: 1,
        Total: 5000,
        detalles: [{ id_producto: 5, Cantidad: 10, Precio_Unitario: 500 }],
      },
    };
    const res = mockRes();

    await finalizarPedido(req, res);

    // Verificamos que se canceló la transacción (rollback) y se devolvió un error de servidor (500)
    expect(mockConnection.rollback).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Stock insuficiente"),
      })
    );
  });

  test("Debe dar error (status 400) si falta el id_usuario en la petición", async () => {
    const req = {
      body: {
        id_metodo_pago: 1,
        Total: 1000,
        detalles: [{ id_producto: 1, Cantidad: 1, Precio_Unitario: 1000 }],
      },
    };
    const res = mockRes();

    await finalizarPedido(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("Debe dar error (status 400) si el carrito de compras está vacío", async () => {
    const req = {
      body: {
        id_usuario: 1,
        id_metodo_pago: 1,
        Total: 0,
        detalles: [],
      },
    };
    const res = mockRes();

    await finalizarPedido(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});


// =====================================================================================
// PRUEBAS DE "guardarDireccion" (REGISTRO DE DIRECCIONES)
// =====================================================================================
describe("Controlador: guardarDireccion()", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Debe guardar la dirección con éxito (status 201) si los datos son correctos", async () => {
    // Simulamos que el INSERT de la dirección devuelve insertId = 42
    mockPool.query.mockResolvedValueOnce([{ insertId: 42 }]);

    const req = {
      body: {
        calle: "Av. Siempre Viva",
        numero: 742,
        telefono: "12345678",
        id_localidad: 3,
        id_usuario: 10,
      },
    };
    const res = mockRes();

    await guardarDireccion(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 42 });
  });

  test("Debe dar error (status 400) si faltan campos obligatorios", async () => {
    const req = {
      body: {
        numero: 742,
        id_localidad: 3,
      },
    };
    const res = mockRes();

    await guardarDireccion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Campos no válidos" });
  });
});


// =====================================================================================
// PRUEBAS DE "actualizarEstado" (GESTIÓN DE LOGÍSTICA)
// =====================================================================================
describe("Controlador: actualizarEstado()", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Debe cambiar el estado del pedido con éxito (status 200)", async () => {
    // Simulamos: 1. SELECT devuelve estado actual (1), 2. UPDATE exitoso
    mockPool.query
      .mockResolvedValueOnce([[{ id_estado: 1 }]])
      .mockResolvedValueOnce([{}]);

    const req = {
      params: { id: 20 },
      body: { nuevoEstadoId: 2 },
    };
    const res = mockRes();

    await actualizarEstado(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Estado actualizado correctamente",
      id_estado: 2,
    });
  });

  test("Debe dar error (status 400) si no se seleccionó ningún estado nuevo", async () => {
    const req = {
      params: { id: 20 },
      body: { nuevoEstadoId: "" },
    };
    const res = mockRes();

    await actualizarEstado(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("Debe dar error 404 si el pedido no existe en la base de datos", async () => {
    // Simulamos que el SELECT de búsqueda devuelve vacío (pedido no encontrado)
    mockPool.query.mockResolvedValueOnce([[]]);

    const req = {
      params: { id: 999 },
      body: { nuevoEstadoId: 2 },
    };
    const res = mockRes();

    await actualizarEstado(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Pedido no encontrado" });
  });

  test("Debe dar error 400 si intentamos cambiar al mismo estado actual del pedido", async () => {
    // Simulamos que el SELECT devuelve que el estado actual ya es 2
    mockPool.query.mockResolvedValueOnce([[{ id_estado: 2 }]]);

    const req = {
      params: { id: 20 },
      body: { nuevoEstadoId: 2 },
    };
    const res = mockRes();

    await actualizarEstado(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "El pedido ya se encuentra en ese estado" });
  });
});
