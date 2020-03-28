//const queryTest = require('../db_apis/queryTest.js');
const database = require('../services/database.js');
 
async function get(req, res, next) {
  try {
    const baseQuery = 
    `SELECT SUBSTR(da,4,6) as MONTH, t1.*
    FROM (
        SELECT TRUNC(gamedate, 'MONTH') da, turnovertype, COUNT(*) c,
            rank() over ( partition by TRUNC(gamedate,'MONTH') order by COUNT(*) DESC) rank
        FROM NBA_PLAYBYPLAY npbp, gamestats, game
        WHERE npbp.gamestatsid = gamestats.gamestatsid
            AND gamestats.gameid = game.gameid
            AND turnovertype IS NOT NULL
        GROUP BY TRUNC(gamedate, 'MONTH'), turnovertype
        ORDER BY turnovertype, TRUNC(gamedate, 'MONTH'), COUNT(*) DESC
        ) t1
    WHERE rank < 4`;
 
    const binds = {};
    const result = await database.simpleExecute(baseQuery, binds);

    //console.log("CONS RES: ", result.rows);
 
    res.status(200).json(result.rows);

  } catch (err) {
    next(err);
  }
}
 
module.exports.get = get;