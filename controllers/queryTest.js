//const queryTest = require('../db_apis/queryTest.js');
const database = require('../services/database.js');
 
async function get(req, res, next) {
  try {
    const baseQuery = 
    `SELECT *
    FROM Airport`;
 
    const binds = {};
    const result = await database.simpleExecute(baseQuery, binds);

    console.log("CONS RES: ", result.rows);
 
    res.status(200).json(result.rows);

  } catch (err) {
    next(err);
  }
}
 
module.exports.get = get;