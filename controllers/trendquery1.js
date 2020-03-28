//const queryTest = require('../db_apis/queryTest.js');
const database = require('../services/database.js');
 
async function get(req, res, next) {
  try {
    console.log("REQUEST PARAMS: ", req.query);
    let sY = req.query.startYear;
    let eY = req.query.endYear;
    const baseQuery = 
    `SELECT seasonYear, playType, AVG(Yards) as averageYards
    FROM NFL_PLAYBYPLAY npbp, gamestats, game
    WHERE npbp.gamestatsid = gamestats.gamestatsid
        AND gamestats.gameid = game.gameid
        AND seasonYear BETWEEN ` + sY + ` AND ` + eY + 
    ` GROUP BY seasonYear, playType
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