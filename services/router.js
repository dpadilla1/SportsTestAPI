const express = require('express');
const router = new express.Router();
//const employees = require('../controllers/employees.js');
const queryTest = require('../controllers/queryTest.js');
const teams = require('../controllers/teams.js');
 
//router.route('/employees/:id?')
//  .get(employees.get);

router.route('/queryTest')
    .get(queryTest.get);

router.route('/teams')
    .get(teams.get);
 
module.exports = router;