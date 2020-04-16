//const queryTest = require('../db_apis/queryTest.js');
const database = require('../services/database.js');
 
async function get(req, res, next) {
  try {
    console.log("REQUEST PARAMS: ", req.query);

    let sY = req.query.seasonYear;
    let e  = req.query.event;
    let t1 = req.query.team1;
    let t2 = req.query.team2;
    let l = req.query.league;

    let v = "";
    let formula = "";
    let cCase = "event = ";
    if (l === "MLB") formula = "(inning + outs*(0.1))";
    if (l === "NHL") {
      formula = "(timeminute) + (20*(period-1))";
      v = "'" + e + "'";
    }
    if (l === "NFL") {
      formula = "(timeminute-15)*(-1)+(15*(quarter-1))";
      switch(e) {
        case "TOUCHDOWN": cCase = "istouchdown = 1"; break;
        case "INCOMPLETE PASS": cCase = "isincomplete = 1"; break;
        case "INTERCEPTION":    cCase = "isinterception = 1"; break;
        default: {
          cCase = "playtype = ";
          v = "'" + e + "'";
        }
      }
    }
    if (l === "NBA") {
      formula = "(timeminute-12)*(-1)+(12*(quarter-1))";
      switch(e) {
        case "Shot Make": cCase = "shotoutcome = 'make'"; break;
        case "Shot Miss": cCase = "shotoutcome = 'miss'"; break;
        case "Turnover":  cCase = "turnovertype IS NOT NULL"; break;
        default: {
          cCase = "otherplaytype = ";
          v = "'" + e + "'";
        }
      }
    }

    var baseQuery;

    if(l === "MLB") {
        baseQuery = 
        `SELECT seasonyear, teamabbreviation, `+ formula +` AS inning,
                COUNT(CASE WHEN event = '`+ e +`' THEN 1 END) AS occurences
            FROM team t, participatesIn p, game g, gamestats gs, mlb_atbats m
            WHERE t.teamid IN (p.hometeamid, p.awayteamid) AND p.gameid = g.gameid
                AND g.gameid = gs.gameid AND gs.gamestatsID = m.gamestatsID
                AND seasonyear = `+ sY +`
                AND teamabbreviation IN ('`+ t1 +`','`+ t2 +`')
            GROUP BY seasonyear, teamabbreviation, `+ formula +`
            ORDER BY inning`;
    }
    else {
        baseQuery = 
        `SELECT seasonyear, teamabbreviation, `+ formula +` AS minute,
                COUNT(CASE WHEN `+ cCase + ` `+ v +`  THEN 1 END) AS occurences
            FROM team t, participatesIn p, game g, gamestats gs, playbyplay pbp, `+ l +`_playbyplay n
            WHERE t.teamid IN (p.hometeamid, p.awayteamid) AND p.gameid = g.gameid
                AND g.gameid = gs.gameid AND gs.gamestatsID = pbp.gamestatsID
                AND pbp.gamestatsID = n.gamestatsID
                AND seasonyear = `+ sY +`
                AND teamabbreviation IN ('`+ t1 +`','`+ t2 +`')
            GROUP BY seasonyear, teamabbreviation, `+ formula +`
            ORDER BY minute`;
    }

    console.log("QUERY: ", baseQuery);
 
    const binds = {};
    const result = await database.simpleExecute(baseQuery, binds);

    //console.log("CONS RES: ", result.rows);
 
    res.status(200).json(result.rows);

  } catch (err) {
    next(err);
  }
}
 
module.exports.get = get;