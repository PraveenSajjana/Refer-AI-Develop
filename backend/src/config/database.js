const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const ssl =
  process.env.DB_SSL === "true"
    ? {
        ca: fs.readFileSync(path.join(__dirname, "../../certs/ca.pem")),
      }
    : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "referai",

  ssl,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("MySQL Database connected successfully");
    connection.release();
  } catch (error) {
    // console.error("Database connection failed:", error);
    console.error("Database connection failed:");
console.error(error);
    process.exit(1);
  }
}

module.exports = { pool, testConnection };