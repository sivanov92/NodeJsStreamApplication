const formData = require("form-data");
var express = require('express');
var config = require('../config.js');
const Video = require('../models/Video.js');
const User = require('../models/User.js');
const fileupload = require('express-fileupload');
const fetch = require('node-fetch');
var app = express();
const fs = require('fs/promises');
const fsys = require('fs');
var router = express.Router();
var cors = require('cors');

router.use(express.json()) // for parsing application/json
router.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
router.use(fileupload());
router.use(cors({
    origin:false
}));

var base_cloudflare_endpoint = `https://api.cloudflare.com/client/v4/accounts/${config.cloudflare_acc_id}/stream`;

//Get all videos
router.get('/:uid?', async(req,res)=>{
    let uid_param = req.params.uid;
    if( uid_param == null){
        const videos = await Video.findAll().catch(e=>{console.log(e);});
        res.status(200).json(JSON.stringify(videos));
        return;
    }
    const videos = await Video.findOne({where : {uid:uid_param}})
    .catch(e => {console.log(e);});
    res.status(200).json(JSON.stringify(videos));
});

//Get all videos FOR A SPECIFIC AUTHOR
router.get('/author/:authorID',async (req,res)=>{
    let authorID = req.params.authorID;
    if(authorID == null){
        const videos = await Video.findAll();
        res.status(200).json(JSON.stringify(videos));
        return;
    }
    const author = await User.findOne({where : {id:authorID}}).catch((e)=>{console.log(e);});
    const videos = await author.getVideos().catch(e=>{console.log(e);});
     res.status(200).json(JSON.stringify(videos));
    });
   
//Post a new video
router.post('/',async (req,res)=>{
    let body = req.body;
    if(!req.files.file){
        return res.status(400).send('No files named /"file/" were uploaded.');
    }
    let video_temp_name = 'tmp/'+req.files.file.name;

    let write_data = await fs.appendFile(video_temp_name,req.files.file.data,{flag:'wx'}).catch((e) => {console.log(e);});

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

    let delete_data = await fs.unlink(video_temp_name);
      
    if(videos.status == 200){
        let video_body = {
            'title':body.title,
            'UserId':body.author,
            'file':data.result.playback.hls,
            'uid':data.result.uid,
            'thumbnail':data.result.thumbnail
        };
        for(key in video_body){
            if(video_body[key] == null || video_body[key]==''){
                res.status(403).send(`Please fill all fields , ${key} is missing`);
                return;
            }
           }    
         var video_author =   await User.findOne({where : {id : body.author}}).catch((e) => {console.log(e);});

         var new_video =  await Video.create(video_body).catch((e) => {console.log(e);});

         await video_author.addVideo(new_video).catch((e) => {console.log(e);});
         res.status(201).json(JSON.stringify(new_video));
        return;
    }
    res.status(video.status);
    res.end();
   });
   
//Update a video
router.put('/:uid',async(req,res)=>{
 let uid_param = req.params.uid;
 let title_param = req.body.title;
 const video = await Video.update({title:title_param},{uid:uid_param}).catch((e)=>{console.log(e);});
 res.status(200).json(JSON.stringify(video));
});

//Delete a video
router.delete('/:uid',async(req,res)=>{
 let uid_param = req.params.uid;
 let args = {
    'method':"DELETE",
    'headers':{
        "X-Auth-Email":config.cloudflare_email,
        "X-Auth-Key":config.cloudflare_stream_key
    }
};   
var videos_del = await fetch(`${base_cloudflare_endpoint}/${uid_param}`,args).catch((e)=>{console.log(e);});
var res = await videos_del.json().catch((e)=>{console.log(e);});

if(videos_del.status == 200){
    await Video.destroy({ where : {uid : uid_param}}).catch((e)=>{console.log(e);});
    res.status(200);
    res.end();
    return;
}
res.status(videos_del.status);
res.end();
});

module.exports = router;