//const queryTest = require('../db_apis/queryTest.js');
const database = require('../services/database.js');
 
async function get(req, res, next) {
  try {
    console.log("REQUEST PARAMS: ", req.query);

    let sY = req.query.seasonYear;
    let q = req.query.quantity;

    const baseQuery = 
    `SELECT League, year, MIN(FantasyPoints) as Minimum,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY FantasyPoints DESC) as Q1,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY FantasyPoints DESC) as Q2,
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY FantasyPoints DESC) as Q3,
        MAX(FantasyPoints) as Maximum
    FROM (
    (SELECT 'NFL' as League, ps.year, p.firstname || ' ' || p.lastname as NAME, 
            (PassingYards/25 + TDPasses * 4 - INTS * 2 - Sacks
            + RushingYards / 10 + RushingTDs * 6 + ReceivingYards / 10
            + ReceivingTDs * 6 + Receptions * 0.5) as FantasyPoints
        FROM player p, playerstats ps, nfl_playerstats nps
        WHERE p.playerid = ps.playerid
            AND ps.stats_ID = nps.stats_ID
            AND nps.passescompleted < 10
            AND ps.year = ` + sY + `
        ORDER BY FantasyPoints DESC
        OFFSET 0 ROWS FETCH NEXT ` + q + ` ROWS ONLY)
        UNION (
        SELECT 'NHL' as League, ps.year, p.firstname || ' ' || p.lastname as NAME, 
            (Goals * 6 + Assists * 4 + PPP * 2 + Blocks) as FantasyPoints
        FROM player p, playerstats ps, nhl_playerstats nps
        WHERE p.playerid = ps.playerid
            AND ps.stats_ID = nps.stats_ID
            AND ps.year = ` + sY + `
        ORDER BY FantasyPoints DESC
        OFFSET 0 ROWS FETCH NEXT ` + q + ` ROWS ONLY)
        UNION (
        SELECT 'NBA' as League, ps.year, p.firstname || ' ' || p.lastname as NAME, 
            (Points + Rebounds * 1.2 + Assists * 1.5 + 
            Blocks * 3 + Steals * 3) as FantasyPoints
        FROM player p, playerstats ps, nba_playerstats nps
        WHERE p.playerid = ps.playerid
            AND ps.stats_ID = nps.stats_ID
            AND ps.year = ` + sY + `
        ORDER BY FantasyPoints DESC
        OFFSET 0 ROWS FETCH NEXT ` + q + ` ROWS ONLY)
        UNION (
        SELECT 'MLB' as League, ps.year, p.firstname || ' ' || p.lastname as NAME, 
            (Runs * 1.9 + Hits * 2.6 + Doubles * 5.2 + Triples * 7.8
            + HR * 10.4 + RBI * 1.9  + SB * 4.2 + BB * 2.6) as FantasyPoints
        FROM player p, playerstats ps, mlb_playerstats_batting nps
        WHERE p.playerid = ps.playerid
            AND ps.stats_ID = nps.stats_ID
            AND ps.year = ` + sY + `
        ORDER BY FantasyPoints DESC
        OFFSET 0 ROWS FETCH NEXT ` + q + ` ROWS ONLY)
        ) t
        GROUP BY League, year`;
 
    const binds = {};
    const result = await database.simpleExecute(baseQuery, binds);

    //console.log("CONS RES: ", result.rows);
 
    res.status(200).json(result.rows);

  } catch (err) {
    next(err);
  }
}
 
module.exports.get = get;