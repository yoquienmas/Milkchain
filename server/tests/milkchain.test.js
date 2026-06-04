/**
 * =====================================================================
 *  Pruebas Unitarias — MilkChain Backend
 *  Framework : Jest (con mocks manuales para aislar la BD y bcrypt)
 *  Autor     : María Daniela Fernández Gotusso
 *  Fecha     : 03/06/2026
 *
 *  Prueba 1: login()          → 400 si el email no existe en BD
 *  Prueba 2: validarStock()   → lanza Error si stock insuficiente
 *  Prueba 3: finalizarPedido()→ 400 si faltan datos obligatorios
 * =====================================================================
 */

import { jest } from "@jest/globals";

// ─── Mock del pool de MySQL ────────────────────────────────────────────────
// Reemplazamos el módulo real de la BD por un objeto controlado en cada test
const mockQuery = jest.fn();
const mockRelease = jest.fn();
const mockBeginTransaction = jest.fn();
const mockCommit = jest.fn();
const mockRollback = jest.fn();

const mockConnection = {
  query: mockQuery,
  release: mockRelease,
  beginTransaction: mockBeginTransaction,
  commit: mockCommit,
  rollback: mockRollback,
};

const mockPool = {
  query: mockQuery,
  getConnection: jest.fn().mockResolvedValue(mockConnection),
};

jest.unstable_mockModule("../src/db.js", () => ({
  pool: mockPool,
}));

// ─── Mock de bcryptjs ──────────────────────────────────────────────────────
const mockBcryptCompare = jest.fn();
jest.unstable_mockModule("bcryptjs", () => ({
  default: {
    compare: mockBcryptCompare,
    hash: jest.fn().mockResolvedValue("$hashed"),
  },
}));

// ─── Mock de JWT / libs ───────────────────────────────────────────────────
jest.unstable_mockModule("../src/libs/jwt.js", () => ({
  createAccessToken: jest.fn().mockResolvedValue("fake.jwt.token"),
}));
jest.unstable_mockModule("../src/config.js", () => ({
  TOKEN_SECRET: "test_secret",
}));

// ─── Mock de jspdf (no necesario para pruebas de lógica de negocio) ───────
jest.unstable_mockModule("jspdf", () => ({ default: jest.fn() }));
jest.unstable_mockModule("jspdf-autotable", () => ({}));

// ─── Carga dinámica de los módulos bajo prueba ────────────────────────────
const { login } = await import("../src/controllers/autenticacion.controlador.js");
const { finalizarPedido } = await import("../src/controllers/pago.controlador.js");

// ─── Helper: construye req / res falsos ───────────────────────────────────
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json    = jest.fn().mockReturnValue(res);
  res.cookie  = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  return res;
};

// ══════════════════════════════════════════════════════════════════════════
//  PRUEBA 1 — login(): responde 400 cuando el email no existe
// ══════════════════════════════════════════════════════════════════════════
describe("PRUEBA 1 — login()", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Debe retornar status 400 y mensaje de error cuando el email no existe en la BD", async () => {
    // Simular que la consulta a la BD devuelve 0 registros (email no existe)
    mockPool.query.mockResolvedValueOnce([[]]);

    const req = { body: { email: "noexiste@test.com", password: "123456" } };
    const res = mockRes();

    await login(req, res);

    // Verificar que se respondió con 400
    expect(res.status).toHaveBeenCalledWith(400);
    // Verificar que el mensaje indica que el correo no existe
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "El correo no existe" })
    );
    // Verificar que bcrypt NUNCA fue llamado (cortocircuito antes de validar contraseña)
    expect(mockBcryptCompare).not.toHaveBeenCalled();
  });
});

// ══════════════════════════════════════════════════════════════════════════
//  PRUEBA 2 — validarStockDisponibilidad(): lanza Error si stock insuficiente
// ══════════════════════════════════════════════════════════════════════════
describe("PRUEBA 2 — validarStockDisponibilidad() (a través de finalizarPedido)", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Debe retornar status 500 con mensaje de stock insuficiente cuando la cantidad pedida supera el stock real", async () => {
    // Simular transacción iniciada correctamente
    mockBeginTransaction.mockResolvedValueOnce();

    // Simular INSERT de pedido OK → devuelve insertId
    mockQuery
      .mockResolvedValueOnce([{ insertId: 99 }])   // crearPedido INSERT
      .mockResolvedValueOnce([{}])                  // registrarDetalles INSERT
      .mockResolvedValueOnce([[{ stock: 3 }]]);     // validarStock SELECT → stock=3

    const req = {
      body: {
        id_usuario:     1,
        id_metodo_pago: 1,
        Total:          50000,
        detalles: [
          { id_producto: 5, Cantidad: 10, Precio_Unitario: 5000 }, // pide 10, hay 3
        ],
      },
    };
    const res = mockRes();

    await finalizarPedido(req, res);

    // Debe hacer rollback al detectar stock insuficiente
    expect(mockRollback).toHaveBeenCalled();
    // Debe responder con 500 y mensaje que menciona el stock
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Stock insuficiente"),
      })
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════
//  PRUEBA 3 — finalizarPedido(): responde 400 si faltan datos obligatorios
// ══════════════════════════════════════════════════════════════════════════
describe("PRUEBA 3 — finalizarPedido(): validación de campos obligatorios", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Debe retornar status 400 cuando el body llega sin id_usuario", async () => {
    const req = {
      body: {
        // id_usuario ausente
        id_metodo_pago: 1,
        Total: 22000,
        detalles: [{ id_producto: 1, Cantidad: 2, Precio_Unitario: 11000 }],
      },
    };
    const res = mockRes();

    await finalizarPedido(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Faltan datos requeridos para procesar el pedido",
      })
    );
    // La BD nunca debería haberse consultado
    expect(mockPool.getConnection).not.toHaveBeenCalled();
  });

  test("Debe retornar status 400 cuando el carrito de detalles está vacío", async () => {
    const req = {
      body: {
        id_usuario:     4,
        id_metodo_pago: 2,
        Total:          0,
        detalles:       [], // carrito vacío
      },
    };
    const res = mockRes();

    await finalizarPedido(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Faltan datos requeridos para procesar el pedido",
      })
    );
    expect(mockPool.getConnection).not.toHaveBeenCalled();
  });
});
