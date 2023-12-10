const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const test = require("dotenv").config();
console.log(test);

const app = express(); // Define 'app' here
app.use(cors());
app.use(express.json());

const connection = new Client({
  connectionString: process.env.DATABASE_URL,
});

connection.connect()
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });

// CORS Options
const corsOptions = {
  origin: ["https://esdb.onrender.com/", "http://localhost:3000/"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions)); // Use cors middleware here

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
  console.log("inserted tournament");

  console.log('Request received at /insert');
  console.log('Request Body:', req.body);
  try {
    // Insert a new tournament
    const { Tournament_ID, Name, Start_date, End_date } = req.body;
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
  const { Team_ID, Name, Owner_Name, Game_Name, Match_Date} = req.body;

  console.log('Request received at /insertTeam');
  try {
    // Insert a new team
    const result = await connection.query(
      "INSERT INTO Team VALUES ($1, $2, $3)",
      [Team_ID, Name, Owner_Name]
    );

    //insert a new competes in
    const result2 = await connection.query(
      "INSERT INTO Competes_In VALUES ($1, $2, $3)",
      [Game_Name, Team_ID, Match_Date]
    );

    const rows = result.rows; // Access the 'rows' of the data
    const rows2 = result2.rows; // Access the 'rows' of the data

    // Log the result to the console
    console.log('Team:', rows);
    console.log('Competes In:', rows2);

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
  const { Outcome_ID, Sponsor_ID, Event_Name, Winning_Team, Losing_Team, Winning_Score, Losing_Score, Duration, Winner} = req.body;

  console.log('Request received at /insertOutcome');
  try {
    // Insert a new outcome
    const result = await connection.query(
      "INSERT INTO Outcome VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [Outcome_ID, Sponsor_ID, Event_Name, Winning_Team, Losing_Team, Winning_Score, Losing_Score]
    );
    const rows = result.rows; // Access the 'rows' of the data

    //insert a new results in
    const result2 = await connection.query(
      "INSERT INTO Results_In VALUES ($1, $2, $3, $4, $5)",
      [Outcome_ID, Event_Name, Duration]
    );

    //insert a new contributes to
    const result3 = await connection.query(
      "INSERT INTO Contributes_To VALUES ($1, $2, $3)",
      [Outcome_ID, Sponsor_ID, Event_Name, Team_ID, Winner]
    );

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
  const { Statistic_ID, Player_ID, Most_used_weapon, Most_played_character, Accuracy, K_D_ratio, Win_rate, Stat_Date} = req.body;

  console.log('Request received at /insertStatistic');
  console.log(Statistic_ID, Player_ID, Most_used_weapon, Most_played_character, Accuracy, K_D_ratio, Win_rate);
  try {
    // Insert a new statistic
    const result = await connection.query(
      "INSERT INTO Statistic VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [Statistic_ID, Player_ID, Most_used_weapon, Most_played_character, Accuracy, K_D_ratio, Win_rate]
    );

    //insert a new accumulates
    const result2 = await connection.query(
      "INSERT INTO Accumulates VALUES ($1, $2, $3)",
      [Player_ID, Statistic_ID, Stat_Date]
    );

    const rows = result.rows; // Access the 'rows' of the data
    const rows2 = result2.rows; // Access the 'rows' of the data

    // Log the result to the console
    console.log('Statistic:', rows);
    console.log('Accumulates:', rows2);

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
  const { Player_ID, Statistic_ID, Name, GamerTag, DOB, Birthplace, Number_Of_Players} = req.body;

  console.log('Request received at /insertPlayer');
  try {
    // Insert a new player
    const result = await connection.query(
      "INSERT INTO Player VALUES ($1, $2, $3, $4, $5, $6)",
      [Player_ID, Statistic_ID, Name, GamerTag, DOB, Birthplace]
    );

    //insert a new participates in
    const result2 = await connection.query(
      "INSERT INTO Participates_In VALUES ($1, $2, $3)",
      [Player_ID, Team_ID, Number_Of_Players]
    );

    const rows = result.rows; // Access the 'rows' of the data
    const rows2 = result2.rows; // Access the 'rows' of the data

    // Log the result to the console
    console.log('Player:', rows);
    console.log('Participates In:', rows2);

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

// Endpoint for handling insert requests for inserting a new Sponsors [Event_Name, Sponsor_ID, Start Date, End Date]
app.post('/insertSponsorRelationship', async (req, res) => {
  const { Contract_Event_Name, Contract_Sponsor_ID, Contract_Start_Date, Contract_End_Date } = req.body;

  console.log('Request received at /insertSponsors');
  try {
    // Insert a new sponsors
    const result = await connection.query(
      "INSERT INTO Sponsors VALUES ($1, $2, $3, $4)",
      [Contract_Event_Name, Contract_Sponsor_ID, Contract_Start_Date, Contract_End_Date]
    );
    const rows = result.rows; // Access the 'rows' of the data

    // Log the result to the console
    console.log('Sponsors:', rows);

    // Send the retrieved sponsors as JSON in the response
    res.json(rows);
  } catch (error) {

    // Log errors
    console.error('Error inserting in the database:', error);

    // Send error message in the response to frontend
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Endpoint for handling update requests for inserting an Event [Event_Name, Sponsor Name, Tournament_ID, Location, Seats, Start_Date, End_Date, ContractStartDate, ContractEndDate]
app.post('/insertEvent', async (req, res) => {
  const { Event_name, Sponsor_ID, Tournament_ID, Location, Seats, Start_date, End_date, Contract_start_date, Contract_end_date, Section_Num} = req.body;

  console.log('Request received at /insertEvent');
  try {
    // Insert a new event
    const result = await connection.query(
      "INSERT INTO Event VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [Event_name, Sponsor_ID, Tournament_ID, Location, Seats, Start_date, End_date]
    );

    //insert into sponsors
    const result2 = await connection.query(
      "INSERT INTO Sponsors VALUES ($1, $2, $3, $4)",
      [Event_name, Sponsor_ID, Contract_start_date, Contract_end_date]
    );

    //insert into supervises
    const result3 = await connection.query(
      "INSERT INTO Supervises VALUES ($1, $2, $3, $4)",
      [Tournament_ID, Event_name, Sponsor_ID, Section_Num]
    );

    //insert into hosts
    const result4 = await connection.query(
      "INSERT INTO Hosts VALUES ($1, $2, $3)",
      [Game_name, Event_name, Sponsor_ID]
    );

    const rows = result.rows; // Access the 'rows' of the data
    const rows2 = result2.rows; // Access the 'rows' of the data
    const rows3 = result3.rows; // Access the 'rows' of the data
    const rows4 = result4.rows; // Access the 'rows' of the data

    // Log the result to the console
    console.log('Event:', rows);
    console.log('Sponsors:', rows2);

    // Send the retrieved event as JSON in the response
    res.json(rows);
    res.json(rows2);
  } catch (error) {

    // Log errors
    console.error('Error inserting in the database:', error);
    console.log(error);

    // Send error message in the response to frontend
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
    console.log(error);
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("db name: " + process.env.DATABASE_NAME);
  console.log(`Server is running on port ${PORT}`);
});

