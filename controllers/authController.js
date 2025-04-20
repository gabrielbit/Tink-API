const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const crypto = require('crypto');
const { Op } = require('sequelize');

// Duración del access token: 15 minutos
const ACCESS_TOKEN_EXPIRY = '15m';
// Duración del refresh token: 7 días
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || 'tu_clave_secreta',
    { expiresIn: process.env.JWT_EXPIRES_IN || ACCESS_TOKEN_EXPIRY }
  );
};

const generateRefreshToken = async (userId) => {
  // Generar un token aleatorio
  const refreshToken = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);

  // Guardar el refresh token en la base de datos
  await RefreshToken.create({
    token: refreshToken,
    userId: userId,
    expiresAt: expiresAt,
    isRevoked: false
  });

  return {
    token: refreshToken,
    expiresAt: expiresAt
  };
};

// Limpiar tokens antiguos o revocados
const removeOldTokens = async (userId) => {
  await RefreshToken.destroy({
    where: {
      userId: userId,
      [Op.or]: [
        { expiresAt: { [Op.lt]: new Date() } },
        { isRevoked: true }
      ]
    }
  });
};

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Crear nuevo usuario
    const user = await User.create({
      email,
      password,
      name
    });

    // Generar tokens
    const accessToken = generateAccessToken(user);
    const refreshTokenData = await generateRefreshToken(user.id);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      accessToken,
      refreshToken: refreshTokenData.token,
      refreshTokenExpiry: refreshTokenData.expiresAt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Validar contraseña
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Limpiar tokens antiguos
    await removeOldTokens(user.id);

    // Generar tokens
    const accessToken = generateAccessToken(user);
    const refreshTokenData = await generateRefreshToken(user.id);

    res.json({
      message: 'Login exitoso',
      accessToken,
      refreshToken: refreshTokenData.token,
      refreshTokenExpiry: refreshTokenData.expiresAt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token no proporcionado' });
    }

    // Buscar el token en la base de datos
    const tokenDoc = await RefreshToken.findOne({
      where: {
        token: refreshToken,
        expiresAt: { [Op.gt]: new Date() },
        isRevoked: false
      }
    });

    if (!tokenDoc) {
      return res.status(401).json({ message: 'Refresh token inválido o expirado' });
    }

    // Buscar el usuario asociado al token
    const user = await User.findByPk(tokenDoc.userId);
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    // Revocar el token actual
    await tokenDoc.update({ isRevoked: true });

    // Generar nuevos tokens
    const accessToken = generateAccessToken(user);
    const newRefreshTokenData = await generateRefreshToken(user.id);

    // Limpiar tokens antiguos
    await removeOldTokens(user.id);

    res.json({
      accessToken,
      refreshToken: newRefreshTokenData.token,
      refreshTokenExpiry: newRefreshTokenData.expiresAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al refrescar token', error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token no proporcionado' });
    }

    // Marcar el token como revocado
    const tokenDoc = await RefreshToken.findOne({
      where: { token: refreshToken }
    });

    if (tokenDoc) {
      await tokenDoc.update({ isRevoked: true });
    }

    res.json({ message: 'Sesión cerrada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al cerrar sesión', error: error.message });
  }
}; 