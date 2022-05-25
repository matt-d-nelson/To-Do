// requires
const pg = require('pg');
// pool
const pool = new pg.Pool({
    database: "d3fgsipjtlodos",
    host: "ec2-52-204-195-41.compute-1.amazonaws.com",
    connectionString: process.env.DATABASE_URL,
    port: 5432,
    max: 12,
    idleTimeoutMillis: 30000
});
// exports
module.exports = pool;