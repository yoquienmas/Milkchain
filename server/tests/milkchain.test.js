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
//  3. CARGA DINÁMICA DE CONTROLADORES Y MÉTODOS BAJO PRUEBA
// =====================================================================================
const { 
  finalizarPedidoMetodo, 
  guardarDireccionMetodo, 
  actualizarEstadoMetodo,
  crearPedido,
  registrarDetalles,
  descontarStock,
  validarStockDisponibilidad
} = await import("../src/controllers/pago.controlador.js");


// =====================================================================================
//  PRUEBA 1 — finalizarPedidoMetodo() - Validación de Stock
// =====================================================================================
describe("PRUEBA 1 — finalizarPedidoMetodo() - Validación de Stock", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Debe lanzar excepción y hacer rollback si la cantidad pedida supera el stock real", async () => {
    // 1. SIMULACIÓN:
    // - Consulta 1 (Crear Pedido): INSERT exitoso, ID = 99.
    // - Consulta 2 (Detalles): INSERT exitoso.
    // - Consulta 3 (Verificar Stock): Stock real en BD = 3.
    mockQuery
      .mockResolvedValueOnce([{ insertId: 99 }])   
      .mockResolvedValueOnce([{}])                  
      .mockResolvedValueOnce([[{ stock: 3 }]]);     

    // 2. ENTRADA: 10 unidades pedidas (supera el stock de 3).
    const detalles = [{ id_producto: 5, Cantidad: 10, Precio_Unitario: 500 }];

    // 3. EJECUCIÓN & VERIFICACIÓN:
    await expect(finalizarPedidoMetodo(1, 1, 5000, detalles)).rejects.toThrow("Stock insuficiente");

    // - Debe ejecutarse el rollback en la transacción.
    expect(mockConnection.rollback).toHaveBeenCalled();
  });
});


// =====================================================================================
//  PRUEBA 2 — finalizarPedidoMetodo() - Campos Obligatorios
// =====================================================================================
describe("PRUEBA 2 — finalizarPedidoMetodo() - Campos Obligatorios", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Debe lanzar error si falta el id_usuario en la petición", async () => {
    const detalles = [{ id_producto: 1, Cantidad: 1, Precio_Unitario: 1000 }];
    
    await expect(finalizarPedidoMetodo(null, 1, 1000, detalles)).rejects.toThrow(
      "Faltan datos requeridos para procesar el pedido"
    );
    
    expect(mockPool.getConnection).not.toHaveBeenCalled();
  });

  test("Debe lanzar error si el carrito de detalles llega vacío", async () => {
    await expect(finalizarPedidoMetodo(1, 1, 0, [])).rejects.toThrow(
      "Faltan datos requeridos para procesar el pedido"
    );
    
    expect(mockPool.getConnection).not.toHaveBeenCalled();
  });
});


// =====================================================================================
//  PRUEBA 3 — guardarDireccionMetodo()
// =====================================================================================
describe("PRUEBA 3 — guardarDireccionMetodo()", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Debe retornar el ID de la dirección si todos los campos son válidos", async () => {
    mockPool.query.mockResolvedValueOnce([{ insertId: 42 }]);

    const result = await guardarDireccionMetodo("Av. Siempre Viva", 742, "12345678", 3, 10);
    
    expect(result).toEqual({ id: 42 });
  });

  test("Debe lanzar error 'Campos no válidos' si faltan datos requeridos", async () => {
    await expect(guardarDireccionMetodo(null, 742, null, 3, null)).rejects.toThrow(
      "Campos no válidos"
    );
  });
});


// =====================================================================================
//  PRUEBA 4 — actualizarEstadoMetodo()
// =====================================================================================
describe("PRUEBA 4 — actualizarEstadoMetodo()", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Debe confirmar con éxito si el estado del pedido cambia correctamente", async () => {
    // 1. SIMULACIÓN: SELECT devuelve estado actual (1), UPDATE exitoso.
    mockPool.query
      .mockResolvedValueOnce([[{ id_estado: 1 }]])
      .mockResolvedValueOnce([{}]);

    const result = await actualizarEstadoMetodo(20, 2);
    
    expect(result).toEqual({
      message: "Estado actualizado correctamente",
      id_estado: 2,
    });
  });

  test("Debe lanzar error si no se proporciona un estado válido", async () => {
    await expect(actualizarEstadoMetodo(20, "")).rejects.toThrow(
      "Campos no válidos"
    );
    expect(mockPool.query).not.toHaveBeenCalled();
  });

  test("Debe lanzar error 404 si el pedido no existe en la base de datos", async () => {
    mockPool.query.mockResolvedValueOnce([[]]);

    await expect(actualizarEstadoMetodo(999, 2)).rejects.toThrow(
      "Pedido no encontrado"
    );
  });

  test("Debe lanzar error 400 si el nuevo estado es idéntico al actual", async () => {
    mockPool.query.mockResolvedValueOnce([[{ id_estado: 2 }]]);

    await expect(actualizarEstadoMetodo(20, 2)).rejects.toThrow(
      "El pedido ya se encuentra en ese estado"
    );
  });
});


// =====================================================================================
//  PRUEBAS DE MÉTODOS AUXILIARES DE OPERACIONES CRÍTICAS
// =====================================================================================
describe("PRUEBAS DE MÉTODOS AUXILIARES - crearPedido()", () => {
  test("Debe insertar el pedido y retornar su insertId con datos válidos", async () => {
    const mockConn = {
      query: jest.fn().mockResolvedValue([{ insertId: 77 }]),
    };
    const insertId = await crearPedido(mockConn, 3000, 5, 2);
    expect(insertId).toBe(77);
  });
});

describe("PRUEBAS DE MÉTODOS AUXILIARES - registrarDetalles()", () => {
  test("Debe ejecutar un bulk insert con los detalles mapeados", async () => {
    const mockConn = {
      query: jest.fn().mockResolvedValue([{}]),
    };
    const detalles = [{ id_producto: 3, Cantidad: 4, Precio_Unitario: 150 }];
    await registrarDetalles(mockConn, 77, detalles);
    expect(mockConn.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO pedido_detalles"),
      [[[150, 4, 3, 77]]]
    );
  });
});

describe("PRUEBAS DE MÉTODOS AUXILIARES - descontarStock()", () => {
  test("Debe ejecutar un UPDATE para reducir el stock en la BD", async () => {
    const mockConn = {
      query: jest.fn().mockResolvedValue([{}]),
    };
    const detalles = [{ id_producto: 3, Cantidad: 4 }];
    await descontarStock(mockConn, detalles);
    expect(mockConn.query).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE producto SET stock = stock - ? WHERE id_producto = ?"),
      [4, 3]
    );
  });
});

describe("PRUEBAS DE MÉTODOS AUXILIARES - validarStockDisponibilidad()", () => {
  test("Debe pasar con éxito si el stock disponible es suficiente", async () => {
    const mockConn = {
      query: jest.fn().mockResolvedValue([[{ stock: 10 }]]),
    };
    const detalles = [{ id_producto: 3, Cantidad: 5 }];
    await expect(validarStockDisponibilidad(mockConn, detalles)).resolves.not.toThrow();
  });

  test("Debe lanzar una excepción si la cantidad supera el stock disponible", async () => {
    const mockConn = {
      query: jest.fn().mockResolvedValue([[{ stock: 3 }]]),
    };
    const detalles = [{ id_producto: 3, Cantidad: 10 }];
    await expect(validarStockDisponibilidad(mockConn, detalles)).rejects.toThrow(
      "Stock insuficiente para el producto ID 3. Disponible: 3, solicitado: 10"
    );
  });
});
