import mysql from "mysql2/promise";
import config from "../config.js";

export const dbSettings = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "guessthis",
};

async function getConnection() {
  try {
    const pool = await mysql.createConnection(dbSettings);
    return pool;
  } catch (error) {
    console.log("")
    console.error(error);
  }
};

export { mysql, getConnection };
