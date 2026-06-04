# 🥛 Manual de Usuario del Sistema - MilkChain

Este documento contiene la versión adaptada y oficial del **Manual de Usuario** para **MilkChain**, desarrollada en base a las especificaciones y flujos definidos en el manual de referencia (*Anexo 3 - Manual de Usuarios del sistema.pdf*).

---

## 🏛️ Universidad Nacional del Nordeste
### Facultad de Ciencias Exactas y Naturales y Agrimensura
* **Cátedra:** Ingeniería del Software II
* **Proyecto:** "Sistema de distribución Interregional de Productos Lácteos y Perecederos: MilkChain" 
* **Año:** 2026
* **Grupo N°:** 22

#### Integrantes:
* Díaz, Cristian Leandro
* Fernandez Gotusso, Maria Daniela


---

## 🧭 Índice
1. [Introducción](#1-introducción)
2. [Objetivo del Manual](#2-objetivo-del-manual)
3. [Dirigido a](#3-dirigido-a)
4. [Conocimientos requeridos](#4-conocimientos-requeridos)
5. [Especificaciones Técnicas](#5-especificaciones-técnicas)
   * [5.1 Hardware recomendado](#51-hardware-recomendado)
   * [5.2 Software necesario](#52-software-necesario)
6. [Características del Producto](#6-características-del-producto)
7. [Uso del sistema](#7-uso-del-sistema)
   * [7.1 Acceso al sistema (Cliente/Admin)](#71-acceso-al-sistema-clienteadmin)
   * [7.2 Registro de usuario (Cliente)](#72-registro-de-usuario-cliente)
   * [7.3 Agregar producto al carrito (Cliente)](#73-agregar-producto-al-carrito-cliente)
   * [7.4 Generar pedido (Cliente)](#74-generar-pedido-cliente)
   * [7.5 Confirmar pedido (Cliente)](#75-confirmar-pedido-cliente)
   * [7.6 Eliminar Pedido (Admin)](#76-eliminar-pedido-admin)
   * [7.7 Editar Pedido (Admin)](#77-editar-pedido-admin)
   * [7.8 Cambiar Estado de Pedido (Admin)](#78-cambiar-estado-de-pedido-admin)
8. [Recomendaciones de uso](#8-recomendaciones-de-uso)
9. [Limitaciones actuales](#9-limitaciones-actuales)

---

## 1. Introducción
El presente manual describe el uso del sistema web **MilkChain**, una plataforma orientada a facilitar la distribución interregional de productos lácteos y perecederos. A través de esta aplicación, los usuarios clientes pueden seleccionar productos de origen correntino, agregarlos al carrito de compras, ingresar sus datos de envío y confirmar su pedido. Por su parte, los administradores cuentan con herramientas para supervisar, editar, eliminar y gestionar el estado del ciclo de distribución de dichos pedidos.

---

## 2. Objetivo del Manual
Brindar una guía clara e interactiva paso a paso para que los usuarios finales operen con éxito las principales funcionalidades de la plataforma web: registro, inicio de sesión, exploración de catálogo, uso del carrito, facturación electrónica y gestión administrativa.

---

## 3. Dirigido a
El sistema está diseñado para ser utilizado por los siguientes roles de usuario:
* **Cliente:** Usuario comercial (PyMEs, almacenes y comercios locales del Litoral) que inicia sesión para acceder al catálogo regional, agregar productos perecederos al carrito, ingresar direcciones y registrar su compra.
* **Administrador:** Personal administrativo y logístico de la distribuidora que cuenta con privilegios elevados para auditar pedidos globales, cambiar estados de entrega, editar campos y dar de baja órdenes.

---

## 4. Conocimientos requeridos
Para operar la aplicación de forma efectiva, se requiere:
* Destrezas básicas en navegación web y manejo de computadoras o dispositivos móviles.
* Capacidad para completar formularios de entrada de datos en línea.
* Poseer una cuenta de usuario previamente registrada.

---

## 5. Especificaciones Técnicas

### 5.1 Hardware recomendado
* **Procesador:** CPU a 1 GHz o superior.
* **Memoria RAM:** 4 GB como mínimo.
* **Espacio en disco:** 2 GB de almacenamiento libre.
* **Red:** Conexión estable a internet.

### 5.2 Software necesario
* **Navegador web moderno:** Google Chrome, Mozilla Firefox, Microsoft Edge o Safari en sus últimas versiones estables.
* **Entorno de base de datos y backend (Ejecución local):** Node.js 18+ y un motor MySQL / MariaDB activo en el puerto `3306`.

---

## 6. Características del Producto
* **Arquitectura de Software:** Plataforma web construida con React (Vite) para el Frontend y Node.js con Express para el Backend API.
* **Almacenamiento:** Base de datos relacional MySQL para el control seguro de datos.
* **Sistema de Roles:** Gestión de permisos diferenciados entre clientes y administradores.
* **Gestión de Stock Automatizada:** Control estricto que valida el stock del depósito antes de confirmar cualquier compra para prevenir desabastecimientos o ventas duplicadas.

---

## 7. Uso del sistema

### 7.1 Acceso al sistema (Cliente/Admin)
1. Ingrese a la plataforma desde su navegador favorito mediante la dirección local establecida:
   ```http
   http://localhost:5173/
   ```
2. Será redirigido automáticamente a la interfaz de **Iniciar sesión** (`/login`).
3. Introduzca su correo electrónico y contraseña correspondientes en el formulario de acceso.
   * *Ejemplo Administrador:* Correo: `admin@gmail.com` | Contraseña: `admin123`
4. Presione **Ingresar**. El sistema detectará su perfil y le mostrará la pantalla de inicio adaptada (**AdminHome** o **ClienteHome**).

---

### 7.2 Registro de usuario (Cliente)
1. En la pantalla de acceso, haga clic en el enlace **Regístrate aquí** para abrir el formulario de creación de cuenta.
2. Complete la planilla de registro con la totalidad de los datos requeridos:
   * Correo Electrónico
   * Nombre de Usuario
   * Contraseña
   * DNI/CUIT
   * Nombre y Apellido
   * Teléfono
3. Haga clic en **Registrarse**.
4. Se mostrará el mensaje confirmando el **"Registro exitoso"**. Presione el botón correspondiente para volver al inicio de sesión e ingresar con sus nuevas credenciales.

---

### 7.3 Agregar producto al carrito (Cliente)
1. Desde el menú principal del panel de cliente, ingrese a la sección **Ver Catálogo**.
2. Seleccione las cantidades de las unidades lácteas o perecederas que desea adquirir.
3. Presione el botón **Agregar al carrito**.
4. Si hay suficiente stock disponible, los artículos se agregarán correctamente y el botón **Comprar** quedará habilitado en la interfaz.

---

### 7.4 Generar pedido (Cliente)
1. Presione el botón **Comprar** para dirigirse a la vista de desglose de los productos del carrito.
2. Compruebe el resumen de los productos y sus subtotales. Si lo requiere, actualice cantidades o elimine artículos no deseados.
3. Presione **Continuar** para proceder con los datos de distribución.
4. **Definición de entrega:**
   * Seleccione una de sus direcciones guardadas en la lista, o bien;
   * Complete el formulario para registrar un domicilio de entrega nuevo (Calle, Número, Teléfono y Localidad) y presione **Guardar dirección**.
5. Para proceder a la interfaz de pago, haga clic en **Ir a pagar**.

---

### 7.5 Confirmar pedido (Cliente)
1. En la interfaz de pago, seleccione el medio de pago disponible (**Efectivo** o **Transferencia**).
2. Presione el botón **Finalizar pedido** para confirmar la transacción.
3. Tras la validación de inventario en servidor, el sistema abrirá la confirmación de la orden con el mensaje: **"¡Pago confirmado! Pago exitoso, su envío está en preparación"**.
4. **Opciones posventa disponibles:**
   * **Ver Pedido:** Lo redirige al historial histórico de compras de su cuenta de cliente.
   * **Imprimir Factura:** Abre y genera la factura del pedido en formato PDF para su descarga o impresión física.

---

### 7.6 Eliminar Pedido (Admin)
1. Inicie sesión con credenciales de administrador y acceda a la sección **Ver Pedidos** del panel.
2. En la lista global de compras de los clientes, ubique el pedido correspondiente y haga clic en **Eliminar**.
3. Se mostrará una vista de confirmación del pedido a eliminar.
4. Presione el botón rojo **Eliminar** para remover de forma permanente el registro.

---

### 7.7 Editar Pedido (Admin)
1. Ingrese a la sección **Ver Pedidos** desde el panel principal de administración.
2. Identifique la orden de compra que desea modificar y haga clic en la acción **Detalles**.
3. En la interfaz de desglose del pedido, presione el botón **Editar**.
4. Modifique los campos del formulario según sea necesario (Fecha, Total de facturación, ID de Usuario, etc.).
5. Presione **Guardar** para consolidar los cambios en el servidor.

---

### 7.8 Cambiar Estado de Pedido (Admin)
1. Acceda a la sección **Ver Pedidos** desde el panel de control administrativo.
2. Identifique el pedido de distribución del Litoral y haga clic en **Cambiar estado**.
3. El sistema progresará automáticamente el estado del pedido, notificando de manera secuencial en la lista:
   * **Pendiente** $\rightarrow$ **Preparación** $\rightarrow$ **Enviado** $\rightarrow$ **En camino** $\rightarrow$ **Entregado**

---

## 8. Recomendaciones de uso
* **Mantener actualizados los datos:** Registre adecuadamente su número telefónico y localidad del Litoral para coordinar el transporte regional.
* **Seguridad:** Cierre sesión inmediatamente si opera la aplicación en terminales públicas o de locales comerciales compartidos.
* **Navegación:** Se aconseja utilizar navegadores basados en motores Chromium para un óptimo rendimiento visual y rapidez de transacciones.

---

## 9. Limitaciones actuales
* **Selección integrada de transportista:** Actualmente, la personalización del transportista preferencial se coordina post-compra con los asesores.
* **Entorno Web:** La aplicación está configurada para funcionar de manera local (`http://localhost`).
* **Optimización móvil:** El sistema de visualización está adaptado de forma óptima principalmente para dispositivos de pantalla de escritorio y mediana escala (tablets).
* **Accesibilidad:** No incluye funciones nativas de lector de pantalla o contraste avanzado para accesibilidad visual en esta versión.

---
*(Fin del documento)*
