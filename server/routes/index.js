var express = require('express');
const {mapController,liveDataController} = require("../controller");
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Expresssss' });
});

router.get('/liveData',liveDataController)

router.get('/cluster', mapController)


module.exports = router;
