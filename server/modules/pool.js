// requires
const pg = require('pg');
// pool
const pool = new pg.Pool({
    database: "d3fgsipjtlodos",
    host: "ec2-52-204-195-41.compute-1.amazonaws.com",
    port: 5432,
    max: 12,
    idleTimeoutMillis: 30000
});
// exports
module.exports = pool;