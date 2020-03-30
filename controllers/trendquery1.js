//const queryTest = require('../db_apis/queryTest.js');
const database = require('../services/database.js');
 
async function get(req, res, next) {
  try {
    console.log("REQUEST PARAMS: ", req.query);
    //---TEST ATTEMPT---//
    /*
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
    ORDER BY playType ASC, seasonyear`;*/

    let pT = req.query.playType;
    let sY = req.query.seasonYear;
    let teamList = req.query.teamList;
    let tL = "";
    for(i=0; i<teamList.length; i++) {
        tL += "'" + teamList[i] + "',";
    }
    tL += "'end'";

    const baseQuery = 
    `SELECT SUBSTR(da,4,6) as MONTH, seasonYear, offenseteam, playtype, avgYards
     FROM (
        SELECT seasonYear, TRUNC(gamedate, 'MONTH') da, offenseteam, playType, AVG(Yards) avgYards
        FROM NFL_PLAYBYPLAY npbp, gamestats, game
        WHERE npbp.gamestatsid = gamestats.gamestatsid
            AND gamestats.gameid = game.gameid
            AND playType='` + pT + `' 
            AND seasonYear = ` + sY + ` 
            AND offenseteam IN (` + tL + `)
        GROUP BY seasonYear, offenseteam, TRUNC(gamedate, 'MONTH'), playType
        ORDER BY seasonYear, offenseteam, TRUNC(gamedate, 'MONTH')
        )`;
 
    const binds = {};
    const result = await database.simpleExecute(baseQuery, binds);

    //console.log("CONS RES: ", result.rows);
 
    res.status(200).json(result.rows);

  } catch (err) {
    next(err);
  }
}
 
module.exports.get = get;