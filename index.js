const express = require("express");
const cors = require("cors");
const { Client } = require("pg");
const test = require("dotenv").config();
console.log(test);

const app = express(); // Define 'app' here
app.use(cors());
app.use(express.json());

const connection = new Client({
  connectionString: process.env.DATABASE_URL,
});

connection
  .connect()
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });

// CORS Options
const corsOptions = {
  origin: ["https://esdb.onrender.com/"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions)); // Use cors middleware here

// Endpoint for handling search requests
app.get("/search", async (req, res) => {
  console.log("Request received at /search");
  try {
    //Search for Tournament
    const result = await connection.query("SELECT * FROM Tournament");
    const rows = result.rows; // Access the 'rows' of the data

    // Log the result to the console
    console.log("Tournament:", rows);

    // Send the retrieved tournament as JSON in the response
    res.json(rows);
  } catch (error) {
    // Log errors
    console.error("Error searching in the database:", error);

    // Send error message in the response to frontend
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
});

// Endpoint for handling insert requests for inserting a new tournament [Tournament_ID, Name, Start_date, End_date]
app.post("/insertTournament", async (req, res) => {
  console.log("inserted tournament");

  console.log("Request received at /insert");
  console.log("Request Body:", req.body);
  try {
    // Insert a new tournament
    const { Tournament_ID, Name, Start_date, End_date } = req.body;
    const result = await connection.query(
      "INSERT INTO Tournament VALUES ($1, $2, $3, $4)",
      [Tournament_ID, Name, Start_date, End_date]
    );
    const rows = result.rows; // Access the 'rows' of the data

    // Log the result to the console
    console.log("Tournament:", rows);

    // Send the retrieved tournament as JSON in the response
    res.json(rows);
  } catch (error) {
    // Log errors
    console.error("Error inserting in the database:", error);
    // Send error message in the response to frontend
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
});

// Endpoint for handling insert requests for inserting a new team [Team_ID, Name, Owner_Name]
app.post("/insertTeam", async (req, res) => {
  const { Team_ID, Name, Owner_Name, Game_name, Match_date } = req.body;

  console.log("Request received at /insertTeam");
  try {
    // Insert a new team
    console.log(Owner_Name);
    const result = await connection.query(
      "INSERT INTO Team VALUES ($1, $2, $3)",
      [Team_ID, Name, Owner_Name]
    );

    let rows = result.rows; // Access the 'rows' of the data

    if (Game_name && Team_ID && Match_date) {
      //insert a new competes in
      const result2 = await connection.query(
        "INSERT INTO Competes_In VALUES ($1, $2, $3)",
        [Game_name, Team_ID, Match_date]
      );
      rows = result2.rows; // Access the 'rows' of the data
    }

    // Log the result to the console
    console.log("Team:", rows);

    // Send the retrieved team as JSON in the response
    res.json(rows);
  } catch (error) {
    // Log errors
    console.error("Error inserting in the database:", error);

    // Send error message in the response to frontend
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
});

// Endpoint for handling insert requests for inserting a new Outcome [Outcome_ID, Sponsor_ID, Event_Name, Winning_Team, Losing_Team, Winning_Score, Losing_Score]
app.post("/insertOutcome", async (req, res) => {
  const {
    Outcome_ID,
    Sponsor_ID,
    Event_Name,
    Winning_Team,
    Losing_Team,
    Winning_Score,
    Losing_Score,
    Duration,
  } = req.body;

  console.log("Request received at /insertOutcome");
  try {
    // Insert a new outcome
    const result = await connection.query(
      "INSERT INTO Outcome VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [
        Outcome_ID,
        Sponsor_ID,
        Event_Name,
        Winning_Team,
        Losing_Team,
        Winning_Score,
        Losing_Score,
      ]
    );
    let rows = result.rows; // Access the 'rows' of the data

    if (Outcome_ID && Event_Name && Duration) {
      //insert a new results in
      const result2 = await connection.query(
        "INSERT INTO Results_In VALUES ($1, $2, $3)",
        [Outcome_ID, Event_Name, Duration]
      );
      rows = result2.rows; // Access the 'rows' of the data
      console.log("finished inserting into results in");
    }
    const winning_team_id = await connection.query("SELECT Team_ID FROM Team WHERE Name = ($1)", [Winning_Team]);
    const losing_team_id = await connection.query("SELECT Team_ID FROM Team WHERE Name = ($1)", [Losing_Team]);
    console.log("losing team: ", Losing_Team);
    console.log("winning team: ", Winning_Team);
    console.log("winning id: ", winning_team_id.rows[0].team_id);
    console.log("losing id: ", losing_team_id.rows[0].team_id);
    

    if (Outcome_ID && Sponsor_ID && Event_Name) {
      //insert a new contributes to
      const result3 = await connection.query(
        "INSERT INTO Contributes_To VALUES ($1, $2, $3, $4, $5)",
        [Outcome_ID, Sponsor_ID, Event_Name, winning_team_id.rows[0].team_id, 1]
      );
      const result4 = await connection.query(
        "INSERT INTO Contributes_To VALUES ($1, $2, $3, $4, $5)",
        [Outcome_ID, Sponsor_ID, Event_Name, losing_team_id.rows[0].team_id, 0]
      );
    }

    // Log the result to the console

    // Send the retrieved outcome as JSON in the response
    res.json(rows);
  } catch (error) {
    // Log errors
    console.error("Error inserting in the database:", error);

    // Send error message in the response to frontend
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
});

// Endpoint for handling insert requests for inserting a new Statistic [Statistic_ID, Player_ID, Most_used_weapon, Most_played_character, Accuracy, K_D_Ratio, Win_Rate]
app.post("/insertStatistic", async (req, res) => {
  const {
    Statistic_ID,
    Player_ID,
    Most_used_weapon,
    Most_played_character,
    Accuracy,
    K_D_ratio,
    Win_rate,
    Stat_Date,
  } = req.body;
  console.log("Request received at /insertStatistic");
  console.log(
    Statistic_ID,
    Player_ID,
    Most_used_weapon,
    Most_played_character,
    Accuracy,
    K_D_ratio,
    Win_rate
  );
  try {
    // Insert a new statistic
    const result = await connection.query(
      "INSERT INTO Statistic VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [
        Statistic_ID,
        Player_ID,
        Most_used_weapon,
        Most_played_character,
        Accuracy,
        K_D_ratio,
        Win_rate,
      ]
    );
    connection.query(
      "UPDATE Player SET Statistic_ID = $1 WHERE Player_id = $2",
      [Statistic_ID, Player_ID]
    );
    let rows = result.rows; // Access the 'rows' of the data

    if (Player_ID && Statistic_ID && Stat_Date) {
      //insert a new accumulates
      const result2 = await connection.query(
        "INSERT INTO Accumulates VALUES ($1, $2, $3)",
        [Player_ID, Statistic_ID, Stat_Date]
      );
      rows = result2.rows; // Access the 'rows' of the data
    }

    // Log the result to the console
    console.log("Statistic:", rows);

    // Send the retrieved statistic as JSON in the response
    res.json(rows);
  } catch (error) {
    // Log errors
    console.error("Error inserting in the database:", error);

    // Send error message in the response to frontend
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
});

//Endpoint for handling insert requests for inserting a new player [Player_id, Statistic_id, Name, GamerTag, DOB, Birthplace]
app.post("/insertPlayer", async (req, res) => {
  const { Player_ID, Statistic_ID, Name, GamerTag, DOB, Birthplace } = req.body;

  console.log("Request received at /insertPlayer");
  try {
    // Insert a new player
    const result = await connection.query(
      "INSERT INTO Player VALUES ($1, $2, $3, $4, $5, $6)",
      [Player_ID, Statistic_ID, Name, GamerTag, DOB, Birthplace]
    );

    let rows = result.rows; // Access the 'rows' of the data

    // Log the result to the console
    console.log("Player:", rows);

    // Send the retrieved player as JSON in the response
    res.json(rows);
  } catch (error) {
    // Log errors
    console.error("Error inserting in the database:", error);

    // Send error message in the response to frontend
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
});

// Endpoint for handling insert requests for inserting a new Sponsor [Sponsor_ID, Name, State, Zipcode, Address]
app.post("/insertSponsor", async (req, res) => {
  const { Sponsor_ID, Name, State, Zipcode, Address } = req.body;

  console.log("Request received at /insertSponsor");
  try {
    // Insert a new sponsor
    const result = await connection.query(
      "INSERT INTO Sponsor VALUES ($1, $2, $3, $4, $5)",
      [Sponsor_ID, Name, State, Zipcode, Address]
    );
    const rows = result.rows; // Access the 'rows' of the data

    // Log the result to the console
    console.log("Sponsor:", rows);

    // Send the retrieved sponsor as JSON in the response
    res.json(rows);
  } catch (error) {
    // Log errors
    console.error("Error inserting in the database:", error);

    // Send error message in the response to frontend
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
});

// Endpoint for handling insert requests for inserting a new Game [Game_Name, Sequel_Number, Genre, Creator, Team_size]
app.post("/insertGame", async (req, res) => {
  const { Game_Name, Sequel_Number, Genre, Creator, Team_size } = req.body;

  console.log("Request received at /insertGame");
  try {
    // Insert a new game
    console.log("inserting game...");
    const result = await connection.query(
      "INSERT INTO Game VALUES ($1, $2, $3, $4, $5)",
      [Game_Name, Sequel_Number, Genre, Creator, Team_size]
    );
    const rows = result; // Access the 'rows' of the data

    // Log the result to the console
    console.log("Game:", rows);

    // Send the retrieved game as JSON in the response
    res.json(rows);
  } catch (error) {
    // Log errors
    console.error("Error inserting in the database:", error);

    // Send error message in the response to frontend
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
});

// Endpoint for handling insert requests for inserting a new Sponsors [Event_Name, Sponsor_ID, Start Date, End Date]
app.post("/insertSponsorRelationship", async (req, res) => {
  const {
    Contract_Event_Name,
    Contract_Sponsor_ID,
    Contract_Start_Date,
    Contract_End_Date,
  } = req.body;

  console.log("Request received at /insertSponsors");
  try {
    // Insert a new sponsors
    const result = await connection.query(
      "INSERT INTO Sponsors VALUES ($1, $2, $3, $4)",
      [
        Contract_Event_Name,
        Contract_Sponsor_ID,
        Contract_Start_Date,
        Contract_End_Date,
      ]
    );
    const rows = result.rows; // Access the 'rows' of the data

    // Log the result to the console
    console.log("Sponsors:", rows);

    // Send the retrieved sponsors as JSON in the response
    res.json(rows);
  } catch (error) {
    // Log errors
    console.error("Error inserting in the database:", error);

    // Send error message in the response to frontend
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
});

// Endpoint for handling update requests for inserting an Event [Event_Name, Sponsor Name, Tournament_ID, Location, Seats, Start_Date, End_Date, ContractStartDate, ContractEndDate]
app.post("/insertEvent", async (req, res) => {
  const {
    Event_name,
    Sponsor_ID,
    Tournament_ID,
    Game_name,
    Location,
    Seats,
    Start_date,
    End_date,
    Contract_start_date,
    Contract_end_date,
    Section_Num,
  } = req.body;

  console.log("Request received at /insertEvent");
  try {
    // Insert a new event
    const result = await connection.query(
      "INSERT INTO Event VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [
        Event_name,
        Sponsor_ID,
        Tournament_ID,
        Location,
        Seats,
        Start_date,
        End_date,
      ]
    );

    let rows = result.rows; // Access the 'rows' of the data

    if (Event_name && Sponsor_ID && Contract_start_date && Contract_end_date) {
      //insert into sponsors
      const result2 = await connection.query(
        "INSERT INTO Sponsors VALUES ($1, $2, $3, $4)",
        [Event_name, Sponsor_ID, Contract_start_date, Contract_end_date]
      );
      rows = result2.rows; // Access the 'rows' of the data
    }

    if (Tournament_ID && Event_name && Sponsor_ID && Section_Num) {
      //insert into supervises
      const result3 = await connection.query(
        "INSERT INTO Supervises VALUES ($1, $2, $3, $4)",
        [Tournament_ID, Event_name, Sponsor_ID, Section_Num]
      );
      rows = result3.rows; // Access the 'rows' of the data
    }

    if (Game_name && Event_name && Sponsor_ID) {
      //insert into hosts
      const result4 = await connection.query(
        "INSERT INTO Hosts VALUES ($1, $2, $3)",
        [Game_name, Event_name, Sponsor_ID]
      );
      rows = result4.rows; // Access the 'rows' of the data
    }

    // Log the result to the console
    console.log("Event:", rows);

    // Send the retrieved event as JSON in the response
    res.json(rows);
  } catch (error) {
    // Log errors
    console.error("Error inserting in the database:", error);
    console.log(error);

    // Send error message in the response to frontend
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
    console.log(error);
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("db name: " + process.env.DATABASE_NAME);
  console.log(`Server is running on port ${PORT}`);
});
