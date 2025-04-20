const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

async function createDonationTables() {
  try {
    // Crear la tabla credit_card
    await sequelize.getQueryInterface().createTable('credit_card', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      number: {
        type: DataTypes.TEXT
      },
      cbu: {
        type: DataTypes.TEXT
      },
      country: {
        type: DataTypes.TEXT
      },
      holder: {
        type: DataTypes.INTEGER,
        comment: '1: VISA; 2: MasterCard; 3: AMEX; 4: Cabal'
      },
      type: {
        type: DataTypes.INTEGER,
        comment: '1: Credit; 2: Debit'
      },
      end_date: {
        type: DataTypes.DATE
      },
      code: {
        type: DataTypes.INTEGER
      },
      created_at: {
        type: DataTypes.DATE
      },
      updated_at: {
        type: DataTypes.DATE
      },
      deleted_at: {
        type: DataTypes.DATE
      }
    });

    await sequelize.getQueryInterface().addIndex('credit_card', ['user_id'], {
      name: 'idx_creditcard_user_id'
    });

    // Crear la tabla card_users
    await sequelize.getQueryInterface().createTable('card_users', {
      user_id: {
        type: DataTypes.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        primaryKey: true,
        onDelete: 'CASCADE'
      },
      card_id: {
        type: DataTypes.UUID,
        references: {
          model: 'credit_card',
          key: 'id'
        },
        primaryKey: true,
        onDelete: 'CASCADE'
      },
      is_default: {
        type: DataTypes.INTEGER
      },
      created_at: {
        type: DataTypes.DATE
      },
      updated_at: {
        type: DataTypes.DATE
      },
      deleted_at: {
        type: DataTypes.DATE
      }
    });

    await sequelize.getQueryInterface().addIndex('card_users', ['user_id', 'card_id'], {
      name: 'idx_card_users'
    });

    // Crear la tabla project_users
    await sequelize.getQueryInterface().createTable('project_users', {
      user_id: {
        type: DataTypes.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        primaryKey: true,
        onDelete: 'CASCADE'
      },
      project_id: {
        type: DataTypes.UUID,
        references: {
          model: 'projects',
          key: 'id'
        },
        primaryKey: true,
        onDelete: 'CASCADE'
      },
      is_owner: {
        type: DataTypes.INTEGER
      },
      category_id: {
        type: DataTypes.INTEGER
      }
    });

    await sequelize.getQueryInterface().addIndex('project_users', ['user_id', 'project_id'], {
      name: 'idx_project_users'
    });

    // Crear la tabla donations
    await sequelize.getQueryInterface().createTable('donations', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      start_date: {
        type: DataTypes.DATE
      },
      end_date: {
        type: DataTypes.DATE
      },
      is_recurrent: {
        type: DataTypes.INTEGER
      },
      frecuency: {
        type: DataTypes.INTEGER
      },
      created_at: {
        type: DataTypes.DATE
      },
      updated_at: {
        type: DataTypes.DATE
      },
      deleted_at: {
        type: DataTypes.DATE
      },
      total_amount: {
        type: DataTypes.FLOAT
      },
      auto_adjustment: {
        type: DataTypes.INTEGER,
        comment: '1: yes; 2: no; 3: call me'
      }
    });

    await sequelize.getQueryInterface().addIndex('donations', ['user_id'], {
      name: 'idx_donations_user_id'
    });

    // Crear la tabla project_donations
    await sequelize.getQueryInterface().createTable('project_donations', {
      project_id: {
        type: DataTypes.UUID,
        references: {
          model: 'projects',
          key: 'id'
        },
        primaryKey: true,
        onDelete: 'CASCADE'
      },
      donation_id: {
        type: DataTypes.UUID,
        references: {
          model: 'donations',
          key: 'id'
        },
        primaryKey: true,
        onDelete: 'CASCADE'
      },
      perc_of_total_ammount: {
        type: DataTypes.FLOAT
      },
      value_of_total_ammount: {
        type: DataTypes.FLOAT
      },
      user_id: {
        type: DataTypes.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      created_at: {
        type: DataTypes.DATE
      },
      updated_at: {
        type: DataTypes.DATE
      },
      deleted_at: {
        type: DataTypes.DATE
      }
    });

    await sequelize.getQueryInterface().addIndex('project_donations', ['project_id', 'donation_id'], {
      name: 'idx_project_donations'
    });

    // Crear la tabla impact_categories
    await sequelize.getQueryInterface().createTable('impact_categories', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.TEXT
      },
      type: {
        type: DataTypes.INTEGER
      }
    });

    await sequelize.getQueryInterface().addIndex('impact_categories', ['name'], {
      name: 'idx_impact_categories_name'
    });

    // Crear la tabla donation_log
    await sequelize.getQueryInterface().createTable('donation_log', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      donation_id: {
        type: DataTypes.UUID,
        references: {
          model: 'donations',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: DataTypes.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      project_id: {
        type: DataTypes.UUID,
        references: {
          model: 'projects',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      organizations_id: {
        type: DataTypes.UUID,
        references: {
          model: 'organizations',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      donation_date: {
        type: DataTypes.DATE
      },
      amount: {
        type: DataTypes.FLOAT
      },
      perc_of_total_ammount: {
        type: DataTypes.FLOAT
      },
      user_name: {
        type: DataTypes.TEXT
      },
      user_email: {
        type: DataTypes.TEXT
      },
      project_name: {
        type: DataTypes.TEXT
      },
      organizations_name: {
        type: DataTypes.TEXT
      },
      created_at: {
        type: DataTypes.DATE
      }
    });

    await sequelize.getQueryInterface().addIndex('donation_log', ['donation_id', 'user_id', 'project_id'], {
      name: 'idx_donation_log'
    });

    // Crear la tabla social_networks_types
    await sequelize.getQueryInterface().createTable('social_networks_types', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.TEXT,
        comment: 'Instagram, Facebook, TikTok, etc.'
      },
      icon: {
        type: DataTypes.TEXT,
        comment: 'Opcional: para guardar el ícono o clase CSS'
      },
      base_url: {
        type: DataTypes.TEXT,
        comment: 'URL base de la red social'
      },
      created_at: {
        type: DataTypes.DATE
      },
      updated_at: {
        type: DataTypes.DATE
      },
      deleted_at: {
        type: DataTypes.DATE
      }
    });

    await sequelize.getQueryInterface().addIndex('social_networks_types', ['name'], {
      name: 'idx_social_networks_types_name'
    });

    // Crear la tabla social_networks
    await sequelize.getQueryInterface().createTable('social_networks', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      social_network_type_id: {
        type: DataTypes.UUID,
        references: {
          model: 'social_networks_types',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      entity_id: {
        type: DataTypes.UUID,
        comment: 'ID del proyecto u organización'
      },
      entity_type: {
        type: DataTypes.TEXT,
        comment: 'projects o organizations'
      },
      username: {
        type: DataTypes.TEXT,
        comment: 'Usuario o identificador en la red social'
      },
      url: {
        type: DataTypes.TEXT,
        comment: 'URL completa del perfil'
      },
      created_at: {
        type: DataTypes.DATE
      },
      updated_at: {
        type: DataTypes.DATE
      },
      deleted_at: {
        type: DataTypes.DATE
      }
    });

    await sequelize.getQueryInterface().addIndex('social_networks', ['entity_id', 'entity_type'], {
      name: 'idx_social_networks_entity'
    });

    await sequelize.getQueryInterface().addIndex('social_networks', ['social_network_type_id'], {
      name: 'idx_social_networks_type'
    });

    console.log('Tablas de donaciones y redes sociales creadas correctamente');
  } catch (error) {
    console.error('Error al crear las tablas:', error);
  } finally {
    await sequelize.close();
  }
}

createDonationTables(); 