var express = require('express');
const User = require('../models/User.js');
var router = express.Router();
var user = require('./models/User.js');

const bcrypt = require('bcrypt');
const saltRounds = 10;

var randomstring = require("randomstring");

var app = express()

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

router.get('/users',(req,res)=>{
  const users =await  User.findAll();
  res.status(200).json(JSON.stringify(users));
});

router.put('/users/:id',(req,res)=>{
    let params = req.params;
    let data = req.body; 
    if(params.id == null || params.id == ''){
        res.status(403).send('USER ID not set');    
    }
    let update = await User.update(data,{where:{id:params.id}});
    if(update != null){ 
       res.status(200).json(JSON.stringify(update));
    }
    res.end();
  });

router.delete('/users/:id',(req,res)=>{
    let params = req.params;
    if(params.id == null || params.id == ''){
        res.status(403).send('USER ID not set');    
    }
    let del = await User.destroy({where:{id:params.id}});
    if(del != null){ 
       res.status(200).json(JSON.stringify(del));
    }
    res.end();
  });
  

router.post('/login',(req,res)=>{
   let data = req.body; 
   let user = await User.findOne({where:{email:data.email}});
   if( user == null || data.password){
    res.status(403).send('User not found');  
   }
    bcrypt.compare(data.password, user.password, function(err, result) {
       if(result){
            res.status(200).send('Success');
           }
        });

    res.end();
});

router.post('/register',(req,res)=>{
 let data = req.body;
 let userdata = {
     firstName: data.firstName,
     lastName : data.lastName,
     password : data.password,
     email : data.email
 };

 for(key in userdata){
  if(userdata.key == null || userdata.key==''){
      res.status(403).send('Please fill all fields');
  }
 }

 bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(userdata.password, salt, function(err, hash) {
        // Store hash in your password DB.
        userdata.password = hash;
    });
});
 
  userdata.StreamKey = randomstring.generate();
  let newuser = await User.create(userdata); 
  if(newuser != null)
   { 
    res.status(201).json(JSON.stringify(newuser));
   }
   res.end();
});

module.exports = router;