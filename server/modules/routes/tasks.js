// requires
const express = require('express');
const pool = require('../pool');

const router = express.Router();

router.get('/', (req, res) => {
    console.log('/tasks GET');
    let queryString = `SELECT * FROM tasks;`;
    pool.query(queryString).then((result) => {
        res.send(result.rows);
    }).catch((err) => {
        console.log(err);
        res.sendStatus(500);
    })
})

module.exports = router;