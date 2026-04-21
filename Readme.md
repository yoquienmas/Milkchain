# 🥛 Milkchain

> [cite_start]**Sistema de trazabilidad y gestión para la industria láctea**[cite: 1].
> [cite_start]Proyecto desarrollado para la cátedra de **Ingeniería de Software II**[cite: 1].

-----

## 📄 Documentacion

Puedes acceder a la documentación técnica del proyecto a través de los siguientes enlaces:

  * [cite_start]📄 **[Informe técnico (PDF)](https://github.com/yoquienmas/Milkchain/blob/main/Tp%20integrador%20ingenieria%202.pdf)** [cite: 1]
  * [cite_start]🌐 **[Documento de trabajo (Google Docs)](https://docs.google.com/document/d/1AhuGLTd8zotH78pUz21tR1wL1b0vp-mbNQAwEmdIoNQ/edit)** [cite: 1]

-----

## 🛠️ Tecnologías Utilizadas

| Componente | Tecnología |
| :--- | :--- |
| **Frontend** | [cite_start]React / Vite [cite: 2, 3] |
| **Backend** | [cite_start]Node.js / Express [cite: 2, 4] |
| **Base de Datos** | [cite_start]MySQL [cite: 5] |
| **Autenticación** | [cite_start]JWT (JSON Web Tokens) [cite: 6, 7] |

-----

## 💻 Requisitos

Antes de comenzar, asegúrate de tener instalado:

  * [cite_start]**Node.js 18+** [cite: 8]
  * [cite_start]**npm** (gestor de paquetes) [cite: 8]
  * [cite_start]**MySQL** [cite: 8]
  * [cite_start]**Git** [cite: 8]

-----

## 🚀 Instalación y Configuración

### 1\. Clonar el repositorio

```bash
git clone https://github.com/yoquienmas/Milkchain.git
cd Milkchain
```

### 2\. Configurar el Frontend

```bash
cd client
npm install
```

### 3\. Configurar el Backend

```bash
cd ../server
npm install
```

-----

## 🔑 Variables de Entorno

En la carpeta `/server`, crea un archivo `.env` con la siguiente estructura básica:

```env
PORT=3000
CLIENT_URL=http://localhost:5173

TOKEN_SECRET=tu_secreto_aqui

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=MilkChain
DB_PORT=3306
```

-----

## 🗄️ Base de Datos

1.  Crea una base de datos local llamada `MilkChain`.
2.  Importa el archivo `milkchain.sql` que se encuentra en la raíz del proyecto.
3.  Asegúrate de que los datos de conexión en el `.env` coincidan con tu configuración de MySQL local.

-----

## ▶️ Ejecución del Proyecto

Para iniciar el sistema, abre dos terminales diferentes:

**Terminal 1 (Servidor):**

```bash
cd server
npm run dev
```

**Terminal 2 (Cliente):**

```bash
cd client
npm run dev
```

El sistema estará disponible en: [http://localhost:5173](https://www.google.com/search?q=http://localhost:5173)

-----

## 🧪 Datos de Acceso (Prueba)

Puedes ingresar al sistema con el perfil de administrador:

  * **Email:** `admin@gmail.com`
  * **Password:** `admin123`

-----

## 👥 Equipo de Trabajo

  * **Maria Daniela Fernandez Gotusso**
  * **Cristian Leandro Diaz**

-----

Developed with ❤️ for software engineering.