require('dotenv').config();
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

const projectData = require("../data/projectData");
const sectorData = require("../data/sectorData");

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

sequelize
  .sync({ force: true }) // optional: force will drop old tables
  .then(async () => {
    try {
      await Sector.bulkCreate(sectorData);
      await Project.bulkCreate(projectData);
      await sequelize.query(`SELECT setval(pg_get_serial_sequence('"Sectors"', 'id'), (SELECT MAX(id) FROM "Sectors"))`);
      await sequelize.query(`SELECT setval(pg_get_serial_sequence('"Projects"', 'id'), (SELECT MAX(id) FROM "Projects"))`);
      console.log("✔️ Data inserted successfully.");
    } catch (err) {
      console.log("❌ Error inserting data:", err.message);
    } finally {
      process.exit();
    }
  })
  .catch(err => console.log("❌ Unable to connect to database:", err));
