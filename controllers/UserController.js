var express = require('express');
const User = require('../models/User.js');
var router = express.Router();

const bcrypt = require('bcrypt');
const saltRounds = 10;

var randomstring = require("randomstring");

var app = express()

router.use(express.json()) // for parsing application/json
router.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

router.get('/:id?',async(req,res)=>{
  let params = req.params;
  if(params.id != null){
    const users =await  User.findAll({where:{id:params.id}});
    res.status(200).json(JSON.stringify(users));
    return;
  }  
  const users =await  User.findAll();
  res.status(200).json(JSON.stringify(users));
});

router.put('/:id',async(req,res)=>{
    let params = req.params;
    let data = req.body; 
    if(params.id == null || params.id == ''){
        res.status(403).send('USER ID not set');    
        return;
    }
    let update = await User.update(data,{where:{id:params.id}});
    if(update != null){ 
       res.status(200).json(JSON.stringify(update));
    }
    res.end();
  });

router.delete('/:id',async(req,res)=>{
    let params = req.params;
    if(params.id == null || params.id == ''){
        res.status(403).send('USER ID not set');  
        return;  
    }
    let del = await User.destroy({where:{id:params.id}})
    .catch((e)=>{console.log(e);});
    if(del != null){ 
       res.status(200).send('User Deleted');
       return;
    }
    res.end();
  });
  

router.post('/login',async(req,res)=>{
   let data = req.body; 
   let user = await User.findOne({where:{email:data.email}})
   .catch((e) => {console.log(e);});
   if( user == null || data.password==null ){
    res.status(400).send('User not found');  
    return;
   }
    
    let password = data.password;
    if (Number.isInteger(password)){
        password = password.toString();
    }
    bcrypt.compare(password, user.password).then((result) => {
         res.status(200).json(JSON.stringify(user));
         return;
        })
        .catch((e) => {console.log(e);});
});

router.post('/register',async(req,res)=>{
 let data = req.body;
 console.log('REQ body '+data);
 let userdata = {
     firstName: data.firstName,
     lastName : data.lastName,
     password : data.password,
     email : data.email
 };

 for(key in userdata){
  if(userdata[key] == null || userdata[key]==''){
      res.status(400).send('Please fill all fields');
      return;
  }
 }
 bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(userdata.password, salt, function(err, hash) {
        // Store hash in your password DB.
        userdata.password = hash;
    });
});
 
  userdata.StreamKey = randomstring.generate();
  let newuser = await User.create(userdata)
  .catch((e) => {console.log(e);}); 
  if(newuser != null)
   { 
    res.status(201).json(JSON.stringify(newuser));
   }
});

module.exports = router;