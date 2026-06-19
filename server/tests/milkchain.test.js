/**
 * =====================================================================
 *  Pruebas Unitarias — MilkChain Backend
 *  Framework : Jest (con mocks manuales para aislar la BD y bcrypt)
 *  Autor     : Maria Daniela Fernandez Gotusso
 *  Fecha     : 03/06/2026
 *
 *  Prueba 1: iniciarSesion()   → 400 si el email no existe en BD
 *  Prueba 2: validarStock()   → lanza Error si stock insuficiente
 *  Prueba 3: crearPedido()     → retorna insertId, o falla ante errores de BD
 * =====================================================================
 */

import { jest } from "@jest/globals";

// ===========================================
// 1. SIMULACIÓN DE LA BASE DE DATOS (MOCKS)
// ===========================================
// Creamos una función espía o de mentira (mock) para simular las consultas SQL queris
const mockQuery = jest.fn();

// Simulamos una conexión a la base de datos (con transacciones)
const mockConnection ={
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

// ===========================================
// 2. SIMULACIÓN DE OTRAS LIBRERÍAS (JWT Y PDF)
// ===========================================
jest.unstable_mockModule("../src/libs/jwt.js", () => ({
  crearTokenAcceso: jest.fn().mockResolvedValue("fake.jwt.token"),
}));

jest.unstable_mockModule("../src/config.js", () => ({
  TOKEN_SECRET: "test_secret",
}));

// Evitamos que intente crear o guardar un PDF real durante las pruebas
jest.unstable_mockModule("jspdf", () => ({ default: jest.fn() }));
jest.unstable_mockModule("jspdf-autotable", () => ({}));


// ===========================================
// 3. IMPORTACIÓN DE CONTROLADORES
// ===========================================
// Importamos dinámicamente los controladores después de configurar todos los mocks
const { crearPedido, finalizarPedido, guardarDireccion, actualizarEstado } = await import("../src/controllers/pago.controlador.js");


// ===========================================
// 4. FUNCIÓN PARA SIMULAR LA RESPUESTA DE EXPRESS (res)
// ===========================================
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


// ===========================================
// PRUEBAS DE "crearPedido" (PASO 5.1 - CREACIÓN DE CABECERA DE PEDIDO)
// ===========================================
describe("Función: crearPedido()", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Debe crear un pedido con éxito y retornar el insertId", async () => {
    // Simulamos la respuesta de la base de datos al realizar la inserción
    mockQuery.mockResolvedValueOnce([{ insertId: 10 }, undefined]);

    const total = 5000;
    const id_usuario = 1;
    const id_metodo_pago = 2;

    const result = await crearPedido(mockConnection, total, id_usuario, id_metodo_pago);

    // Verificamos que se llamó a la base de datos con los datos correspondientes
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO pedido"),
      [total, id_usuario, id_metodo_pago]
    );
    // Verificamos que retornó el id del pedido insertado
    expect(result).toBe(10);
  });

  test("Debe lanzar un error si la consulta SQL falla por falta de id_usuario", async () => {
    // Simulamos un error de restricción de clave foránea o columna no nula
    mockQuery.mockRejectedValueOnce(new Error("Column 'id_usuario' cannot be null"));

    const total = 1500;
    const id_usuario = null;
    const id_metodo_pago = 1;

    // Verificamos que la función propaga el error de la base de datos
    await expect(
      crearPedido(mockConnection, total, id_usuario, id_metodo_pago)
    ).rejects.toThrow("Column 'id_usuario' cannot be null");
  });

  test("Debe lanzar un error si la base de datos no está disponible", async () => {
    // Simulamos un error general de conexión a la base de datos
    mockQuery.mockRejectedValueOnce(new Error("Database connection lost"));

    const total = 2500;
    const id_usuario = 3;
    const id_metodo_pago = 2;

    await expect(
      crearPedido(mockConnection, total, id_usuario, id_metodo_pago)
    ).rejects.toThrow("Database connection lost");
  });
});


// ==============================
// PRUEBAS DE "guardarDireccion" 
// ==============================
describe("Controlador: guardarDireccion()", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Debe guardar la dirección con éxito (status 201) si los datos son correctos", async () => {
    // MySQL2 devuelve [ResultSetHeader, fields] para INSERT → [result, fields]
    // result.insertId = 42
    mockPool.query.mockResolvedValueOnce([{ insertId: 42 }, undefined]);

    const req = {
      body: {
        calle: "Av. 3 de Abril",
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


// =======================================
// PRUEBAS DE "actualizarEstado" ==========================================
describe("Controlador: actualizarEstado()", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Debe cambiar el estado del pedido con éxito (status 200)", async () => {
    // MySQL2 devuelve [rows, fields]. El SELECT trae el estado actual, el UPDATE confirma el cambio.
    mockPool.query
      .mockResolvedValueOnce([[{ id_estado: 1 }], undefined])   // SELECT id_estado FROM pedido
      .mockResolvedValueOnce([{ affectedRows: 1 }, undefined]); // UPDATE pedido SET id_estado

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
    // pool.query devuelve [rows, fields] → rows = [] (sin resultados)
    mockPool.query.mockResolvedValueOnce([[], undefined]);

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
    // pool.query devuelve [rows, fields] → rows = [{ id_estado: 2 }]
    mockPool.query.mockResolvedValueOnce([[{ id_estado: 2 }], undefined]);

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
