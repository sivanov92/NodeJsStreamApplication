const formData = require("form-data");
var express = require('express');
var config = require('../config.js');
const Video = require('../models/Video.js');
const User = require('../models/User.js');
const fileupload = require('express-fileupload');
const fetch = require('node-fetch');
const fs = require('fs/promises');
const fsys = require('fs');
var router = express.Router();

router.use(express.json()) // for parsing application/json
router.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
router.use(fileupload());

var base_cloudflare_endpoint = `https://api.cloudflare.com/client/v4/accounts/${config.cloudflare_acc_id}/stream`;

//Get all videos FOR A SPECIFIC AUTHOR
router.get('/author/:authorID',async (req,res)=>{
    if(req.params.authorID === undefined){
        res.status(400).send('Please set up authorID !');
        return;
    }
    let authorID = req.params.authorID;
    let author = await User.findOne({where : {id:authorID}}).catch((e)=>{console.log(e);});
    if( author !== null){
        let videos = await author.getVideos().catch(e=>{console.log(e);});

        res.status(200).json(videos);  
    }
    res.status(400).send('Author not found !');
});

//Get specific video by ID
router.get('/:id', async(req,res)=>{
    if( req.params.id === undefined){
       res.sendStatus(400);
       return; 
    }  
    const videos = await Video.findOne({where : { id : req.params.id }}).catch(e=>{console.log(e);});

    res.status(200).json(JSON.stringify(videos));
});

//Get all videos with an optional UID param
router.get(':uid?', async(req,res)=>{
    if(req.query.uid === undefined){
        const videos = await Video.findAll().catch(e=>{console.log(e);});
        if( videos !== null){
            res.status(200).json(JSON.stringify(videos));
            return;
        }
        res.sendStatus(400); 
        return;
    }  

    const videos_uid = await Video.findOne({where : { uid : req.query.uid }}).catch(e=>{console.log(e);});
    
    res.status(200).json(JSON.stringify(videos_uid));
});

//Post a new video
router.post('/',async (req,res)=>{
    let body = req.body;
    if(!req.files.file){
       res.status(400).send('No files named /"file/" were uploaded.');
       return;
    }
    let video_temp_name = 'tmp/'+req.files.file.name;

    await fs.appendFile(video_temp_name,req.files.file.data,{flag:'wx'}).catch((e) => {console.log(e);});

    let form = new formData();
    const buffer = fsys.readFileSync(video_temp_name);
    form.append('file', buffer, {
        filename: video_temp_name
    });   
     let args = {
        'method':"POST",
        'body': form,
        'headers':{
            "X-Auth-Email":config.cloudflare_email,
            "X-Auth-Key":config.cloudflare_stream_key
        }
    };   
    var videos = await fetch(base_cloudflare_endpoint,args).catch((e) => {console.log(e);});
    const data = await videos.json();

    await fs.unlink(video_temp_name).catch(e=>{console.log(e);});;
      
    if(videos.ok){
        let video_body = {
            'title':body.title,
            'UserId':body.author,
            'file':data.result.playback.hls,
            'uid':data.result.uid,
            'thumbnail':data.result.thumbnail
        };
        for(key in video_body){
            if(video_body[key] == null || video_body[key] == ''){
                res.status(403).send(`Please fill all fields , ${key} is missing`);
                return;
            }
           }    
         var video_author =   await User.findOne({where : {id : body.author}}).catch((e) => {console.log(e);});
        if( video_author !== null){
            var new_video =  await Video.create(video_body).catch((e) => {console.log(e);});

            await video_author.addVideo(new_video).catch((e) => {console.log(e);});

            if(new_video == true ){
              res.sendStatus(201);
              return;
            }   
        } 
    }
    res.sendStatus(videos.status);
   });
   
//Update a video
router.put('/:id',async(req,res)=>{
 if(req.params.id === undefined){
     res.status(404).send('Please set up ID param');
     return;
 }
 let id_param = req.params.id;
 let title_param = req.body.title;
 const video = await Video.update({title:title_param},{where : {id:id_param}}).catch((e)=>{console.log(e);});
 if( video == true){
   res.status(200).json(JSON.stringify(video));
   return ;
 }  
 res.sendStatus(400);
});

//Delete a video
router.delete('/:id',async(req,res)=>{
 if(req.params.id === undefined){
    res.status(404).send('Please set up ID param');
    return;
   }   
 let id_param = req.params.id;
 let args = {
    'method':"DELETE",
    'headers':{
        "Content-type":"application/json",
        "X-Auth-Email":config.cloudflare_email,
        "X-Auth-Key":config.cloudflare_stream_key
    }
};   
 let target_vid = await Video.findOne({where:{id:id_param}}).catch((e)=>{console.log(e);});
 if(target_vid.uid){
    var videos_del = await fetch(`${base_cloudflare_endpoint}/${target_vid.uid}`,args).catch((e)=>{console.log(e);});
    if(videos_del.ok){
        const delete_video = await Video.destroy({ where : {id : id_param}}).catch((e)=>{console.log(e);});
        if(delete_video == true){
            res.sendStatus(200);
            return;    
        }
    }    
 }
res.sendStatus(videos_del.status);
});

module.exports = router;