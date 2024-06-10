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
// API 2

app.get("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const getTodoQuery = `
  SELECT * FROM todo WHERE id = ${todoId} `;
  const getResult = await db.get(getTodoQuery);
  res.send(getResult);
});

// API 3
app.post("/todos/", async (req, res) => {
  const { id, todo, priority, status } = req.params;
  const createTodoQuery = `
    INSERT INTO todo (id, todo, priority, status)
    VALUES(${id},'${todo}', '${priority}','${status}');`;
  await db.run(createTodoQuery);
  res.send("Todo Successfully Added");
});

// API 4
app.put("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  let updateCol = "";
  const requestBody = req.body;

  switch (true) {
    case requestBody.status !== undefined:
      updateCol = "Status";
      break;
    case requestBody.priority !== undefined:
      updateCol = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateCol = "Todo";
      break;
  }
  const previousTodoQuery = `
  SELECT * FROM todo WHERE id = ${todoId};`;
  const previousTodo = await db.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = req.body;

  const updateTodoQuery = `
    UPDATE todo SET todo = '${todo}',priority='${priority}',status='${status}' WHERE id = ${todoId};`;
  await db.run(updateTodoQuery);

  res.send(`${updateCol} Updated`);
});

// API 5

app.delete("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const deleteTodoQuery = `
  DELETE FROM todo WHERE id = ${todoId};`;
  await db.run(deleteTodoQuery);
  res.send("Todo Deleted");
});

module.exports = app;
