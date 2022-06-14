// requires
const pg = require("pg");
// pool
const pool = new pg.Pool({
  database: "d3fgsipjtlodos",
  host: "ec2-52-204-195-41.compute-1.amazonaws.com",
  port: 5432,
  user: "hyyejfoznudqye",
  password: "0c748e5168dc0dde1b14167fa5f1160fc2a16b781b18e856e89956eb28b54c3a",
  ssl: true,
});

// const client = new pg.Client({
//   user: "hyyejfoznudqye",
//   password: "0c748e5168dc0dde1b14167fa5f1160fc2a16b781b18e856e89956eb28b54c3a",
//   database: "d3fgsipjtlodos",
//   port: 5432,
//   host: "localhost",
//   ssl: true,
// });

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// exports
module.exports = pool;
