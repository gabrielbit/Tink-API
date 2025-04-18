const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración del almacenamiento para las imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(__dirname, '../public/uploads/organizations');
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
    cb(null, 'org-' + uniqueSuffix + ext);
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

// Middleware para subir una sola imagen (mainImage)
const uploadMainImage = upload.single('mainImage');

// Middleware de manejo de errores
const handleUploadErrors = (req, res, next) => {
  uploadMainImage(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Error de Multer
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'El archivo es demasiado grande. Máximo 5MB.' });
      }
      return res.status(400).json({ message: `Error de carga: ${err.message}` });
    } else if (err) {
      // Error personalizado o cualquier otro error
      return res.status(400).json({ message: err.message });
    }
    // Si no hay error, continuar
    next();
  });
};

module.exports = {
  handleUploadErrors
}; 