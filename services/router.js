const express = require('express');
const router = new express.Router();
//const employees = require('../controllers/employees.js');
const fantasyquery1 = require('../controllers/fantasyquery1.js');
const fantasyquery2 = require('../controllers/fantasyquery2.js');
const fantasyquery3 = require('../controllers/fantasyquery3.js');
const trendquery1 = require('../controllers/trendquery1.js');
const trendquery2 = require('../controllers/trendquery2.js');
const trendquery3 = require('../controllers/trendquery3.js');
const queryTest = require('../controllers/queryTest.js');
const teams = require('../controllers/teams.js');
 
//router.route('/employees/:id?')
//  .get(employees.get);

router.route('/fantasyquery1')
    .get(fantasyquery1.get);

router.route('/fantasyquery2')
    .get(fantasyquery2.get);

router.route('/fantasyquery3')
    .get(fantasyquery3.get);

router.route('/trendquery1')
    .get(trendquery1.get);

router.route('/trendquery2')
    .get(trendquery2.get);

router.route('/trendquery3')
    .get(trendquery3.get);

router.route('/queryTest')
    .get(queryTest.get);

router.route('/teams')
    .get(teams.get);
 
module.exports = router;