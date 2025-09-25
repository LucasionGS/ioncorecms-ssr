import { Sequelize } from "sequelize";
import process from "node:process";
import fs from "node:fs";

const dbName = process.env.DB_DATABASE || "ioncorecms";
const dbUser = process.env.DB_USERNAME || "ioncorecms";
const dbPassword = process.env.DB_PASSWORD || "ioncorecms";
const dbHost = process.env.DB_HOST || "localhost";
const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306;

const sequelize = new Sequelize({
  dialect: "mysql",
  host: dbHost,
  port: dbPort,
  database: dbName,
  username: dbUser,
  password: dbPassword,
  logging: process.env.NODE_ENV === 'production' ? false : console.log,
});

export default sequelize;

// Import all models here to ensure they are registered
const modelsDir = new URL("./models/system", import.meta.url);
fs.readdirSync(modelsDir).forEach((file) => {
  if (file.endsWith(".ts")) {
    import(`${modelsDir.href}/${file}`).then(() => {
      console.log(`Imported model->system from file: ${file}`);
    }).catch((err) => {
      console.error(`Failed to import model->system from file: ${file}`, err);
    });
  }
});

// Import all nodes
const modelsNodesDir = new URL("./models/nodes", import.meta.url);
fs.readdirSync(modelsNodesDir).forEach((file) => {
  if (file.endsWith(".ts")) {
    import(`${modelsNodesDir.href}/${file}`).then(() => {
      console.log(`Imported model->node from file: ${file}`);
    }).catch((err) => {
      console.error(`Failed to import model->node from file: ${file}`, err);
    });
  }
});