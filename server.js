const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);

// Ruta básica
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

// Puerto
const PORT = process.env.PORT || 3000;

// Sincronizar base de datos y iniciar servidor
sequelize.sync({ force: true }).then(() => {
  console.log('Base de datos sincronizada');
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
}).catch(err => {
  console.error('Error al sincronizar la base de datos:', err);
}); 