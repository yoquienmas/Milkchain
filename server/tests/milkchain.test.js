import { jest } from "@jest/globals";

// =====================================================================================
//  1. SIMULACIÓN DE LA BASE DE DATOS (MOCK DE LA BASE DE DATOS)
// =====================================================================================
const mockQuery = jest.fn();

const mockConnection = {
  query: mockQuery,
  release: jest.fn(),
  beginTransaction: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn(),
};

const mockPool = {
  query: mockQuery,
  getConnection: jest.fn().mockResolvedValue(mockConnection),
};

jest.unstable_mockModule("../src/db.js", () => ({
  pool: mockPool,
}));

// =====================================================================================
//  2. SIMULACIÓN DE OTRAS LIBRERÍAS (JWT Y PDF)
// =====================================================================================
jest.unstable_mockModule("../src/libs/jwt.js", () => ({
  createAccessToken: jest.fn().mockResolvedValue("fake.jwt.token"),
}));

jest.unstable_mockModule("../src/config.js", () => ({
  TOKEN_SECRET: "test_secret",
}));

jest.unstable_mockModule("jspdf", () => ({ default: jest.fn() }));
jest.unstable_mockModule("jspdf-autotable", () => ({}));


// =====================================================================================
//  3. CARGA DINÁMICA DE CONTROLADORES BAJO PRUEBA
// =====================================================================================
const { finalizarPedido, guardarDireccion, actualizarEstado } = await import("../src/controllers/pago.controlador.js");


// =====================================================================================
//  4. CREACIÓN DE PETICIONES Y RESPUESTAS SIMULADAS DE EXPRESS (REQ y RES)
// =====================================================================================
const crearRespuestaFalsa = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json    = jest.fn().mockReturnValue(res);
  res.cookie  = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  return res;
};


// =====================================================================================
//  PRUEBA 1 — finalizarPedido() - Validación de Stock
// =====================================================================================
describe("PRUEBA 1 — finalizarPedido() - Validación de Stock", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Debe retornar status 500 y hacer rollback si la cantidad pedida supera el stock real", async () => {
    mockQuery
      .mockResolvedValueOnce([{ insertId: 99 }])   
      .mockResolvedValueOnce([{}])                  
      .mockResolvedValueOnce([[{ stock: 3 }]]);     

    const req = {
      body: {
        id_usuario: 1,
        id_metodo_pago: 1,
        Total: 5000,
        detalles: [
          { id_producto: 5, Cantidad: 10, Precio_Unitario: 500 },
        ],
      },
    };
    const res = crearRespuestaFalsa();

    await finalizarPedido(req, res);

    expect(mockConnection.rollback).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Stock insuficiente"),
      })
    );
  });
});


// =====================================================================================
//  PRUEBA 2 — finalizarPedido() - Campos Obligatorios
// =====================================================================================
describe("PRUEBA 2 — finalizarPedido() - Campos Obligatorios", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Debe retornar status 400 si falta el id_usuario en la petición", async () => {
    const req = {
      body: {
        id_metodo_pago: 1,
        Total: 1000,
        detalles: [{ id_producto: 1, Cantidad: 1, Precio_Unitario: 1000 }],
      },
    };
    const res = crearRespuestaFalsa();

    await finalizarPedido(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockPool.getConnection).not.toHaveBeenCalled();
  });

  test("Debe retornar status 400 si el carrito de detalles llega vacío", async () => {
    const req = {
      body: {
        id_usuario: 1,
        id_metodo_pago: 1,
        Total: 0,
        detalles: [],
      },
    };
    const res = crearRespuestaFalsa();

    await finalizarPedido(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});


// =====================================================================================
//  PRUEBA 3 — guardarDireccion()
// =====================================================================================
describe("PRUEBA 3 — guardarDireccion()", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Debe retornar status 201 y el ID de dirección si todos los campos son válidos", async () => {
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
    const res = crearRespuestaFalsa();

    await guardarDireccion(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 42 });
  });

  test("Debe retornar status 400 y el mensaje 'Campos no válidos' si faltan datos requeridos", async () => {
    const req = {
      body: {
        numero: 742,
        id_localidad: 3,
      },
    };
    const res = crearRespuestaFalsa();

    await guardarDireccion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Campos no válidos" });
  });
});


// =====================================================================================
//  PRUEBA 4 — actualizarEstado()
// =====================================================================================
describe("PRUEBA 4 — actualizarEstado()", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Debe retornar status 200 y confirmar si el estado del pedido cambia con éxito", async () => {
    mockPool.query
      .mockResolvedValueOnce([[{ id_estado: 1 }]])
      .mockResolvedValueOnce([{}]);

    const req = {
      params: { id: 20 },
      body: { nuevoEstadoId: 2 },
    };
    const res = crearRespuestaFalsa();

    await actualizarEstado(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Estado actualizado correctamente",
      id_estado: 2,
    });
  });

  test("Debe retornar status 400 y el mensaje 'Campos no válidos' si no se selecciona ningún estado", async () => {
    const req = {
      params: { id: 20 },
      body: { nuevoEstadoId: "" },
    };
    const res = crearRespuestaFalsa();

    await actualizarEstado(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Campos no válidos" });
  });

  test("Debe retornar status 404 y el mensaje 'Pedido no encontrado' si el pedido no existe en la base de datos", async () => {
    mockPool.query.mockResolvedValueOnce([[]]);

    const req = {
      params: { id: 999 },
      body: { nuevoEstadoId: 2 },
    };
    const res = crearRespuestaFalsa();

    await actualizarEstado(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Pedido no encontrado" });
  });

  test("Debe retornar status 400 y el mensaje 'El pedido ya se encuentra en ese estado' si el nuevo estado es idéntico al actual", async () => {
    mockPool.query.mockResolvedValueOnce([[{ id_estado: 2 }]]);

    const req = {
      params: { id: 20 },
      body: { nuevoEstadoId: 2 },
    };
    const res = crearRespuestaFalsa();

    await actualizarEstado(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "El pedido ya se encuentra en ese estado" });
  });
});
