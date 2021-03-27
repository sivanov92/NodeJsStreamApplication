var express = require('express');
var config = require('../config.js');
const Video = require('../models/Video.js');
var router = express.Router();

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

var base_cloudflare_endpoint = `https://api.cloudflare.com/client/v4/${config.cloudflare_acc_id}/stream`;

//Get all videos
router.get('/videos',(req,res)=>{
const videos = await Video.findAll();
 res.json(JSON.stringify(videos));
});

//Get a specific video
router.get('/videos/:uid',(req,res)=>{
    let uid_param = req.params.uid;
    const videos = await Video.findOne({where : {uid:uid_param}});

    res.json(JSON.stringify(videos));
   });
   
//Post a new video
router.post('/videos',(req,res)=>{
    let body = req.body;

    //change this
    let file_loc = {'file':body.file};

    let args = {
        'method':"POST",
        'body':JSON.stringify(file_loc),
        'headers':{
            "content-type":"application/json",
            "X-Auth-Email":config.cloudflare_email,
            "X-Auth-Key":config.cloudflare_edit_stream_token
        }
    };   
    var videos = await fetch(base_cloudflare_endpoint,args);
    if(videos.status == 200){
        let video_body = {
            'title':body.title,
            'author':body.author,
            'file':videos.playback.hls,
            'uid':videos.uid,
            'thumbnail':videos.thumbnail
        };
        for(key in video_body){
            if(video_body.key == null || video_body.key==''){
                res.status(403).send(`Please fill all fields , ${key} is missing`);
            }
           }    
         const new_video = await Video.create(video_body);
    }
    res.json(JSON.stringify(new_video));
   });
   
//Update a video
router.put('/video/:uid',(req,res)=>{
 let uid_param = req.params.uid;
 let title_param = req.body.title;
 const vid = await Video.update({title:title_param},{uid:uid_param});
 if(vid != null ){
     res.status(200);
 }
 res.status(400);
});

//Delete a video
router.delete('/videos/:uid',(req,res)=>{
 let uid_param = req.params.uid;
 let args = {
    'method':"DELETE",
    'headers':{
        "content-type":"application/json",
        "X-Auth-Email":config.cloudflare_email,
        "X-Auth-Key":config.cloudflare_edit_stream_token
    }
};   
var videos_del = await fetch(`${base_cloudflare_endpoint}/${uid}`,args);
if(videos_del.status == 200){
    await Video.destroy({ where : {uid : uid_param}});
    res.status(200);
}
res.status(400);
});

module.exports = router;