const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/todos/", async (req, res) => {
  let data = null;
  let getTodoQuery = "";
  const { search_q = "", priority, status } = req.query;

  switch (true) {
    case hasStatusProperty(req.query):
      getTodoQuery = `
SELECT * FROM todo WHERE todo LIKE '%${search_q}%' status = '${status}'`;
      break;
    case hasPriorityProperty(req.query):
      getTodoQuery = `
SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND priority = '${priority}'`;
      break;
    case hasPriorityStatusProperty(req.query):
      getTodoQuery = `
SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND priority = '${priority}' AND status = '${status}'`;
      break;

    default:
      getTodoQuery = `
SELECT * FROM todo WHERE todo LIKE '%${search_q}%'`;
  }

  getTodo = await db.all(getTodoQuery);
  res.send(getTodo);
});
