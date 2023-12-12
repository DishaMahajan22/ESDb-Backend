const express = require("express");

var cors = require("cors");
const test = require("dotenv").config();
const mysql = require("mysql2");
const app = express();
const path = require("path");
const { Client } = require("pg");
const { start } = require("repl");
// Middleware to parse JSON requests
app.use(express.json());
app.use(cors());

const corsOptions = {
  //origin: ["https://esdb.onrender.com", "http://localhost:3000"],
  origin: ['http://localhost:3000'],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

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

app.use(cors(corsOptions)); // Use cors middleware here

// Endpoint for handling search requests
app.get("/search", async (req, res) => {
  console.log("Request received at /search");
  try {
    const { searchItem, searchName } = req.query;

    //if there is no search parameter for some reason, fail
    if (!searchItem) {
      return res.status(400).json({
        error: "Bad Request",
        message: "searchItem parameter is required",
      });
    }

    let finalRes;
    // Perform different searches based on the searchItem parameter
    switch (searchItem.toLowerCase()) {
      case "tournament":
        if (searchName !== "" && searchName !== undefined) {
          finalRes = await connection.query(
            "SELECT * FROM Tournament WHERE Name iLIKE $1",
            [`%${searchName}%`]
          );
        } else {
          finalRes = await connection.query("SELECT * FROM Tournament");
        }
        break;
      case "player":
        if (searchName !== "" && searchName !== undefined) {
          finalRes = await connection.query(
            "SELECT * FROM Player WHERE Name iLIKE $1",
            [`%${searchName}%`]
          );
        } else {
          finalRes = await connection.query("SELECT * FROM Player");
        }
        break;
      case "game":
        if (searchName !== "" && searchName !== undefined) {
          finalRes = await connection.query(
            "SELECT * FROM Game WHERE Game_Name iLIKE $1",
            [`%${searchName}%`]
          );
        } else {
          finalRes = await connection.query("SELECT * FROM Game");
        }
        break;
      case "team":
        if (searchName !== "" && searchName !== undefined) {
          finalRes = await connection.query(
            "SELECT * FROM Team WHERE Name iLIKE $1",
            [`%${searchName}%`]
          );
        } else {
          finalRes = await connection.query("SELECT * FROM Team");
        }

        break;
      case "event":
        console.log("search Name" + searchName);
        if (searchName !== "" && searchName !== undefined) {
          finalRes = await connection.query(
            "SELECT * FROM Event WHERE Event_name iLIKE $1",
            [`%${searchName}%`]
          );
        } else {
          finalRes = await connection.query("SELECT * FROM Event");
        }

        break;
      case "sponsor":
        if (searchName !== "" && searchName !== undefined) {
          finalRes = await connection.query(
            "SELECT * FROM Sponsor WHERE Name iLIKE $1",
            [`%${searchName}%`]
          );
        } else {
          finalRes = await connection.query("SELECT * FROM Sponsor");
        }

        break;
      default:
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid searchItem parameter",
        });
    }

    const rows = finalRes.rows; // Access the 'rows' of the data

    // Log the result to the console
    console.log("Result Log Test search:", rows);

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
    // Send error message in the response to frontend
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
});

// end point for player to get more player info other than what is in Player DB structure
app.get("/searchPlayerStats", async (req, res) => {
  console.log("Request received at /searchPlayerStats");
  try {
    const { searchName } = req.query;
    let finalRes;
    let finalQuery;
    const queryParams = [searchName];

    finalQuery = `SELECT
    Player.Name AS Player_Name,
    Player.GamerTag AS Player_GamerTag,
    Team.Name AS Team_Name,
    Team.Owner_Name AS Team_Owner,
    Statistic.Most_used_weapon,
    Statistic.Most_played_character,
    Statistic.Accuracy,
    Statistic.K_D_Ratio,
    Statistic.Win_Rate
FROM
    Player
JOIN
    Participates_In ON Player.Player_id = Participates_In.Player_ID
JOIN
    Team ON Participates_In.Team_ID = Team.Team_ID
JOIN
    Statistic ON Player.Player_id = Statistic.Player_ID
WHERE
    Player.Name = $1`;

    finalRes = await connection.query(finalQuery, queryParams);
    const rows = finalRes.rows;
    console.log("Result Log Test player stats:", rows);
    res.json(rows);
  } catch (error) {
    console.error("Error searching in the database:", error);

    // Send error message in the response to frontend
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
});
// Endpoint for handling search Event Filter requests
app.get("/searchEvent", async (req, res) => {
  console.log("Request received at /searchEvent");
  try {
    const { searchItem, searchName, sponsorName, startDate, endDate } =
      req.query;
    if (!searchItem) {
      return res
        .status(400)
        .json({
          error: "Bad Request",
          message: "searchItem parameter is required",
        });
    }

    let finalRes;
    let finalQuery;
    const queryParams = [searchName]; // Initialize queryParams here

    const item = searchItem.toLowerCase();
    switch (searchItem.toLowerCase()) {
      case "tournament":
        finalQuery = `SELECT e.Event_name, s.Name AS Sponsor_Name
        FROM Event AS e
        JOIN Tournament AS t ON e.Tournament_ID = t.Tournament_ID
        LEFT JOIN Sponsor AS s ON e.Sponsor_ID = s.Sponsor_ID
        WHERE t.Name = $1`;

        if (sponsorName) {
          finalQuery += ` AND s.Name = $2`;
          queryParams.push(sponsorName);
        }
        if (
          startDate !== null &&
          startDate !== "" &&
          endDate !== null &&
          endDate !== ""
        ) {
          finalQuery += ` AND e.Start_Date >= $3 AND e.End_Date <= $4`;
          queryParams.push(startDate, endDate);
        }
        break;
      default:
        return res
          .status(400)
          .json({
            error: "Bad Request Search Event",
            message: "Invalid searchItem parameter",
          });
    }

    finalRes = await connection.query(finalQuery, queryParams);

    const rows = finalRes.rows; // Access the 'rows' of the data

    // Log the result to the console
    console.log("Result Log Test:", rows);

    // Send the retrieved tournament as JSON in the response
    res.json(rows);
  } catch (error) {
    console.error("Error searching in the database:", error);

    // Send error message in the response to frontend
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
});
// Endpoint for handling search Team Outcomes
app.get("/searchTeamEventOutcomes", async (req, res) => {
  console.log("Request received at /searchTeamEventOutcomes");
  try {
    const { searchName, eventFilter } = req.query;

    let finalRes;
    let finalQuery;
    const queryParams = [searchName]; // Initialize queryParams here

    finalQuery = `SELECT
    Team.Name AS Team_Name,
    Event.Event_name AS Won_Event,
    Tournament.Name AS Tournament_Name,
    Outcome.Winning_Team,
    Outcome.Winning_Score,
    Outcome.Losing_Team,
    Outcome.Losing_Score,
    Outcome.Event_Name AS Outcome_Event_Name,
    Outcome.Outcome_ID,
    Results_In.Duration
FROM
    Team
JOIN
    Contributes_To ON Team.Team_ID = Contributes_To.Team_ID
JOIN
    Outcome ON Contributes_To.Outcome_ID = Outcome.Outcome_ID
JOIN
    Event ON Outcome.Event_Name = Event.Event_name
JOIN
    Tournament ON Event.Tournament_ID = Tournament.Tournament_ID
LEFT JOIN
    Results_In ON Outcome.Outcome_ID = Results_In.Outcome_ID AND Outcome.Event_Name = Results_In.Event_Name
WHERE
    Team.Name = $1
AND Outcome.Winning_Team = $1
`;

    if (eventFilter != null && eventFilter != "") {
      finalQuery += ` AND Event.Event_name = $2 ORDER BY
      Tournament.Start_date DESC;`;
      queryParams.push(eventFilter);
    }

    finalRes = await connection.query(finalQuery, queryParams);

    const rows = finalRes.rows; // Access the 'rows' of the data

    // Log the result to the console
    console.log("Result Log Test:", rows);

    // Send the retrieved tournament as JSON in the response
    res.json(rows);
  } catch (error) {
    console.error("Error searching in the database:", error);

    // Send error message in the response to frontend
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
});
app.get("/searchPlayerStats", async (req, res) => {
  console.log("Request received at /searchPlayerStats");
  try {
    const { searchName } = req.query;
    let finalRes;
    let finalQuery;
    const queryParams = [searchName];

    finalQuery = `SELECT
    Player.Name AS Player_Name,
    Player.GamerTag AS Player_GamerTag,
    Team.Name AS Team_Name,
    Team.Owner_Name AS Team_Owner,
    Statistic.Most_used_weapon,
    Statistic.Most_played_character,
    Statistic.Accuracy,
    Statistic.K_D_Ratio,
    Statistic.Win_Rate
FROM
    Player
JOIN
    Participates_In ON Player.Player_id = Participates_In.Player_ID
JOIN
    Team ON Participates_In.Team_ID = Team.Team_ID
JOIN
    Statistic ON Player.Player_id = Statistic.Player_ID
WHERE
    Player.Name = $1`;

    finalRes = await connection.query(finalQuery, queryParams);
    const rows = finalRes.rows;
    console.log("Result Log Test player stats:", rows);
    res.json(rows);
  } catch (error) {
    console.error("Error searching in the database:", error);

    // Send error message in the response to frontend
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
});
// Endpoint for handling search Team Stats requests
app.get("/searchTeamStats", async (req, res) => {
  console.log("Request received at /searchTeamStats");
  try {
    const { searchItem, searchName } = req.query;
    if (!searchItem) {
      return res.status(400).json({
        error: "Bad Request",
        message: "searchItem parameter is required",
      });
    }

    let finalRes;
    let finalQuery;
    const queryParams = [searchName]; // Initialize queryParams here

    switch (searchItem.toLowerCase()) {
      case "tournament":
        //all the team's in the selected tournament and their avg k/d, accuracy, and win rate
        finalQuery = `SELECT
        Team_Name,
        AVG(CAST(REPLACE(Statistic.Accuracy, '%', '') AS DECIMAL(10,2))) AS Average_Accuracy,
        AVG(CAST(REPLACE(Statistic.K_D_Ratio, '%', '') AS DECIMAL(10,2))) AS Average_K_D_Ratio,
        AVG(CAST(REPLACE(Statistic.Win_Rate, '%', '') AS DECIMAL(10,2))) AS Average_Win_Rate
    FROM (
        SELECT
            Team.Name AS Team_Name,
            Player.Player_id
        FROM
            Team
        JOIN
            Participates_In ON Team.Team_ID = Participates_In.Team_ID
        JOIN
            Player ON Participates_In.Player_ID = Player.Player_id
        JOIN
            Tournament ON Team.Team_ID = Tournament.Tournament_ID
        WHERE
            Tournament.Name = $1
    ) AS Subquery
    JOIN
        Statistic ON Subquery.Player_id = Statistic.Player_ID
    GROUP BY
        Subquery.Team_Name`;
        break;
      default:
        return res.status(400).json({
          error: "Bad Request Search Event",
          message: "Invalid searchItem parameter",
        });
    }

    finalRes = await connection.query(finalQuery, queryParams);

    const rows = finalRes.rows; // Access the 'rows' of the data

    // Log the result to the console
    console.log("Result Log Test:", rows);

    // Send the retrieved tournament as JSON in the response
    res.json(rows);
  } catch (error) {
    console.error("Error searching in the database:", error);

    // Send error message in the response to frontend
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
});

//delete player from the team (remove from participates_in)
app.delete("/deletePlayerFromTeam", async (req, res) => {
  console.log("Request received at /deletePlayerFromTeam");
  try {
    const { Player_ID, Team_ID } = req.body;
    const result = await connection.query(
      "DELETE FROM Participates_In WHERE Player_ID = $1",
      [Player_ID]
    );
    const rows = result.rows; // Access the 'rows' of the data

    // Log the result to the console
    console.log("Player:", rows);

    // Send the retrieved player as JSON in the response
    res.json(rows);
  } catch (error) {
    // Log errors
    console.error("Error deleting in the database:", error);

    // Send error message in the response to frontend
    res.status(500).json({ error: "Internal Server Error", message: error });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("db name: " + process.env.DATABASE_NAME);
  console.log(`Server is running on port ${PORT}`);
});
