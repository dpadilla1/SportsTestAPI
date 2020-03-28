//const queryTest = require('../db_apis/queryTest.js');
const database = require('../services/database.js');
 
async function get(req, res, next) {
  try {
    const baseQuery = 
    `SELECT seasonYear, playType, SUM(Yards) as totalYards
    FROM NFL_PLAYBYPLAY npbp, gamestats, game
    WHERE npbp.gamestatsid = gamestats.gamestatsid
        AND gamestats.gameid = game.gameid
    GROUP BY seasonYear, playType
    HAVING playType='RUSH' OR playType='PASS'
    ORDER BY playType ASC, seasonyear`;
 
    const binds = {};
    const result = await database.simpleExecute(baseQuery, binds);

    //console.log("CONS RES: ", result.rows);
 
    res.status(200).json(result.rows);

  } catch (err) {
    next(err);
  }
}
 
module.exports.get = get;