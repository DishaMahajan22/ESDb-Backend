const express = require('express');
var cors = require('cors')
const test = require('dotenv').config();
console.log(test);
const mysql = require('mysql2')
const app = express();
const path = require('path');
// Middleware to parse JSON requests
app.use(express.json());
app.use(cors())

//app.use('/',express.static(path.join(__dirname, '../build')));
const corsOptions = {
  origin: 'https://esdb.onrender.com',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
const connection = mysql.createConnection(process.env.DATABASE_URL)

// Database configuration
// const dbConfig = {
//   user: process.env.DATABASE_USER,
//   password: process.env.DATABASE_PASS,
//   server: process.env.SERVER_ADDRESS,
//   database: process.env.DATABASE_NAME,
//   options: {
//     encrypt: true, 
//   },
// };
app.get('/test-database-connection', async (req, res) => {
  try {
    // Connect to the database using the connection object
    await connection.connect();

    // Query the database example to test
    const [rows, fields] = await connection.execute('SELECT * FROM Player LIMIT 10');

    // Log the result to the console
    console.log(rows);

    // Respond with a success message
    res.status(200).send('Connected to the database successfully');
  } catch (error) {
    // Log any errors
    console.error('Error connecting to the database:', error);

    // Respond with a server error
    res.status(500).send('Internal Server Error');
  }
});
// // Test route to check database connection
// app.get('/test-database-connection', async (req, res) => {
//   try {
//     console.log('Database Configuration:', dbConfig);
//     // Connect to the database using dbConfig
//     const pool = await mssql.connect(dbConfig);

//     // Query the database example to test
//     const result = await pool.request().query('SELECT top 10 * FROM dbo.Player');

//     // Log the result to the console
//     console.log(result);

//     // Respond with a success message
//     res.status(200).send('Connected to the database successfully');
//   } catch (error) {
//     // Log any errors
//     console.error('Error connecting to the database:', error);

//     // Respond with a server error
//     res.status(500).send('Internal Server Error');
//   }
// });

// Endpoint for handling search requests
// Endpoint for handling search requests
// Endpoint for handling search requests
app.get('/search', async (req, res) => {
  try {
    // Execute a query
    const [rows, fields] = await connection.promise().query('SELECT * FROM Event LIMIT 10');

    // Log the result to the console
    console.log('Rows:', rows);
    console.log('Fields:', fields);

    // Send the search results as JSON
    res.json(rows);
  } catch (error) {
    // Log any errors
    console.error('Error searching in the database:', error);

    // Send a meaningful error message in the response
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});



// Endpoint for handling search requests
// app.get('/search', async (req, res) => {
//   const searchQuery = req.query.query;
//   console.log('Database Configuration:', dbConfig);
//   try {
//     // Connect to the database
//     const pool = await mssql.connect(dbConfig);

//     // Execute a query
//     const result = await pool
//       .request()
//       .query(`SELECT top 10 * FROM dbo.Player`);

//     // Send the search results as JSON
//     res.json(result.recordset);
//   } catch (error) {
//     // Log any errors
//     console.error('Error searching in the database:', error);

//     // Send a meaningful error message in the response
//     res.status(500).json({ error: 'Internal Server Error', message: error.message });
//   }
// });
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("db name: " + process.env.DATABASE_NAME);
  console.log(`Server is running on port ${PORT}`);
});
