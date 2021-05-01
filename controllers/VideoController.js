var express = require('express');
var config = require('../config.js');
const Video = require('../models/Video.js');
const User = require('../models/User.js');
const fileUpload = require('express-fileupload');
var app = express();

app.use(fileUpload());
var router = express.Router();

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

var base_cloudflare_endpoint = `https://api.cloudflare.com/client/v4/${config.cloudflare_acc_id}/stream`;

//Get all videos
router.get('/:uid?', async(req,res)=>{
    let uid_param = req.params.uid;
    if( uid == null){
        const videos = await Video.findAll().catch(e=>{console.log(e);});
        res.status(200).json(JSON.stringify(videos));
        return;
    }
    const videos = await Video.findOne({where : {uid:uid_param}})
    .catch(e => {console.log(e);});
    res.status(200).json(JSON.stringify(videos()));
});

//Get all videos FOR A SPECIFIC AUTHOR
router.get('/author/:authorID',async (req,res)=>{
    let authorID = req.params.authorID;
    if(authorID == null){
        const videos = await Video.findAll();
        res.status(200).json(JSON.stringify(videos));
        return;
    }
    const author = User.findOne({where : {id:authorID}});
     res.json(JSON.stringify(author.getVideos()));
    });
   
//Post a new video
router.post('/',async (req,res)=>{
    let body = req.body;

    if(!req.files.video){
        return res.status(400).send('No files named /"video/" were uploaded.');
        return;
    }
    let file_loc = {'file':req.files.video};

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
         var video_author =   await User.findOne({where : {email : body.author}});
         const new_video =  await Video.create(video_body);
         await video_author.addVideo(new_video);
         res.status(201).json(JSON.stringify(new_video));
        return;
    }
    res.status(400);
   });
   
//Update a video
router.put('/:uid',async(req,res)=>{
 let uid_param = req.params.uid;
 let title_param = req.body.title;
 const vid = await Video.update({title:title_param},{uid:uid_param});
 if(vid != null ){
     res.status(200);
     return;
 }
 res.status(400);
});

//Delete a video
router.delete('/:uid',async(req,res)=>{
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
    return;
}
res.status(400);
});

module.exports = router;