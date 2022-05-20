// requires
const express = require('express');
const pool = require('../pool');

const router = express.Router();

router.get('/', (req, res) => {
    console.log('/tasks GET');
    res.send('ribbit');
})

module.exports = router;