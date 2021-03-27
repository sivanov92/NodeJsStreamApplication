var express = require('express')
var app = express()
var router = express.Router();
var jwt = require('jsonwebtoken');
var config = require('./config.js');

var userRouter = require('UserController.js');

router.use(function(req,res,next){
  let token = req.get('Authorization');
  jwt.verify(token, config.API_SECRET_KEY, function(err, decoded) {
    if(err){
      res.status(401).send('Unauthorized to send request !');
    }
  });
  next();
});

router.use('/',userRouter);

module.exports = router;
