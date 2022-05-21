// requires
const express = require('express');
const pool = require('../pool');

const router = express.Router();

// POST 
router.post('/', (req, res) => {
    console.log('/tasks POST', req.body);
    let taskData = [
        req.body.title,
        req.body.description,
        req.body.due_date,
        req.body.priority
    ];
    let queryString = `INSERT INTO tasks (title, description, due_date, priority) VALUES ($1, $2, $3, $4);`;
    pool.query(queryString,taskData).then((result) => {
        res.sendStatus(201);
    }).catch((err) => {
        console.log(err);
        res.sendStatus(500);
    })
    
})

// GET
router.get('/', (req, res) => {
    console.log('/tasks GET');
    let queryString = `SELECT * FROM tasks ORDER BY id ASC;`;
    pool.query(queryString).then((result) => {
        res.send(result.rows);
    }).catch((err) => {
        console.log(err);
        res.sendStatus(500);
    })
})

// UPDATE
router.put('/', (req,res) => {
    console.log('/tasks PUT');
    let taskId = [req.query.id];
    let queryString = `UPDATE tasks SET completed = NOT completed WHERE id = $1;`;
    pool.query(queryString,taskId).then((result) => {
        res.sendStatus(200);
    }).catch((err) => {
        console.log(err);
        res.sendStatus(500);
    })
})

// DELETE
router.delete('/', (req, res) => {
    console.log('/tasks DELETE');
    let taskId = [req.query.id];
    let queryString = `DELETE FROM tasks WHERE id=$1;`
    pool.query(queryString,taskId).then((result) => {
        res.sendStatus(200);
    }).catch((err) => {
        console.log(err);
        res.sendStatus(500);
    })
})

module.exports = router;