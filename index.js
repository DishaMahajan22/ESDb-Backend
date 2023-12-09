const express = require("express");
var cors = require("cors");
const test = require("dotenv").config();
console.log(test);
const mysql = require("mysql2");
const app = express();
const path = require("path");
const { Client } = require("pg");
const { start } = require("repl");
// Middleware to parse JSON requests
app.use(express.json());
app.use(cors());

const corsOptions = {
  origin: ["https://esdb.onrender.com", "http://localhost:3000"],
  // origin: ['https://esdb.onrender.com'],
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

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("db name: " + process.env.DATABASE_NAME);
  console.log(`Server is running on port ${PORT}`);
});
