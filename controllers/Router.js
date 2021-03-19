var express = require('express')
var app = express()
var router = express.Router();

var userRouter = require('UserController.js');

router.use(function(req,res,next){
  //Set up OAUTH or other authentication for API services for the FE
});

router.use('/',userRouter);
