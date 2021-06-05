var express = require('express');
const User = require('../models/User.js');
var router = express.Router();

const bcrypt = require('bcrypt');
const saltRounds = 10;

var randomstring = require("randomstring");

router.use(express.json()) // for parsing application/json
router.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

router.get('/:id',async(req,res)=>{
  let params = req.params;
  const users = await User.findAll({where:{id:params.id}});
  res.status(200).json(JSON.stringify(users));
});

router.get('/',async(req,res)=>{
  const users = await User.findAll();
  res.status(200).json(JSON.stringify(users));
});

router.put('/:id',async(req,res)=>{
    let data = req.body; 
    if(req.params.id === undefined){
        res.status(400).send('USER ID not set');    
        return;
    }
    let params = req.params;
    let update = await User.update(data,{where:{id:params.id}});
    if(update == true){
       res.status(200).json(JSON.stringify(update));
       return;
    }
    res.sendStatus(404);
  });

router.delete('/:id',async(req,res)=>{
    if(req.params.id === undefined){
        res.status(403).send('USER ID not set');  
        return;  
    }
    let params = req.params;
    let del = await User.destroy({where:{id:params.id}})
    .catch((e)=>{console.log(e);});
    if(del == true){ 
       res.status(200).send('User Deleted');
       return;
    }
    res.sendStatus(404);
  });
  

router.post('/login',async(req,res)=>{
   let data = req.body; 

   if(data.email === undefined || data.password === undefined){
     res.status(400).send('User data not found');  
     return;
   }
   let user = await User.findOne({where:{email:data.email}})
   .catch((e) => {console.log(e);});

   if( user === null ){
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
        .catch((e) => {res.sendStatus(400);console.log(e);});
});

router.post('/register',async(req,res)=>{
 let data = req.body;

 for(key in userdata){
  if(userdata[key] == null || userdata[key] === undefined){
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
  if(newuser == true)
   { 
    res.status(201).json(JSON.stringify(newuser));
    return;
   }
   res.sendStatus(400);
});

module.exports = router;