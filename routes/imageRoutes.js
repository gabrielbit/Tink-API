const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/authMiddleware');

// Configuración de multer para el almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(__dirname, '../public/uploads');
    // Crear directorio si no existe
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'img-' + uniqueSuffix + ext);
  }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite de 5MB
  }
});

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Subir una imagen - requiere middleware de upload
router.post('/upload', upload.single('image'), imageController.uploadImage);

// Obtener todas las imágenes para una entidad
router.get('/:entityType/:entityId', imageController.getEntityImages);

// Obtener la imagen principal de una entidad
router.get('/:entityType/:entityId/main', imageController.getMainImage);

// Establecer una imagen como principal
router.put('/:imageId/set-main', imageController.setMainImage);

// Eliminar una imagen
router.delete('/:imageId', imageController.deleteImage);

module.exports = router; 