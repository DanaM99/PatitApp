# 🐾 PatitApp

**PatitApp** es una aplicación web desarrollada con el objetivo de ayudar a la comunidad a encontrar y reportar mascotas perdidas o encontradas. Ofrece una plataforma sencilla e intuitiva donde cualquier persona puede publicar un reporte, ver reportes activos o resueltos, y contactar a los dueños o halladores mediante WhatsApp.

---

## 🚀 Funcionalidades principales

-  **Listado de reportes**: visualización de mascotas perdidas y encontradas en forma de tarjetas interactivas.
-  **Detalle de cada mascota**: vista ampliada con foto, descripción, ubicación, fecha y estado del reporte.
-  **Edición de reportes**:
  - Cambiar el estado (Activo / Resuelto)
  - Actualizar información: nombre, tipo de animal, ubicación, zona, descripción, fecha, teléfono e imagen.
-  **Subida de imágenes**: permite subir fotos desde el formulario de carga o edición del reporte.
-  **Mensajes interactivos** con [SweetAlert2](https://sweetalert2.github.io/): para confirmaciones, errores y notificaciones visuales.
-  **Registro e inicio de sesión**:
  - Validación de datos desde frontend.
  - Contraseñas encriptadas en la base de datos.
-  **Contacto por WhatsApp**: desde cualquier reporte se puede contactar rápidamente al dueño o hallador.

---

## 🛠️ Tecnologías utilizadas

| Área         | Tecnologías / Herramientas |
|--------------|----------------------------|
| **Frontend** | HTML5, CSS3, JavaScript    |
| **Backend**  | PHP (puro)                 |
| **Base de Datos** | MySQL (gestión local con XAMPP) |
| **Librerías**| [SweetAlert2](https://sweetalert2.github.io/), FontAwesome |
| **Servidor local** | XAMPP (Apache + MySQL) |

---

## 🗃️ Estructura de Base de Datos (MySQL)

La base de datos utilizada se llama: `patitapp_db`

### Tablas principales:

#### `usuarios`
#### `imagenes`
#### `imagenes_reporte`
#### `reportes`
#### `estado_reporte`
#### `tipor_animales`
#### `tipos_reporte`
#### `zonas`


---

## 💻 Cómo clonar y correr el proyecto localmente

### Requisitos previos
- Tener instalado [XAMPP](https://www.apachefriends.org/)
- Tener habilitado Apache y MySQL
- Tener configurado un entorno de desarrollo (Visual Studio Code o similar)

### Pasos:

1. Clonar este repositorio:
   ```bash
   git clone https://github.com/usuario/patitapp.git

   ---
## 💻 Integrantes


*[Ailín Luz Piffer](https://github.com/luzpiffer)* 

*[Dana Perez Moreno](https://github.com/DanaM99)* 

*[Micaela Navarro](https://github.com/micaelanavarrovdr)* 
