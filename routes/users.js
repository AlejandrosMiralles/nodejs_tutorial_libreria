var express = require('express');
var router = express.Router();
const user_controller = require("../controllers/userController");


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


/* GET cool message. */
router.get('/cool', function(req, res, next) {

  //res.send('respond with a resource');

  //*
  res.render('cool', { pronoumVerb: 'You are' });
  //*/
});

router.get("/login", user_controller.login_get);

router.post("/login", user_controller.login_post);

router.get("/register", user_controller.register_get);

router.post("/register", user_controller.register_post);

router.get("/logout", user_controller.logout);

module.exports = router;
