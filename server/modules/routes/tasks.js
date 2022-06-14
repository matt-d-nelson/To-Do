// requires
const express = require("express");
const pool = require("../pool");
const format = require("pg-format");

const router = express.Router();

pool.connect();

// POST
router.post("/", (req, res) => {
  console.log("/tasks POST", req.body);
  // store data from request body
  let taskData = [
    req.body.title,
    req.body.description,
    req.body.due_date,
    req.body.priority,
  ];
  // create query string
  let queryString = `INSERT INTO tasks (title, description, due_date, priority) VALUES ($1, $2, $3, $4);`;
  // send query and data to SQL to add task to the database
  pool
    .query(queryString, taskData)
    .then((result) => {
      res.sendStatus(201);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

// GET
router.get("/", (req, res) => {
  console.log("/tasks GET");
  // store the sortBy data in sortBy
  let sortBy = req.query.sortBy;
  // add it into the query string as an identifier
  let queryString = format(`SELECT * FROM tasks ORDER BY %I`, sortBy);
  // additional concatenation to make oldest tasks display first when 'Age' is selected
  // to make highest priority tasks display first
  if (sortBy === "id") {
    queryString += " ASC;";
  } else if (sortBy === "priority") {
    queryString += " DESC;";
  } else {
    queryString += ";";
  }
  console.log(queryString);
  // send query to SQL and send that response to the client
  pool
    .query(queryString)
    .then((result) => {
      res.send(result.rows);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

// PUT COMPLETE TASK
router.put("/", (req, res) => {
  console.log("/tasks PUT", req.body);
  // store request body data
  let taskData = [req.body.time_completed, req.body.id];
  let queryString = `UPDATE tasks SET completed = NOT completed, time_completed = $1 WHERE id = $2;`;
  // set time_completed back to null if 'incompleting' the task
  if (taskData[0] == "") {
    queryString = `UPDATE tasks SET completed = NOT completed, time_completed = NULL WHERE id = $1;`;
    // remove time_completed from query array
    taskData.shift();
  }
  // send query to SQL to update a task as complete in the database
  pool
    .query(queryString, taskData)
    .then((result) => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

// PUT UPDATE TASK
router.put("/update", (req, res) => {
  console.log("/tasks/update PUT", req.body);
  // store req body data for updated task
  let updatedData = [
    req.body.title,
    req.body.description,
    req.body.due_date,
    req.body.priority,
    req.body.id,
  ];
  // query string to set coresponding values from updateData
  let queryString = `UPDATE tasks SET title = $1, description = $2, due_date = $3, priority = $4 WHERE id = $5;`;
  // send query to update task in the database
  pool
    .query(queryString, updatedData)
    .then((result) => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

// DELETE
router.delete("/", (req, res) => {
  console.log("/tasks DELETE");
  // store id from request query
  let taskId = [req.query.id];
  let queryString = `DELETE FROM tasks WHERE id=$1;`;
  // send query to SQL to delete coresponding task in the database
  pool
    .query(queryString, taskId)
    .then((result) => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

module.exports = router;
