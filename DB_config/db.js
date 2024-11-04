const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const createDatabase = (dbName) => {
  return new Promise((resolve, reject) => {
    const sql = `CREATE DATABASE IF NOT EXISTS ??`;
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

      await createDatabase(dbName);
    

    await changeDatabase(dbName);

  } catch (error) {
    console.error("Error setting up the database:", error);
  }
};

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
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

      )`;

    connection.query(sql, (err, result) => {
      if (err) return reject(err);
      resolve(true);
    });
  });
}

const createMessagingTable = () => {
  return new Promise((resolve, reject) => {
      const sql = `
      CREATE TABLE IF NOT EXISTS chat_channels (
          id INT AUTO_INCREMENT PRIMARY KEY,
          chat_channel VARCHAR(255) NOT NULL UNIQUE,
          user1_id INT NOT NULL,
          user2_id INT NOT NULL,
          last_msg TEXT DEFAULT NULL,
          sender INT DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user1_id) REFERENCES users(id),
          FOREIGN KEY (user2_id) REFERENCES users(id)
      )`;

      connection.query(sql, (err, result) => {
          if (err) return reject(err);
          resolve(true);
      });
  });
}

const setupTables = async () => {
  try {
    await createUsersTable();
    await createMessagingTable();

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
