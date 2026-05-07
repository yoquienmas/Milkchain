-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 16-04-2026 a las 19:02:59
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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrito`
--

CREATE TABLE `carrito` (
  `id` int(11) NOT NULL,
  `f_Creacion` datetime DEFAULT NULL,
  `f_Modif` datetime DEFAULT NULL,
  `activo` tinyint(1) DEFAULT NULL,
  `id_Usuario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carritodetalles`
--

CREATE TABLE `carritodetalles` (
  `id` int(11) NOT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `id_Carrito` int(11) DEFAULT NULL,
  `id_Producto` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contacto`
--

CREATE TABLE `contacto` (
  `id` int(11) NOT NULL,
  `mensaje` varchar(255) DEFAULT NULL,
  `f_Creacion` datetime DEFAULT NULL,
  `f_Modif` datetime DEFAULT NULL,
  `id_Usuario` int(11) DEFAULT NULL,
  `id_Estado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `direccion`
--

CREATE TABLE `direccion` (
  `id` int(11) NOT NULL,
  `calle` varchar(150) DEFAULT NULL,
  `numero` int(11) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT NULL,
  `n_contacto` varchar(50) DEFAULT NULL,
  `id_localidad` int(11) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `encargado`
--

CREATE TABLE `encargado` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `encargadopedido`
--

CREATE TABLE `encargadopedido` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estadoform`
--

CREATE TABLE `estadoform` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `localidad`
--

CREATE TABLE `localidad` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT NULL,
  `cp` varchar(20) DEFAULT NULL,
  `id_provincia` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `marca`
--

CREATE TABLE `marca` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago`
--

CREATE TABLE `pago` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pais`
--

CREATE TABLE `pais` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido`
--

CREATE TABLE `pedido` (
  `id` int(11) NOT NULL,
  `fecha` datetime DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `idEncargado` int(11) DEFAULT NULL,
  `idUsuario` int(11) DEFAULT NULL,
  `idDireccion` int(11) DEFAULT NULL,
  `idPago` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidodetalles`
--

CREATE TABLE `pedidodetalles` (
  `id` int(11) NOT NULL,
  `p_Unitario` decimal(10,2) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `id_Producto` int(11) DEFAULT NULL,
  `id_Pedido` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `stock` int(11) DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT NULL,
  `id_Categoria` int(11) DEFAULT NULL,
  `id_Marca` int(11) DEFAULT NULL,
  `f_Creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`id`, `nombre`, `descripcion`, `precio`, `stock`, `imagen`, `activo`, `id_Categoria`, `id_Marca`, `f_Creacion`) VALUES
(1, 'Queso Manchego', 'Queso tradicional español de leche de oveja.', 15.99, 50, '/images/queso-manchego.jpg', NULL, NULL, NULL, '2026-04-15 21:18:47'),
(2, 'Queso Parmesano', 'Queso italiano duro de leche de vaca, perfecto para pastas.', 18.75, 30, '/images/queso-parmesano.jpg', NULL, NULL, NULL, '2026-04-15 21:18:47');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `provincia`
--

CREATE TABLE `provincia` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT NULL,
  `id_Pais` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `estado` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`id`, `nombre`, `descripcion`, `estado`) VALUES
(1, 'Administrador', 'Perfil con acceso total a la gestión de productos, pedidos y usuarios.', 1),
(2, 'Cliente', 'Perfil para realizar compras y ver historial de pedidos.', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol_usuario`
--

CREATE TABLE `rol_usuario` (
  `id` int(11) NOT NULL,
  `activo` tinyint(1) DEFAULT NULL,
  `id_Usuario` int(11) DEFAULT NULL,
  `id_Rol` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol_usuario`
--

INSERT INTO `rol_usuario` (`id`, `activo`, `id_Usuario`, `id_Rol`) VALUES
(1, 1, 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `pass` varchar(255) DEFAULT NULL,
  `dni` int(11) DEFAULT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `apellido` varchar(100) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT NULL,
  `telefono` int(11) DEFAULT NULL,
  `f_Creacion` datetime DEFAULT NULL,
  `f_Modif` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `email`, `pass`, `dni`, `nombre`, `apellido`, `activo`, `telefono`, `f_Creacion`, `f_Modif`) VALUES
(1, 'admin@gmail.com', '$2b$10$n0p/fmwIjb7caj2/s5fwfebETwR5gOwX7pFy8ww4mJ3vj/T6d55a.', 0, 'admin', 'principal', NULL, 0, NULL, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_Usuario` (`id_Usuario`);

--
-- Indices de la tabla `carritodetalles`
--
ALTER TABLE `carritodetalles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_Carrito` (`id_Carrito`),
  ADD KEY `id_Producto` (`id_Producto`);

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `contacto`
--
ALTER TABLE `contacto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_Usuario` (`id_Usuario`),
  ADD KEY `id_Estado` (`id_Estado`);

--
-- Indices de la tabla `direccion`
--
ALTER TABLE `direccion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_localidad` (`id_localidad`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `encargado`
--
ALTER TABLE `encargado`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `encargadopedido`
--
ALTER TABLE `encargadopedido`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `estadoform`
--
ALTER TABLE `estadoform`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `localidad`
--
ALTER TABLE `localidad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_provincia` (`id_provincia`);

--
-- Indices de la tabla `marca`
--
ALTER TABLE `marca`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `pago`
--
ALTER TABLE `pago`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `pais`
--
ALTER TABLE `pais`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idEncargado` (`idEncargado`),
  ADD KEY `idUsuario` (`idUsuario`),
  ADD KEY `idDireccion` (`idDireccion`),
  ADD KEY `idPago` (`idPago`);

--
-- Indices de la tabla `pedidodetalles`
--
ALTER TABLE `pedidodetalles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_Producto` (`id_Producto`),
  ADD KEY `id_Pedido` (`id_Pedido`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_Categoria` (`id_Categoria`),
  ADD KEY `id_Marca` (`id_Marca`);

--
-- Indices de la tabla `provincia`
--
ALTER TABLE `provincia`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_Pais` (`id_Pais`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `rol_usuario`
--
ALTER TABLE `rol_usuario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_Usuario` (`id_Usuario`),
  ADD KEY `id_Rol` (`id_Rol`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `carrito`
--
ALTER TABLE `carrito`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `carritodetalles`
--
ALTER TABLE `carritodetalles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `contacto`
--
ALTER TABLE `contacto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `direccion`
--
ALTER TABLE `direccion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `encargado`
--
ALTER TABLE `encargado`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `encargadopedido`
--
ALTER TABLE `encargadopedido`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `estadoform`
--
ALTER TABLE `estadoform`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `localidad`
--
ALTER TABLE `localidad`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `marca`
--
ALTER TABLE `marca`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pago`
--
ALTER TABLE `pago`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pais`
--
ALTER TABLE `pais`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pedido`
--
ALTER TABLE `pedido`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pedidodetalles`
--
ALTER TABLE `pedidodetalles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `provincia`
--
ALTER TABLE `provincia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `rol_usuario`
--
ALTER TABLE `rol_usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD CONSTRAINT `carrito_ibfk_1` FOREIGN KEY (`id_Usuario`) REFERENCES `usuario` (`id`);

--
-- Filtros para la tabla `carritodetalles`
--
ALTER TABLE `carritodetalles`
  ADD CONSTRAINT `carritodetalles_ibfk_1` FOREIGN KEY (`id_Carrito`) REFERENCES `carrito` (`id`),
  ADD CONSTRAINT `carritodetalles_ibfk_2` FOREIGN KEY (`id_Producto`) REFERENCES `producto` (`id`);

--
-- Filtros para la tabla `contacto`
--
ALTER TABLE `contacto`
  ADD CONSTRAINT `contacto_ibfk_1` FOREIGN KEY (`id_Usuario`) REFERENCES `usuario` (`id`),
  ADD CONSTRAINT `contacto_ibfk_2` FOREIGN KEY (`id_Estado`) REFERENCES `estadoform` (`id`);

--
-- Filtros para la tabla `direccion`
--
ALTER TABLE `direccion`
  ADD CONSTRAINT `direccion_ibfk_1` FOREIGN KEY (`id_localidad`) REFERENCES `localidad` (`id`),
  ADD CONSTRAINT `direccion_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`);

--
-- Filtros para la tabla `localidad`
--
ALTER TABLE `localidad`
  ADD CONSTRAINT `localidad_ibfk_1` FOREIGN KEY (`id_provincia`) REFERENCES `provincia` (`id`);

--
-- Filtros para la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD CONSTRAINT `pedido_ibfk_1` FOREIGN KEY (`idEncargado`) REFERENCES `encargado` (`id`),
  ADD CONSTRAINT `pedido_ibfk_2` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`id`),
  ADD CONSTRAINT `pedido_ibfk_3` FOREIGN KEY (`idDireccion`) REFERENCES `direccion` (`id`),
  ADD CONSTRAINT `pedido_ibfk_4` FOREIGN KEY (`idPago`) REFERENCES `pago` (`id`);

--
-- Filtros para la tabla `pedidodetalles`
--
ALTER TABLE `pedidodetalles`
  ADD CONSTRAINT `pedidodetalles_ibfk_1` FOREIGN KEY (`id_Producto`) REFERENCES `producto` (`id`),
  ADD CONSTRAINT `pedidodetalles_ibfk_2` FOREIGN KEY (`id_Pedido`) REFERENCES `pedido` (`id`);

--
-- Filtros para la tabla `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`id_Categoria`) REFERENCES `categoria` (`id`),
  ADD CONSTRAINT `producto_ibfk_2` FOREIGN KEY (`id_Marca`) REFERENCES `marca` (`id`);

--
-- Filtros para la tabla `provincia`
--
ALTER TABLE `provincia`
  ADD CONSTRAINT `provincia_ibfk_1` FOREIGN KEY (`id_Pais`) REFERENCES `pais` (`id`);

--
-- Filtros para la tabla `rol_usuario`
--
ALTER TABLE `rol_usuario`
  ADD CONSTRAINT `rol_usuario_ibfk_1` FOREIGN KEY (`id_Usuario`) REFERENCES `usuario` (`id`),
  ADD CONSTRAINT `rol_usuario_ibfk_2` FOREIGN KEY (`id_Rol`) REFERENCES `rol` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
