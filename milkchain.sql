-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 19-05-2026 a las 19:35:08
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `milkchain`
--
CREATE DATABASE IF NOT EXISTS `milkchain` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `milkchain`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrito`
--
-- Creación: 08-05-2026 a las 22:32:34
--

CREATE TABLE `carrito` (
  `id_carrito` int(11) NOT NULL,
  `fecha_creacion` datetime DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `id_usuario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrito_detalles`
--
-- Creación: 08-05-2026 a las 22:32:19
--

CREATE TABLE `carrito_detalles` (
  `id_detalle` int(11) NOT NULL,
  `Cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL DEFAULT 0.00,
  `id_carrito` int(11) DEFAULT NULL,
  `id_producto` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--
-- Creación: 08-05-2026 a las 22:11:49
--

CREATE TABLE `categoria` (
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_modificacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`id_categoria`, `nombre`, `descripcion`, `activo`, `fecha_creacion`, `fecha_modificacion`) VALUES
(1, 'Quesos Duros', 'Quesos de pasta dura madurados', 1, '2026-05-08 18:47:02', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contacto`
--
-- Creación: 08-05-2026 a las 22:31:47
--

CREATE TABLE `contacto` (
  `id_contacto` int(11) NOT NULL,
  `mensaje` varchar(255) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `id_estado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `direccion`
--
-- Creación: 13-05-2026 a las 18:59:14
--

CREATE TABLE `direccion` (
  `id_direccion` int(11) NOT NULL,
  `calle` varchar(150) DEFAULT NULL,
  `numero` int(11) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `id_telefono` varchar(50) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `id_localidad` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `direccion`
--

INSERT INTO `direccion` (`id_direccion`, `calle`, `numero`, `activo`, `id_telefono`, `id_usuario`, `id_localidad`) VALUES
(2, 'España', 800, NULL, '1111111111', 1, 9),
(4, 'España', 600, 1, '3794034332', 4, 9);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `encargado`
--
-- Creación: 08-05-2026 a las 21:55:44
--

CREATE TABLE `encargado` (
  `id_encargado` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado`
--
-- Creación: 02-05-2026 a las 18:35:30
--

CREATE TABLE `estado` (
  `id_estado` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estado`
--

INSERT INTO `estado` (`id_estado`, `nombre`, `descripcion`, `activo`) VALUES
(1, 'Pendiente', 'El pedido ha sido recibido pero aún no procesado', 1),
(2, 'Preparación', 'El pedido está siendo armado en el depósito', 1),
(3, 'Enviado', 'El pedido ha sido despachado del depósito', 1),
(4, 'En camino', 'El repartidor está en ruta a la dirección de entrega', 1),
(5, 'Entregado', 'El pedido fue recibido por el cliente', 1),
(6, 'Cancelado', 'El pedido ha sido anulado', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `localidad`
--
-- Creación: 08-05-2026 a las 22:30:58
--

CREATE TABLE `localidad` (
  `id_localidad` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `codigo_postal` varchar(20) DEFAULT NULL,
  `id_provincia` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `localidad`
--

INSERT INTO `localidad` (`id_localidad`, `nombre`, `activo`, `codigo_postal`, `id_provincia`) VALUES
(5, 'Posadas', 1, '3300', 1),
(6, 'Puerto Iguazú', 1, '3370', 1),
(7, 'Oberá', 1, '3360', 1),
(8, 'Eldorado', 1, '3380', 1),
(9, 'Corrientes', 1, '3400', 2),
(10, 'Goya', 1, '3450', 2),
(11, 'Paso de los Libres', 1, '3230', 2),
(12, 'Empedrado', 1, '3418', 2),
(13, 'Curuzú Cuatiá', 1, '3460', 2),
(14, 'Paraná', 1, '3100', 3),
(15, 'Concordia', 1, '3200', 3),
(16, 'Gualeguaychú', 1, '2820', 3),
(17, 'Concepción del Uruguay', 1, '3260', 3),
(18, 'Resistencia', 1, '3500', 4),
(19, 'Presidencia Roque Sáenz Peña', 1, '3700', 4),
(20, 'Villa Ángela', 1, '3540', 4),
(21, 'Barranqueras', 1, '3503', 4),
(22, 'Formosa', 1, '3600', 5),
(23, 'Clorinda', 1, '3610', 5),
(24, 'Pirané', 1, '3606', 5),
(25, 'El Colorado', 1, '3603', 5),
(26, 'Santa Fe', 1, '3000', 6),
(27, 'Rosario', 1, '2000', 6),
(28, 'Rafaela', 1, '2300', 6),
(29, 'Venado Tuerto', 1, '2600', 6),
(30, 'Reconquista', 1, '3560', 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `marca`
--
-- Creación: 08-05-2026 a las 22:07:30
--

CREATE TABLE `marca` (
  `id_marca` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_modificacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `marca`
--

INSERT INTO `marca` (`id_marca`, `nombre`, `descripcion`, `activo`, `fecha_creacion`, `fecha_modificacion`) VALUES
(1, 'Quesería Artesanal', 'Quesería tradicional con productos artesanales', 1, '2026-05-08 18:47:02', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `metodo_pago`
--
-- Creación: 08-05-2026 a las 22:25:44
--

CREATE TABLE `metodo_pago` (
  `id_metodo_pago` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_modificacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `metodo_pago`
--

INSERT INTO `metodo_pago` (`id_metodo_pago`, `nombre`, `activo`, `fecha_creacion`, `fecha_modificacion`) VALUES
(1, 'Efectivo', 1, '2026-05-08 19:25:44', NULL),
(2, 'Transferencia', 1, '2026-05-08 19:25:44', NULL),
(3, 'Tarjeta de Credito', 1, '2026-05-08 19:25:44', NULL),
(4, 'Tarjeta de Debito', 1, '2026-05-08 19:25:44', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pais`
--
-- Creación: 08-05-2026 a las 21:55:44
--

CREATE TABLE `pais` (
  `id_pais` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pais`
--

INSERT INTO `pais` (`id_pais`, `nombre`, `activo`) VALUES
(1, 'Argentina', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido`
--
-- Creación: 14-05-2026 a las 20:08:01
--

CREATE TABLE `pedido` (
  `id_pedido` int(11) NOT NULL,
  `fecha` datetime DEFAULT NULL,
  `id_estado` int(1) DEFAULT 1,
  `Total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `id_encargado` int(11) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `id_metodo_pago` int(11) DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedido`
--

INSERT INTO `pedido` (`id_pedido`, `fecha`, `id_estado`, `Total`, `id_encargado`, `id_usuario`, `id_metodo_pago`, `fecha_modificacion`) VALUES
(12, '2026-05-13 16:58:33', 1, 48402.55, NULL, 4, 1, NULL),
(13, '2026-05-13 16:58:42', 1, 48402.55, NULL, 4, 1, NULL),
(14, '2026-05-13 19:51:46', 1, 48402.55, NULL, 4, 3, NULL),
(15, '2026-05-13 19:54:59', 1, 48402.55, NULL, 4, 3, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido_detalles`
--
-- Creación: 08-05-2026 a las 22:29:58
--

CREATE TABLE `pedido_detalles` (
  `id_detalle` int(11) NOT NULL,
  `Precio_Unitario` decimal(10,2) NOT NULL DEFAULT 0.00,
  `Cantidad` int(11) NOT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `id_pedido` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedido_detalles`
--

INSERT INTO `pedido_detalles` (`id_detalle`, `Precio_Unitario`, `Cantidad`, `id_producto`, `id_pedido`) VALUES
(5, 26124.00, 1, 2, 12),
(6, 22278.55, 1, 1, 12),
(7, 26124.00, 1, 2, 13),
(8, 22278.55, 1, 1, 13),
(9, 26124.00, 1, 2, 14),
(10, 22278.55, 1, 1, 14),
(11, 26124.00, 1, 2, 15),
(12, 22278.55, 1, 1, 15);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--
-- Creación: 13-05-2026 a las 19:36:54
--

CREATE TABLE `producto` (
  `id_producto` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL DEFAULT 0.00,
  `stock` int(11) NOT NULL DEFAULT 0,
  `activo` tinyint(1) DEFAULT NULL,
  `id_categoria` int(11) NOT NULL,
  `id_marca` int(11) NOT NULL,
  `f_Creacion` datetime DEFAULT current_timestamp(),
  `vencimiento` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`id_producto`, `nombre`, `descripcion`, `precio`, `stock`, `activo`, `id_categoria`, `id_marca`, `f_Creacion`, `vencimiento`) VALUES
(1, 'Queso Sardo Correntino', 'Queso semiduro de sabor intenso y salado, madurado de forma artesanal en la provincia de Corrientes.', 22278.55, 48, 1, 1, 1, '2026-05-11 21:42:30', '2026-07-30 23:59:59'),
(2, 'Queso Goya Correntino', 'El clásico queso de pasta dura originario de la ciudad de Goya, Corrientes, con maduración óptima y sabor picante.', 26124.00, 28, 1, 1, 1, '2026-05-11 21:42:30', '2026-07-30 23:59:59'),
(3, 'Queso Reggianito Correntino', 'Queso de pasta dura, madurado y de sabor intenso. Excelente para rallar.', 18500.00, 35, 1, 1, 1, '2026-06-04 15:20:00', '2026-09-30 23:59:59'),
(4, 'Queso Provoleta Litoral', 'Queso hilado de pasta semidura, ideal para dorar a la parrilla.', 12200.00, 50, 1, 1, 1, '2026-06-04 15:20:00', '2026-08-31 23:59:59'),
(5, 'Leche Entera La Campina', 'Leche fresca de campo pasteurizada, de ordeñe diario de vacas criadas a pastura.', 1800.00, 120, 1, 1, 1, '2026-06-04 15:20:00', '2026-09-30 23:59:59'),
(6, 'Miel Organica de Abeja', 'Miel natural multifloral pura de campo del Litoral, sin agregados ni conservantes.', 3200.00, 85, 1, 1, 1, '2026-06-04 15:20:00', '2026-10-31 23:59:59'),
(7, 'Dulce de Leche Artesanal', 'El clasico dulce de leche de campo, cocido a fuego lento con vainilla natural.', 2800.00, 60, 1, 1, 1, '2026-06-04 15:20:00', '2026-12-31 23:59:59'),
(8, 'Yogur de Bufala Cremoso', 'Yogur natural elaborado con leche pura de bufala correntina, espeso y nutritivo.', 2400.00, 45, 1, 1, 1, '2026-06-04 15:20:00', '2026-12-31 23:59:59');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_imagen`
--
-- Creación: 12-05-2026 a las 00:42:30
--

CREATE TABLE `producto_imagen` (
  `id_imagen` int(11) NOT NULL,
  `ruta` varchar(255) NOT NULL,
  `id_producto` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto_imagen`
--

INSERT INTO `producto_imagen` (`id_imagen`, `ruta`, `id_producto`) VALUES
(1, '/images/queso-sardo.jpg', 1),
(2, '/images/queso-goya.jpg', 2),
(3, '/images/queso-reggianito.jpg', 3),
(4, '/images/queso-provoleta.jpg', 4),
(5, '/images/leche-entera-la-campina.jpg', 5),
(6, '/images/miel-organica-de-abeja.jpg', 6),
(7, '/images/dulce-de-leche-artesanal.jpg', 7),
(8, '/images/yogur-de-bufala-cremoso.jpg', 8);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `provincia`
--
-- Creación: 08-05-2026 a las 21:55:44
--

CREATE TABLE `provincia` (
  `id_provincia` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `id_Pais` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `provincia`
--

INSERT INTO `provincia` (`id_provincia`, `nombre`, `activo`, `id_Pais`) VALUES
(1, 'Misiones', 1, 1),
(2, 'Corrientes', 1, 1),
(3, 'Entre Ríos', 1, 1),
(4, 'Chaco', 1, 1),
(5, 'Formosa', 1, 1),
(6, 'Santa Fe', 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--
-- Creación: 08-05-2026 a las 21:53:17
--

CREATE TABLE `rol` (
  `id_rol` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`id_rol`, `nombre`, `descripcion`, `activo`) VALUES
(1, 'Administrador', 'Perfil con acceso total a la gestión de productos, pedidos y usuarios.', 1),
(2, 'Cliente', 'Perfil para realizar compras y ver historial de pedidos.', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `telefono`
--
-- Creación: 08-05-2026 a las 22:01:17
--

CREATE TABLE `telefono` (
  `id_telefono` int(11) NOT NULL,
  `numero` varchar(50) NOT NULL,
  `id_usuario` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `telefono`
--

INSERT INTO `telefono` (`id_telefono`, `numero`, `id_usuario`) VALUES
(1, '1111111111', 1),
(2, '3794034332', 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--
-- Creación: 13-05-2026 a las 19:03:23
--

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `dni` int(11) DEFAULT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `apellido` varchar(100) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT NULL,
  `id_rol` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `email`, `password`, `dni`, `nombre`, `apellido`, `activo`, `fecha_creacion`, `fecha_modificacion`, `id_rol`) VALUES
(1, 'admin@gmail.com', '$2b$10$n0p/fmwIjb7caj2/s5fwfebETwR5gOwX7pFy8ww4mJ3vj/T6d55a.', 0, 'admin', 'principal', NULL, NULL, NULL, 1),
(4, 'maria_dniel@yahoo.com.ar', '$2b$10$AWwa5JHrnpB4l/yV.CQmH.ulhJWtxk3b9tKlJHBzjnMe3ajCBop4O', 43822520, 'Maria Daniela', 'Fernandez Gotusso', 1, '2026-05-04 13:10:34', NULL, 2),
(5, 'yoquienmascorreo@gmail.com', '$2b$10$oKC7HkimBpzquvgo6r3PKuvuNat84yheFuV7sYX0WJkWzasK6WpSW', 44333222, 'Yoquien', 'Mas', 1, NULL, NULL, 2);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD PRIMARY KEY (`id_carrito`),
  ADD KEY `fk_carrito_usuario` (`id_usuario`);

--
-- Indices de la tabla `carrito_detalles`
--
ALTER TABLE `carrito_detalles`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `id_Carrito` (`id_carrito`),
  ADD KEY `fk_carrito_producto` (`id_producto`);

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Indices de la tabla `contacto`
--
ALTER TABLE `contacto`
  ADD PRIMARY KEY (`id_contacto`),
  ADD KEY `id_Estado` (`id_estado`),
  ADD KEY `fk_contacto_usuario` (`id_usuario`);

--
-- Indices de la tabla `direccion`
--
ALTER TABLE `direccion`
  ADD PRIMARY KEY (`id_direccion`),
  ADD KEY `fk_direccion_localidad` (`id_localidad`);

--
-- Indices de la tabla `encargado`
--
ALTER TABLE `encargado`
  ADD PRIMARY KEY (`id_encargado`);

--
-- Indices de la tabla `estado`
--
ALTER TABLE `estado`
  ADD PRIMARY KEY (`id_estado`);

--
-- Indices de la tabla `localidad`
--
ALTER TABLE `localidad`
  ADD PRIMARY KEY (`id_localidad`),
  ADD KEY `fk_localidad_provincia` (`id_provincia`);

--
-- Indices de la tabla `marca`
--
ALTER TABLE `marca`
  ADD PRIMARY KEY (`id_marca`);

--
-- Indices de la tabla `metodo_pago`
--
ALTER TABLE `metodo_pago`
  ADD PRIMARY KEY (`id_metodo_pago`);

--
-- Indices de la tabla `pais`
--
ALTER TABLE `pais`
  ADD PRIMARY KEY (`id_pais`);

--
-- Indices de la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD PRIMARY KEY (`id_pedido`),
  ADD KEY `fk_pedido_metodo_pago` (`id_metodo_pago`),
  ADD KEY `fk_pedido_usuario` (`id_usuario`),
  ADD KEY `fk_pedido_encargado` (`id_encargado`),
  ADD KEY `fk_pedido_estado` (`id_estado`);

--
-- Indices de la tabla `pedido_detalles`
--
ALTER TABLE `pedido_detalles`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `id_Producto` (`id_producto`),
  ADD KEY `id_Pedido` (`id_pedido`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id_producto`),
  ADD KEY `fk_producto_categoria` (`id_categoria`),
  ADD KEY `fk_producto_marca` (`id_marca`);

--
-- Indices de la tabla `producto_imagen`
--
ALTER TABLE `producto_imagen`
  ADD PRIMARY KEY (`id_imagen`);

--
-- Indices de la tabla `provincia`
--
ALTER TABLE `provincia`
  ADD PRIMARY KEY (`id_provincia`),
  ADD KEY `id_Pais` (`id_Pais`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`id_rol`);

--
-- Indices de la tabla `telefono`
--
ALTER TABLE `telefono`
  ADD PRIMARY KEY (`id_telefono`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `dni` (`dni`),
  ADD KEY `fk_usuario_rol` (`id_rol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `carrito`
--
ALTER TABLE `carrito`
  MODIFY `id_carrito` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `carrito_detalles`
--
ALTER TABLE `carrito_detalles`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `contacto`
--
ALTER TABLE `contacto`
  MODIFY `id_contacto` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `direccion`
--
ALTER TABLE `direccion`
  MODIFY `id_direccion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `encargado`
--
ALTER TABLE `encargado`
  MODIFY `id_encargado` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `estado`
--
ALTER TABLE `estado`
  MODIFY `id_estado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `localidad`
--
ALTER TABLE `localidad`
  MODIFY `id_localidad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de la tabla `marca`
--
ALTER TABLE `marca`
  MODIFY `id_marca` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `metodo_pago`
--
ALTER TABLE `metodo_pago`
  MODIFY `id_metodo_pago` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `pais`
--
ALTER TABLE `pais`
  MODIFY `id_pais` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `pedido`
--
ALTER TABLE `pedido`
  MODIFY `id_pedido` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `pedido_detalles`
--
ALTER TABLE `pedido_detalles`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `producto_imagen`
--
ALTER TABLE `producto_imagen`
  MODIFY `id_imagen` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `provincia`
--
ALTER TABLE `provincia`
  MODIFY `id_provincia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `telefono`
--
ALTER TABLE `telefono`
  MODIFY `id_telefono` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD CONSTRAINT `fk_carrito_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

--
-- Filtros para la tabla `carrito_detalles`
--
ALTER TABLE `carrito_detalles`
  ADD CONSTRAINT `carrito_detalles_ibfk_1` FOREIGN KEY (`id_carrito`) REFERENCES `carrito` (`id_carrito`),
  ADD CONSTRAINT `fk_carrito_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`);

--
-- Filtros para la tabla `contacto`
--
ALTER TABLE `contacto`
  ADD CONSTRAINT `contacto_ibfk_2` FOREIGN KEY (`id_estado`) REFERENCES `estado` (`id_estado`),
  ADD CONSTRAINT `fk_contacto_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

--
-- Filtros para la tabla `direccion`
--
ALTER TABLE `direccion`
  ADD CONSTRAINT `fk_direccion_localidad` FOREIGN KEY (`id_localidad`) REFERENCES `localidad` (`id_localidad`),
  ADD CONSTRAINT `fk_direccion_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

--
-- Filtros para la tabla `localidad`
--
ALTER TABLE `localidad`
  ADD CONSTRAINT `fk_localidad_provincia` FOREIGN KEY (`id_provincia`) REFERENCES `provincia` (`id_provincia`);

--
-- Filtros para la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD CONSTRAINT `fk_pedido_encargado` FOREIGN KEY (`id_encargado`) REFERENCES `encargado` (`id_encargado`),
  ADD CONSTRAINT `fk_pedido_estado` FOREIGN KEY (`id_estado`) REFERENCES `estado` (`id_estado`),
  ADD CONSTRAINT `fk_pedido_metodo_pago` FOREIGN KEY (`id_metodo_pago`) REFERENCES `metodo_pago` (`id_metodo_pago`),
  ADD CONSTRAINT `fk_pedido_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

--
-- Filtros para la tabla `pedido_detalles`
--
ALTER TABLE `pedido_detalles`
  ADD CONSTRAINT `pedido_detalles_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`),
  ADD CONSTRAINT `pedido_detalles_ibfk_2` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`);

--
-- Filtros para la tabla `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `fk_producto_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`),
  ADD CONSTRAINT `fk_producto_marca` FOREIGN KEY (`id_marca`) REFERENCES `marca` (`id_marca`);

--
-- Filtros para la tabla `producto_imagen`
--
ALTER TABLE `producto_imagen`
  ADD CONSTRAINT `producto_imagen_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE;

--
-- Filtros para la tabla `provincia`
--
ALTER TABLE `provincia`
  ADD CONSTRAINT `provincia_ibfk_1` FOREIGN KEY (`id_Pais`) REFERENCES `pais` (`id_pais`);

--
-- Filtros para la tabla `telefono`
--
ALTER TABLE `telefono`
  ADD CONSTRAINT `fk_telefono_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
