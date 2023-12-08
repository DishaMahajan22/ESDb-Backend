const express = require('express');
var cors = require('cors')
const test = require('dotenv').config();
console.log(test);
const mysql = require('mysql2')
const app = express();
const path = require('path');
const { Client } = require("pg");
// Middleware to parse JSON requests
app.use(express.json());
app.use(cors())

const corsOptions = {
  origin: 'https://esdb.onrender.com',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const connection = new Client({
  connectionString: process.env.DATABASE_URL
});
connection.connect()
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });

// Endpoint for handling search requests
app.get('/search', async (req, res) => {
  console.log('Request received at /search');
  try {
    //Search for Tournament
    const result = await connection.query('SELECT * FROM Tournament');
    const rows = result.rows; // Access the 'rows' of the data

    // Log the result to the console
    console.log('Tournament:', rows);

    // Send the retrieved tournament as JSON in the response
    res.json(rows);
  } catch (error) {

    // Log errors
    console.error('Error searching in the database:', error);

    // Send error message in the response to frontend
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Endpoint for handling insert requests for inserting a new tournament [Tournament_ID, Name, Start_date, End_date]
app.post('/insertTournament', async (req, res) => {
  const { Tournament_ID, Name, Start_date, End_date } = req.body;

  console.log('Request received at /insert');
  try {
    // Insert a new tournament
    const result = await connection.query(
      "INSERT INTO Tournament VALUES ($1, $2, $3, $4)",
      [Tournament_ID, Name, Start_date, End_date]
    );
    const rows = result.rows; // Access the 'rows' of the data

    // Log the result to the console
    console.log('Tournament:', rows);

    // Send the retrieved tournament as JSON in the response
    res.json(rows);
  } catch (error) {

    // Log errors
    console.error('Error inserting in the database:', error);

    // Send error message in the response to frontend
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Endpoint for handling insert requests for inserting a new team [Team_ID, Name, Owner_Name]
app.post('/insertTeam', async (req, res) => {
  const { Team_ID, Name, Owner_Name } = req.body;

  console.log('Request received at /insertTeam');
  try {
    // Insert a new team
    const result = await connection.query(
      "INSERT INTO Team VALUES ($1, $2, $3)",
      [Team_ID, Name, Owner_Name]
    );
    const rows = result.rows; // Access the 'rows' of the data

    // Log the result to the console
    console.log('Team:', rows);

    // Send the retrieved team as JSON in the response
    res.json(rows);
  } catch (error) {

    // Log errors
    console.error('Error inserting in the database:', error);

    // Send error message in the response to frontend
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Endpoint for handling insert requests for inserting a new Outcome [Outcome_ID, Sponsor_ID, Event_Name, Winning_Team, Losing_Team, Winning_Score, Losing_Score]
app.post('/insertOutcome', async (req, res) => {
  const { Outcome_ID, Sponsor_ID, Event_Name, Winning_Team, Losing_Team, Winning_Score, Losing_Score } = req.body;

  console.log('Request received at /insertOutcome');
  try {
    // Insert a new outcome
    const result = await connection.query(
      "INSERT INTO Outcome VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [Outcome_ID, Sponsor_ID, Event_Name, Winning_Team, Losing_Team, Winning_Score, Losing_Score]
    );
    const rows = result.rows; // Access the 'rows' of the data

    // Log the result to the console
    console.log('Outcome:', rows);

    // Send the retrieved outcome as JSON in the response
    res.json(rows);
  } catch (error) {

    // Log errors
    console.error('Error inserting in the database:', error);

    // Send error message in the response to frontend
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Endpoint for handling insert requests for inserting a new Statistic [Statistic_ID, Player_ID, Most_used_weapon, Most_played_character, Accuracy, K_D_Ratio, Win_Rate]
app.post('/insertStatistic', async (req, res) => {
  const { Statistic_ID, Player_ID, Most_used_weapon, Most_played_character, Accuracy, K_D_Ratio, Win_Rate } = req.body;

  console.log('Request received at /insertStatistic');
  try {
    // Insert a new statistic
    const result = await connection.query(
      "INSERT INTO Statistic VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [Statistic_ID, Player_ID, Most_used_weapon, Most_played_character, Accuracy, K_D_Ratio, Win_Rate]
    );
    const rows = result.rows; // Access the 'rows' of the data

    // Log the result to the console
    console.log('Statistic:', rows);

    // Send the retrieved statistic as JSON in the response
    res.json(rows);
  } catch (error) {

    // Log errors
    console.error('Error inserting in the database:', error);

    // Send error message in the response to frontend
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

//Endpoint for handling insert requests for inserting a new player [Player_id, Statistic_id, Name, GamerTag, DOB, Birthplace]
app.post('/insertPlayer', async (req, res) => {
  const { Player_ID, Statistic_ID, Name, GamerTag, DOB, Birthplace } = req.body;

  console.log('Request received at /insertPlayer');
  try {
    // Insert a new player
    const result = await connection.query(
      "INSERT INTO Player VALUES ($1, $2, $3, $4, $5, $6)",
      [Player_ID, Statistic_ID, Name, GamerTag, DOB, Birthplace]
    );
    const rows = result.rows; // Access the 'rows' of the data

    // Log the result to the console
    console.log('Player:', rows);

    // Send the retrieved player as JSON in the response
    res.json(rows);
  } catch (error) {

    // Log errors
    console.error('Error inserting in the database:', error);

    // Send error message in the response to frontend
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Endpoint for handling insert requests for inserting a new Sponsor [Sponsor_ID, Name, State, Zipcode, Address]
app.post('/insertSponsor', async (req, res) => {
  const { Sponsor_ID, Name, State, Zipcode, Address } = req.body;

  console.log('Request received at /insertSponsor');
  try {
    // Insert a new sponsor
    const result = await connection.query(
      "INSERT INTO Sponsor VALUES ($1, $2, $3, $4, $5)",
      [Sponsor_ID, Name, State, Zipcode, Address]
    );
    const rows = result.rows; // Access the 'rows' of the data

    // Log the result to the console
    console.log('Sponsor:', rows);

    // Send the retrieved sponsor as JSON in the response
    res.json(rows);
  } catch (error) {

    // Log errors
    console.error('Error inserting in the database:', error);

    // Send error message in the response to frontend
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Endpoint for handling insert requests for inserting a new Game [Game_Name, Sequel_Number, Genre, Creator, Team_size]
app.post('/insertGame', async (req, res) => {
  const { Game_Name, Sequel_Number, Genre, Creator, Team_size } = req.body;

  console.log('Request received at /insertGame');
  try {
    // Insert a new game
    const result = await connection.query(
      "INSERT INTO Game VALUES ($1, $2, $3, $4, $5)",
      [Game_Name, Sequel_Number, Genre, Creator, Team_size]
    );
    const rows = result.rows; // Access the 'rows' of the data

    // Log the result to the console
    console.log('Game:', rows);

    // Send the retrieved game as JSON in the response
    res.json(rows);
  } catch (error) {

    // Log errors
    console.error('Error inserting in the database:', error);

    // Send error message in the response to frontend
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("db name: " + process.env.DATABASE_NAME);
  console.log(`Server is running on port ${PORT}`);
});
