const Organization = require('./Organization');
const Project = require('./Project');
const Category = require('./Category');
const ProjectCategory = require('./ProjectCategory');

// Relación entre Organization y Project (1:N)
Organization.hasMany(Project, {
  foreignKey: 'organizationId',
  as: 'projects'
});

Project.belongsTo(Organization, {
  foreignKey: 'organizationId',
  as: 'organization'
});

// Relación entre Project y Category (N:M)
Project.belongsToMany(Category, {
  through: ProjectCategory,
  foreignKey: 'projectId',
  otherKey: 'categoryId',
  as: 'categories'
});

Category.belongsToMany(Project, {
  through: ProjectCategory,
  foreignKey: 'categoryId',
  otherKey: 'projectId',
  as: 'projects'
});

module.exports = {
  Organization,
  Project,
  Category,
  ProjectCategory
}; 