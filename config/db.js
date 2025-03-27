const { Sequelize } = require('sequelize');
require('dotenv').config();
// console.log("DATABASE_URL from env:", process.env.DATABASE_URL);

const sequelize = new Sequelize(
  process.env.DATABASE_URL,
  {
    dialect: 'postgres',
    // dialectOptions: {
    //   ssl: {
    //     require: true,
    //     rejectUnauthorized: false,
    //   }
    // }
  }
);

module.exports = sequelize;

// import postgres from 'postgres'

// const connectionString = process.env.DATABASE_URL
// const sql = postgres(connectionString)

// export default sql