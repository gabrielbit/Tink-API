const sequelize = require('../config/database');
const User = require('../models/User');

async function checkUsers() {
  try {
    // Obtener todos los usuarios
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'createdAt']
    });
    
    console.log('Usuarios existentes:');
    if (users.length === 0) {
      console.log('No hay usuarios en la base de datos.');
    } else {
      users.forEach(user => {
        console.log(`- ID: ${user.id}`);
        console.log(`  Nombre: ${user.name}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Creado: ${user.createdAt}`);
        console.log('---');
      });
    }
  } catch (error) {
    console.error('Error al verificar usuarios:', error);
  } finally {
    process.exit();
  }
}

// Ejecutar la función
checkUsers(); 