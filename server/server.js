// requires
const express = require('express');
const bodyParser = require('body-parser');
const tasks = require('./modules/routes/tasks.js');
// app config
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('server/public'));
app.use('/tasks', tasks)
// globals
const PORT = process.env.port || 5000;
//listen on port
app.listen(PORT, () => {
    console.log('server up:', PORT);
});