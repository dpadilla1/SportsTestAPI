//const queryTest = require('../db_apis/queryTest.js');
const database = require('../services/database.js');
 
async function get(req, res, next) {
  try {
    console.log("REQUEST PARAMS: ", req.query);

    let pT = req.query.playerType;
    let sY = req.query.seasonYear;
    let sT = req.query.scoringType;
    let q = req.query.quantity;

    let pTq = "";
    let removeQBs = " AND nps.passescompleted < 10 ";
    if (pT === "Receiver") pTq += "nps.receivingyards";
    else if (pT === "Rusher") pTq += "nps.rushingyards";
    else {
        pTq = "nps.passingyards";
        removeQBs = " ";
    }

    let sTq = 0;
    if (sT === "PPR") sTq = 1;
    else if (sT ==="Half PPR") sTq = 0.5;
    else sTq = 0;

    const baseQuery = 
    `SELECT ps.year, p.firstname || ' ' || p.lastname as NAME, 
            (PassingYards/25 + TDPasses * 4 - INTS * 2 - Sacks
            + RushingYards / 10 + RushingTDs * 6 + ReceivingYards / 10
            + ReceivingTDs * 6 + Receptions * ` + sTq + `) as FantasyPoints
        FROM player p, playerstats ps, nfl_playerstats nps,
            (SELECT p.playerid
            FROM player p, playerstats ps, nfl_playerstats nps
            WHERE p.playerid = ps.playerid
                AND ps.stats_ID = nps.stats_ID
                AND ps.year = ` + sY + ` ` + removeQBs + `
            ORDER BY ` + pTq + ` DESC
            OFFSET 0 ROWS FETCH NEXT 15 ROWS ONLY) ptype
        WHERE p.playerid = ps.playerid
            AND ps.stats_ID = nps.stats_ID
            AND p.playerid IN ptype.playerid
            AND ps.year = ` + sY + `
        ORDER BY FantasyPoints DESC
        OFFSET 0 ROWS FETCH NEXT ` + q + ` ROWS ONLY`;
 
    const binds = {};
    const result = await database.simpleExecute(baseQuery, binds);

    //console.log("CONS RES: ", result.rows);
 
    res.status(200).json(result.rows);

  } catch (err) {
    next(err);
  }
}
 
module.exports.get = get;