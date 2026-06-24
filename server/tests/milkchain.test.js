/**
 * =====================================================================
 *  Pruebas Unitarias — MilkChain Backend
 * =====================================================================
 *  Proyecto: Milkchain - Plataforma Logística Corrientes/Litoral
 *  Materia : Ingeniería de Software II
 *  Autores : Maria Daniela Fernandez Gotusso
 *            Cristian Leandro Diaz
 *  Fecha   : 23/06/2026
 *  
 *  Detalle de Cobertura de Pruebas (Firmas Conceptuales vs Técnicas):
 * 
 *  1. crearPedido(Total, id_usuario, id_metodo_pago)
 *     * Firma técnica real: crearPedido(connection, Total, id_usuario, id_metodo_pago)
 *       (Se añade 'connection' al inicio para gestionar la transacción de base de datos)
 * 
 *  2. guardarDireccion(calle, numero, telefono, id_localidad, id_usuario)
 *     * Firma técnica real (Controlador Express): guardarDireccion(req, res)
 *       (Los parámetros de la dirección se envían dentro del cuerpo de la petición: req.body)
 * 
 *  3. actualizarEstado(id_pedido, id_estado)
 *     * Firma técnica real (Controlador Express): actualizarEstado(req, res)
 *       (id_pedido se extrae de req.params.id e id_estado de req.body.nuevoEstadoId)
 * 
 *  Entorno : Jest (con mocks de base de datos)
 * =====================================================================
 */

import { jest } from "@jest/globals";

// =====================================================================
// 1. SIMULACIÓN DE LA BASE DE DATOS (MOCKS)
// =====================================================================
// Creamos una función espía o de mentira (mock) para simular las consultas SQL queries
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

// =====================================================================
// 2. SIMULACIÓN DE OTRAS LIBRERÍAS (JWT Y PDF)
// =====================================================================
jest.unstable_mockModule("../src/libs/jwt.js", () => ({
  crearTokenAcceso: jest.fn().mockResolvedValue("fake.jwt.token"),
}));

jest.unstable_mockModule("../src/config.js", () => ({
  TOKEN_SECRET: "test_secret",
}));

// Evitamos que intente crear o guardar un PDF real durante las pruebas
jest.unstable_mockModule("jspdf", () => ({ default: jest.fn() }));
jest.unstable_mockModule("jspdf-autotable", () => ({}));


// =====================================================================
// 3. IMPORTACIÓN DE CONTROLADORES
// =====================================================================
// Importamos dinámicamente los controladores después de configurar todos los mocks
const { crearPedido, guardarDireccion, actualizarEstado } = await import("../src/controllers/pago.controlador.js");


// =====================================================================
// 4. FUNCIÓN PARA SIMULAR LA RESPUESTA DE EXPRESS (res)
// =====================================================================
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


// =====================================================================
// 5. PRUEBAS UNITARIAS DE MÉTODOS
// =====================================================================

// =====================================================================
// PRUEBAS DE: crearPedido()
// Firma Conceptual: crearPedido(Total, id_usuario, id_metodo_pago)
// Firma Técnica Real: crearPedido(connection, Total, id_usuario, id_metodo_pago)
// =====================================================================
describe("Función: crearPedido()", () => {
  beforeEach(() => jest.clearAllMocks());

  /**
   * @test Debe crear un pedido con éxito y retornar el insertId
   * @firmaConceptual crearPedido(Total, id_usuario, id_metodo_pago)
   * @firmaTecnicaReal crearPedido(connection, Total, id_usuario, id_metodo_pago)
   * @descripcion Registra un nuevo pedido insertando fecha, estado predeterminado (1), total, usuario y método de pago en la BD.
   * @entradas
   *   - connection: mockConnection (conexión simulada)
   *   - Total: 5000
   *   - id_usuario: 1
   *   - id_metodo_pago: 2
   * @salidasEsperadas Retorna el `insertId` generado por la consulta de inserción (ej: 10).
   */
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

  /**
   * @test Debe lanzar un error si la consulta SQL falla por falta de id_usuario
   * @firmaConceptual crearPedido(Total, id_usuario, id_metodo_pago)
   * @firmaTecnicaReal crearPedido(connection, Total, id_usuario, id_metodo_pago)
   * @descripcion Valida la robustez del método simulando un fallo de integridad (restricción NOT NULL) en la BD.
   * @entradas
   *   - connection: mockConnection
   *   - Total: 1500
   *   - id_usuario: null
   *   - id_metodo_pago: 1
   * @salidasEsperadas Lanza un Error con mensaje "Column 'id_usuario' cannot be null".
   */
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

  /**
   * @test Debe lanzar un error si la base de datos no está disponible
   * @firmaConceptual crearPedido(Total, id_usuario, id_metodo_pago)
   * @firmaTecnicaReal crearPedido(connection, Total, id_usuario, id_metodo_pago)
   * @descripcion Valida el comportamiento ante fallos graves de conectividad en la capa de datos.
   * @entradas
   *   - connection: mockConnection
   *   - Total: 2500
   *   - id_usuario: 3
   *   - id_metodo_pago: 2
   * @salidasEsperadas Lanza un Error con mensaje "Database connection lost".
   */
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


// =====================================================================
// PRUEBAS DE: guardarDireccion()
// Firma Conceptual: guardarDireccion(calle, numero, telefono, id_localidad, id_usuario)
// Firma Técnica Real (Express Controller): guardarDireccion(req, res)
// =====================================================================
describe("Controlador: guardarDireccion()", () => {
  beforeEach(() => jest.clearAllMocks());

  /**
   * @test Debe guardar la dirección con éxito (status 201) si los datos son correctos
   * @firmaConceptual guardarDireccion(calle, numero, telefono, id_localidad, id_usuario)
   * @firmaTecnicaReal guardarDireccion(req, res)
   * @descripcion Registra una nueva dirección residencial asociada a un usuario tras verificar todos los campos requeridos.
   * @entradas
   *   - req.body: { calle: "Av. 3 de Abril", numero: 742, telefono: "12345678", id_localidad: 3, id_usuario: 10 }
   * @salidasEsperadas Código HTTP status 201 y un JSON conteniendo el id insertado ({ id: 42 }).
   */
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

  /**
   * @test Debe dar error (status 400) si faltan campos obligatorios
   * @firmaConceptual guardarDireccion(calle, numero, telefono, id_localidad, id_usuario)
   * @firmaTecnicaReal guardarDireccion(req, res)
   * @descripcion Comprueba que se rechacen peticiones incompletas sin contactar a la base de datos.
   * @entradas
   *   - req.body: { numero: 742, id_localidad: 3 } (Faltan: calle, telefono, id_usuario)
   * @salidasEsperadas Código HTTP status 400 y mensaje JSON { message: "Campos no válidos" }.
   */
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


// =====================================================================
// PRUEBAS DE: actualizarEstado()
// Firma Conceptual: actualizarEstado(id_pedido, id_estado)
// Firma Técnica Real (Express Controller): actualizarEstado(req, res)
// =====================================================================
describe("Controlador: actualizarEstado()", () => {
  beforeEach(() => jest.clearAllMocks());

  /**
   * @test Debe cambiar el estado del pedido con éxito (status 200)
   * @firmaConceptual actualizarEstado(id_pedido, id_estado)
   * @firmaTecnicaReal actualizarEstado(req, res)
   * @descripcion Modifica el estado del pedido en la BD y actualiza su marca de tiempo de modificación.
   * @entradas
   *   - req.params.id: 20  (mapeado a id_pedido)
   *   - req.body.nuevoEstadoId: 2 (mapeado a id_estado)
   * @salidasEsperadas Respuesta JSON con mensaje de éxito y el nuevo estado ({ message: "Estado actualizado correctamente", id_estado: 2 }).
   */
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

  /**
   * @test Debe dar error (status 400) si no se seleccionó ningún estado nuevo
   * @firmaConceptual actualizarEstado(id_pedido, id_estado)
   * @firmaTecnicaReal actualizarEstado(req, res)
   * @descripcion Verifica que se rechacen valores nulos, vacíos o indefinidos para el nuevo estado del pedido.
   * @entradas
   *   - req.params.id: 20
   *   - req.body.nuevoEstadoId: ""
   * @salidasEsperadas Código HTTP status 400.
   */
  test("Debe dar error (status 400) si no se seleccionó ningún estado nuevo", async () => {
    const req = {
      params: { id: 20 },
      body: { nuevoEstadoId: "" },
    };
    const res = mockRes();

    await actualizarEstado(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  /**
   * @test Debe dar error 404 si el pedido no existe en la base de datos
   * @firmaConceptual actualizarEstado(id_pedido, id_estado)
   * @firmaTecnicaReal actualizarEstado(req, res)
   * @descripcion Comprueba que se controle la inexistencia del registro en la BD antes de proceder.
   * @entradas
   *   - req.params.id: 999
   *   - req.body.nuevoEstadoId: 2
   * @salidasEsperadas Código HTTP status 404 y mensaje { message: "Pedido no encontrado" }.
   */
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

  /**
   * @test Debe dar error 400 si intentamos cambiar al mismo estado actual del pedido
   * @firmaConceptual actualizarEstado(id_pedido, id_estado)
   * @firmaTecnicaReal actualizarEstado(req, res)
   * @descripcion Previene transacciones redundantes impidiendo la actualización a un estado idéntico al actual.
   * @entradas
   *   - req.params.id: 20
   *   - req.body.nuevoEstadoId: 2 (mismo que el actual)
   * @salidasEsperadas Código HTTP status 400 y mensaje { message: "El pedido ya se encuentra en ese estado" }.
   */
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
