const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();


const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});


const checkDatabaseExists = (dbName) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT SCHEMA_NAME 
      FROM information_schema.SCHEMATA 
      WHERE SCHEMA_NAME = ?`;
    connection.query(sql, [dbName], (error, results) => {
      if (error) return reject(error);
      resolve(results.length > 0);
    });
  });
};


const createDatabase = (dbName) => {
  return new Promise((resolve, reject) => {
    const sql = `CREATE DATABASE ??`;
    connection.query(sql, [dbName], (error) => {
      if (error) return reject(error);
      console.log(`Database ${dbName} created.`);
      resolve();
    });
  });
};

const changeDatabase = (dbName) => {
  return new Promise((resolve, reject) => {
    const sql = `USE ??`;
    connection.query(sql, [dbName], (error) => {
      if (error) return reject(error);
      console.log(`Using database ${dbName}`);
      resolve();
    });
  });
};

const setupDatabase = async (dbName) => {
  try {
    const dbExists = await checkDatabaseExists(dbName);
    if (!dbExists) {
      await createDatabase(dbName);
    } else {
      console.log(`Database ${dbName} already exists.`);
    }

    await changeDatabase(dbName);

  } catch (error) {
    console.error("Error setting up the database:", error);
  }
};


const checkUsersTable = (tableName) => {
  return new Promise((resolve, reject) => {
      const sql = `
      SELECT COUNT(*)
      FROM information_schema.tables 
      WHERE table_schema = 'MessagingApplication' 
      AND table_name = ?`;

      connection.query(sql, [tableName], (error, results) => {
          if (error) return reject(error);
          const tableExists = results[0]['COUNT(*)'] > 0;
          console.log(`Table ${tableName} exists: ${tableExists}`);
          resolve(tableExists);
      });
  });
}

const createUsersTable = () => {
  return new Promise((resolve, reject) => {
      const sql = `
      CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(10),
          institution VARCHAR(20),
          role ENUM('Teacher', 'Student', 'Institute') NOT NULL,
          status ENUM('Online', 'Offline') NOT NULL DEFAULT 'Offline',
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

      )`;

      connection.query(sql, (err, result) => {
          if (err) return reject(err);
          resolve(true);
      });
  });
}
const setupTables = async () => {
  try {
    const check = await checkUsersTable('users');
    
    if (!check) {
      await createUsersTable();
    }
  } catch (error) {
    console.error('Error setting up the database:', error);
  }
};

connection.connect(async (err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log("Database connected!");

  
  const dbName = process.env.DB_DATABASE;
  console.log(dbName);
  await setupDatabase(dbName);
  await setupTables();

});

module.exports = connection;
