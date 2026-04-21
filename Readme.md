# 🥛 Milkchain

**Sistema de trazabilidad y gestión para la industria láctea**
Proyecto de Ingeniería de Software II

---

## 📄 Documentación

* 📄 [Informe (PDF)](https://github.com/yoquienmas/Milkchain/blob/main/Tp%20integrador%20ingenieria%202.pdf)
* 🌐 [Documento de trabajo](https://docs.google.com/document/d/1AhuGLTd8zotH78pUz21tR1wL1b0vp-mbNQAwEmdIoNQ/edit)

---

## 🧭 Índice

* [Tecnologías](#-tecnologías-utilizadas)
* [Instalación](#-instrucciones-de-instalación)
* [Variables de entorno](#-variables-de-entorno)
* [Base de datos](#-configuración-de-la-base-de-datos)
* [Ejecución](#-ejecución-del-proyecto)
* [Datos de prueba](#-datos-de-prueba)

---

## 🛠️ Tecnologías Utilizadas

| Componente    | Tecnología        |
| ------------- | ----------------- |
| Frontend      | React / Vite      |
| Backend       | Node.js / Express |
| Base de Datos | MySQL             |
| Auth          | JWT               |

---

## 💻 Requisitos

* Node.js 18+
* npm
* MySQL
* Git

---

## 🚀 Instalación

### 1. Clonar repositorio

```bash
git clone https://github.com/yoquienmas/Milkchain.git
cd Milkchain
```

### 2. Frontend

```bash
cd client
npm install
```

### 3. Backend

```bash
cd server
npm install
```

---

## 🔑 Variables de entorno

Crear `.env` en `/server`:

```env
PORT=3000
CLIENT_URL=http://localhost:5173

TOKEN_SECRET=tu_secreto

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=MilkChain
DB_PORT=3306
```

---

## 🗄️ Base de Datos

1. Crear DB `MilkChain`
2. Importar `milkchain.sql`
3. Verificar credenciales

---

## ▶️ Ejecución

**Backend**

```bash
cd server
npm run dev
```

**Frontend**

```bash
cd client
npm run dev
```

Abrir: http://localhost:5173

---

## 🧪 Datos de prueba

* Email: `admin@gmail.com`
* Password: `admin123`

---

## 👥 Equipo

* Maria Daniela Fernandez Gotusso
* Cristian Leandro Diaz

---
