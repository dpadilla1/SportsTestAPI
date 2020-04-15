//const queryTest = require('../db_apis/queryTest.js');
const database = require('../services/database.js');
 
async function get(req, res, next) {
  try {
    console.log("REQUEST PARAMS: ", req.query);

    let sY = req.query.startYear;
    let eY = req.query.endYear;
    let c1 = req.query.city1;
    let c2 = req.query.city2;

    const baseQuery = 
    `SELECT ty.Year, t0.areaname, HomeRuns, Touchdowns, Baskets, Goals,
          COUNT(CASE WHEN Homeruns IS NOT NULL THEN 1 END) +
          COUNT(CASE WHEN Touchdowns IS NOT NULL THEN 1 END) + 
          COUNT(CASE WHEN Baskets IS NOT NULL THEN 1 END) + 
          COUNT(CASE WHEN Goals IS NOT NULL THEN 1 END) as "Number of Leagues"
      FROM 
              (SELECT DISTINCT areaname FROM Team WHERE areaname IN ('`+ c1 +`','`+ c2 +`')) t0
          CROSS JOIN 
              (SELECT year FROM Years WHERE year BETWEEN `+ sY +` AND `+ eY +`) ty
          LEFT OUTER JOIN (
              SELECT g.seasonyear, t.areaname, COUNT(*) as HomeRuns
              FROM team t, participatesIn p, game g, gamestats gs, mlb_atbats m
              WHERE t.teamID = p.hometeamID AND p.gameID = g.gameID
                  AND g.gameID = gs.gameID AND gs.gamestatsID = m.gamestatsID
                  AND seasonyear BETWEEN `+ sY +` AND `+ eY +`
                  AND event = 'Home Run'
              GROUP BY g.seasonyear, t.areaname) t1
                ON t0.areaname = t1.areaname AND ty.year = t1.seasonyear
          LEFT OUTER JOIN (
              SELECT g.seasonyear, t.areaname, SUM(ISTOUCHDOWN) as Touchdowns
              FROM team t, participatesIn p, game g, gamestats gs, nfl_playbyplay n
              WHERE t.teamID = p.hometeamID AND p.gameID = g.gameID
                  AND g.gameID = gs.gameID AND gs.gamestatsID = n.gamestatsID
                  AND seasonyear BETWEEN `+ sY +` AND `+ eY +`
              GROUP BY g.seasonyear, t.areaname) t2
                  ON t0.areaname = t2.areaname AND ty.year = t2.seasonyear
          LEFT OUTER JOIN (
              SELECT g.seasonyear, t.areaname, COUNT(*) as Baskets
              FROM team t, participatesIn p, game g, gamestats gs, nba_playbyplay n
              WHERE t.teamID = p.hometeamID AND p.gameID = g.gameID
                  AND g.gameID = gs.gameID AND gs.gamestatsID = n.gamestatsID
                  AND seasonyear BETWEEN `+ sY +` AND `+ eY +`
                  AND shotoutcome = 'make'
              GROUP BY g.seasonyear, t.areaname) t3
                  ON t0.areaname = t3.areaname AND ty.year = t3.seasonyear
          LEFT OUTER JOIN (
              SELECT g.seasonyear, t.areaname, COUNT(*) as Goals
              FROM team t, participatesIn p, game g, gamestats gs, nhl_playbyplay n
              WHERE t.teamID = p.hometeamID AND p.gameID = g.gameID
                  AND g.gameID = gs.gameID AND gs.gamestatsID = n.gamestatsID
                  AND seasonyear BETWEEN `+ sY +` AND `+ eY +`
                  AND event = 'Goal'
              GROUP BY g.seasonyear, t.areaname) t4
                  ON t0.areaname = t4.areaname AND ty.year = t4.seasonyear
      GROUP BY ty.year, t0.areaname, HomeRuns, Touchdowns, Baskets, Goals
      ORDER BY year, areaname`;
 
    const binds = {};
    const result = await database.simpleExecute(baseQuery, binds);

    //console.log("CONS RES: ", result.rows);
 
    res.status(200).json(result.rows);

  } catch (err) {
    next(err);
  }
}
 
module.exports.get = get;