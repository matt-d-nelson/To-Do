// requires
const express = require('express');
const bodyParser = require('body-parser');
//const todo = require('.modules/routes/todo.js');
// app config
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('server/public'));
// globals
const port = process.env.port || 5000;

//listen on port
app.listen(port, () => {
    console.log('server up:', port);
});