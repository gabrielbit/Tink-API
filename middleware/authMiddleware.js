const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    // Obtener el encabezado de autorización
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
    }
    
    try {
      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta');
      
      // Buscar usuario por id
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        return res.status(401).json({ message: 'Usuario no encontrado.' });
      }
      
      // Agregar el usuario a la solicitud
      req.user = user;
      
      next();
    } catch (tokenError) {
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token expirado. Por favor, refresque su token.',
          expired: true
        });
      } else {
        return res.status(403).json({ message: 'Token inválido.' });
      }
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error en la autenticación.' });
  }
};

module.exports = { authenticateToken }; 