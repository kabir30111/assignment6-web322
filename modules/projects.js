require('dotenv').config();
require('pg');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.PG_CONNECTION_STRING, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// Models
const Sector = sequelize.define('Sector', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  sector_name: Sequelize.STRING
}, { timestamps: false });

const Project = sequelize.define('Project', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  title: Sequelize.STRING,
  feature_img_url: Sequelize.STRING,
  summary_short: Sequelize.TEXT,
  intro_short: Sequelize.TEXT,
  impact: Sequelize.TEXT,
  original_source_url: Sequelize.STRING
}, { timestamps: false });

Project.belongsTo(Sector, { foreignKey: 'sector_id' });

// 🔧 FUNCTIONS FOR ASSIGNMENT 5

function initialize() {
  return sequelize.sync();
}

function getAllProjects() {
  return Project.findAll({ include: [Sector] });
}

function getProjectById(id) {
  return Project.findAll({ include: [Sector], where: { id } }).then(data => {
    if (data.length > 0) return data[0];
    else throw "Unable to find requested project";
  });
}

function getProjectsBySector(sector) {
  const { Op } = Sequelize;
  return Project.findAll({
    include: [Sector],
    where: {
      '$Sector.sector_name$': {
        [Op.iLike]: `%${sector}%`
      }
    }
  }).then(data => {
    if (data.length > 0) return data;
    else throw "Unable to find requested projects";
  });
}

function getAllSectors() {
  return Sector.findAll();
}

function addProject(data) {
  return Project.create(data);
}

function editProject(id, data) {
  return Project.update(data, { where: { id } });
}

function deleteProject(id) {
  return Project.destroy({ where: { id } });
}

module.exports = {
  initialize,
  getAllProjects,
  getProjectById,
  getProjectsBySector,
  getAllSectors,
  addProject,
  editProject,
  deleteProject
};
