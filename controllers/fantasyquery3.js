//const queryTest = require('../db_apis/queryTest.js');
const database = require('../services/database.js');
 
async function get(req, res, next) {
  try {
    console.log("REQUEST PARAMS: ", req.query);

    let sY = req.query.seasonYear;
    let t = req.query.team;
    let y1 = req.query.yearOne;
    let y2 = req.query.yearTwo;
    let pT = req.query.playerType;
    let m = req.query.minimumGames;

    var baseQuery;

    if(pT === "Pitchers") {
        baseQuery = 
        `SELECT year, name, AVG(FantasyPoints) as FantasyPoints
        FROM (
            SELECT ps.year, top.firstname || ' ' || top.lastname as NAME, 
                    (W * 4 + SV * 4 + IPOUTS * 3 + H * (-1) + ER * (-2) +
                    BB * (-1) + SO * 2) / G as FantasyPoints
            FROM (
                SELECT tab.playerID, tab.firstname, tab.lastname, AVG(FantasyPoints) as FantasyPoints
                FROM (
                    SELECT fromteam.playerID, fromteam.firstname, fromteam.lastname,
                            (W * 4 + SV * 4 + IPOUTS * 3 + H * (-1) + ER * (-2) +
                            BB * (-1) + SO * 2) / G as FantasyPoints
                    FROM (
                        SELECT p.playerID, p.firstname, p.lastname
                        FROM player p, playedFor pF, team t
                        WHERE p.playerid = pF.playerID
                            AND pF.teamID = t.teamID
                            AND t.LeagueName = 'MLB'
                            AND t.teamname = '`+ t + `'
                            AND pF.yearplayedfor = `+ sY +`) fromteam, 
                        playerstats ps, mlb_playerstats_pitching nps
                    WHERE fromteam.playerid = ps.playerid
                        AND ps.stats_ID = nps.stats_ID
                        AND ps.year = `+ sY +`
                        AND G > `+ m +`) tab
                GROUP BY tab.playerID, tab.firstname, tab.lastname
                ORDER BY FantasyPoints DESC
                OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY) top, 
                playerstats ps, mlb_playerstats_pitching nps
            WHERE top.playerid = ps.playerid
                AND ps.stats_ID = nps.stats_ID
                AND ps.year between `+ y1 +` and `+ y2 +`) tab
        GROUP BY year, name
        ORDER BY Year, Name, FantasyPoints DESC`;
    }
    else {
        baseQuery = 
        `SELECT year, name, AVG(FantasyPoints) as FantasyPoints
        FROM (
            SELECT ps.year, top.firstname || ' ' || top.lastname as NAME, 
                    (Runs * 1.9 + Hits * 2.6 + Doubles * 5.2 + Triples * 7.8
                    + HR * 10.4 + RBI * 1.9  + SB * 4.2 + BB * 2.6) / GAMES as FantasyPoints
            FROM (
                SELECT tab.playerID, tab.firstname, tab.lastname, AVG(FantasyPoints) as FantasyPoints
                FROM (
                    SELECT fromteam.playerID, fromteam.firstname, fromteam.lastname,
                                (Runs * 1.9 + Hits * 2.6 + Doubles * 5.2 + Triples * 7.8
                                + HR * 10.4 + RBI * 1.9  + SB * 4.2 + BB * 2.6) / GAMES as FantasyPoints
                    FROM (
                        SELECT p.playerID, p.firstname, p.lastname
                        FROM player p, playedFor pF, team t
                        WHERE p.playerid = pF.playerID
                            AND pF.teamID = t.teamID
                            AND t.LeagueName = 'MLB'
                            AND t.teamname = '`+ t + `'
                            AND pF.yearplayedfor = `+ sY +`) fromteam, 
                        playerstats ps, mlb_playerstats_batting nps
                    WHERE fromteam.playerid = ps.playerid
                        AND ps.stats_ID = nps.stats_ID
                        AND ps.year = `+ sY +`
                        AND GAMES > `+ m +`) tab
                GROUP BY tab.playerID, tab.firstname, tab.lastname
                ORDER BY FantasyPoints DESC
                OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY) top, 
                playerstats ps, mlb_playerstats_batting nps
            WHERE top.playerid = ps.playerid
                AND ps.stats_ID = nps.stats_ID
                AND ps.year between `+ y1 +` and `+ y2 +`) tab
        GROUP BY year, name
        ORDER BY Year, Name, FantasyPoints DESC`;
    }
 
    const binds = {};
    const result = await database.simpleExecute(baseQuery, binds);

    //console.log("CONS RES: ", result.rows);
 
    res.status(200).json(result.rows);

  } catch (err) {
    next(err);
  }
}
 
module.exports.get = get;