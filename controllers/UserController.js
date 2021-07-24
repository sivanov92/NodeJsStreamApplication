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
  const users = await User.findAll({where:{id:params.id}}).catch((e)=>{console.log(e);});
  if(users){
    return res.status(200).json(users);
  }
  return res.sendStatus(400);
});

router.get('/',async(req,res)=>{
  const users = await User.findAll().catch((e)=>{console.log(e);});
  if(users){
   return res.status(200).json(users);
  }
  return res.sendStatus(400);
});

router.put('/:id',async(req,res)=>{
    let data = req.body; 
    let params = req.params;
    let update = await User.update(data,{where:{id:params.id}});
    if(update){
      return res.sendStatus(200);
    }
    return res.sendStatus(400);
  });

router.delete('/:id',async(req,res)=>{
    let params = req.params;
    let del = await User.destroy({where:{id:params.id}})
    .catch((e)=>{console.log(e);});
    if( del ){ 
     return  res.sendStatus(200);
    }
   return res.sendStatus(400);
  });
  

router.post('/login',async(req,res)=>{
   let data = req.body; 

   if(data.email === undefined || data.password === undefined){
     res.status(400).send('User data not found');  
     return;
   }
   let user = await User.findOne({where:{email:data.email}})
   .catch((e) => {console.log(e);});
   
   if( user ){
    let password = data.password;
    if (Number.isInteger(password)){
        password = password.toString();
    }

    let login = await bcrypt.compare(password, user.password);
    if( login ){
      return res.status(200).json(user);
    }

    }    
   return  res.sendStatus(400);
});

router.post('/register',async(req,res)=>{
 let data = req.body;

 var userdata = {
    firstName : data.firstName,
    lastName : data.lastName,
    email : data.email,
    password : data.password
 };

 for(key in userdata){
  if(userdata[key] == null || userdata[key] === undefined){
      res.status(400).send('Please fill all fields');
      return;
  }
 }
   let hash = await  bcrypt.hash(userdata.password, saltRounds);
   if(hash){
    userdata.password = hash;
  }

  userdata.StreamKey = randomstring.generate();
   
  let existingUser = await User.findOne({where:{email:userdata.email}})
  .catch((e) => {console.log(e);});
  if(existingUser){
    return res.status(400).send('User is already registered !');
  }

  let newuser = await User.create(userdata)
     .catch((e) => {console.log(e);}); 
  if(newuser){ 
    return res.status(201).json(newuser);
   }
  return  res.sendStatus(400);
});

module.exports = router;