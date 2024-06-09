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

const hasGivenPriorityAndStatus = (reqQuery) => {
  return reqQuery.status !== undefined && reqQuery.priority !== undefined;
};
const hasGivenStatus = (reqQuery) => {
  return reqQuery.status !== undefined;
};
const hasGivenPriority = (reqQuery) => {
  return reqQuery.priority !== undefined;
};

app.get("/todos/", async (req, res) => {
  let getResult = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = req.query;
  switch (true) {
    case hasGivenPriorityAndStatus(req.query):
      getTodosQuery = `
      SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND priority = '${priority}' AND status = '${status}'; `;
      break;

    case hasGivenPriority(req.query):
      getTodosQuery = `
      SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND priority = '${priority}';`;
      break;
    case hasGivenStatus(req.query):
      getTodosQuery = `
      SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
  }
  getResult = await db.all(getTodosQuery);
  res.send(getResult);
});
