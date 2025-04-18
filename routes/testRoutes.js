const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');

// Ruta de prueba para obtener todas las organizaciones sin filtros
router.get('/organizations', async (req, res) => {
  try {
    const organizations = await Organization.findAll();
    return res.status(200).json({ 
      count: organizations.length,
      organizations
    });
  } catch (error) {
    console.error('Error en la ruta de prueba:', error);
    return res.status(500).json({ message: 'Error al obtener organizaciones en ruta de prueba' });
  }
});

module.exports = router; 