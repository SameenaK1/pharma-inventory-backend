// Require Util Database
const db = require("../database");

module.exports = class User {
  constructor(name, username, email, password) {
    this.name = name;
    this.username = username;
    this.email = email;
    this.password = password;
  }

  // Helper method to ensure the schema and table exist before any operation
  static async ensureTableExists() {
    // 1. Create the schema if it doesn't exist
    const createSchemaQuery = `CREATE SCHEMA IF NOT EXISTS pharma;`;
    await db.query(createSchemaQuery);

    // 2. Create the table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS pharma.user (
        id SERIAL PRIMARY KEY,
        fullname VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        lastLogin TIMESTAMP WITH TIME ZONE,
        loggedIn BOOLEAN DEFAULT FALSE,
        loginCount INT DEFAULT 0
      );
    `;
    await db.query(createTableQuery);
  }

  async create_user() {
    // Ensure table exists first
    await User.ensureTableExists();

    // PostgreSQL uses $1, $2, $3 placeholders instead of ?
    const query = `
      INSERT INTO pharma.user (fullname, username, email, password) 
      VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    // Using db.query (assuming your utils/database uses the standard 'pg' pool.query mapping)
    return db.query(query, [this.name, this.username, this.email, this.password]);
  }

  static async logged_in(email) {
    await User.ensureTableExists();

    const query = `
      UPDATE pharma.user 
      SET lastLogin = CURRENT_TIMESTAMP, loggedIn = true, loginCount = loginCount + 1 
      WHERE email = $1;
    `;
    return db.query(query, [email]);
  }

  static async findOne(email) {
    await User.ensureTableExists();

    const query = `SELECT id, password, username FROM pharma.user WHERE email = $1;`;
    return db.query(query, [email]);
  }

  static async findOneByID(id) {
    await User.ensureTableExists();

    const query = `SELECT id, password, username FROM pharma.user WHERE id = $1;`;
    return db.query(query, [id]);
  }

  static async log_out(id) {
    await User.ensureTableExists();

    const query = `UPDATE pharma.user SET loggedIn = false WHERE id = $1;`;
    return db.query(query, [id]);
  }
};