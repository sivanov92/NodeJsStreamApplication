var express = require('express')
var app = express()
var router = express.Router();
var jwt = require('jsonwebtoken');
var config = require('../config.js');

var userRouter = require('../controllers/UserController.js');
var videoRouter = require('../controllers/VideoController.js');
var streamRouter = require('../controllers/StreamController.js');

router.use(function(req,res,next){
  let authToken = req.headers.authorization.split(' ')[1];

  var token ;
  jwt.sign({ app: 'StreamBackend' }, authToken, { algorithm: 'HS256'},(err, getToken)=>{
    if(err){
       console.log(err);
       return res.status(401).send('Can not process auth token');
    }
     token = getToken;

     jwt.verify(token, config.API_SECRET_KEY, {algorithm: 'HS256'}, function(err, decoded) {

      if(err){
        console.log(err);
        return res.status(401).send('Incorrect auth token');
      }

      next();
    });

  });

});

router.use('/users',userRouter);
router.use('/videos',videoRouter)
router.use('/stream',streamRouter);


module.exports = router;
