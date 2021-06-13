var nms = require('./media-server.js');
var User = require('../models/User.js');
var express = require('express');
var router = express.Router();
const fetch = require('node-fetch');

nms.run();

const fetch_all_streams_url = "https://stans-stream-backend.herokuapp.com/api/streams";

const fetch_all_streams = async ()=>{
    let response = await fetch(fetch_all_streams_url)
                        .catch((e)=>console.log(e));
    if(response.ok){
        let response_json = await response.json();
        return response_json;                        
    }                    
}

const check_stream_keys = async ()=>{
    var allowed_keys = [];
    await fetch_all_streams().then(
        async (result) =>{
          let live_streams = result.live;  
          for(let key in live_streams){
            let user_key = await User.findOne({ where : {StreamKey : key}}).catch((e)=>{console.log(e)});
            if( user_key !== null){
                allowed_keys.push(key);
            }
          }
        }
    );
    return allowed_keys;
}


router.get('/',async (req,res)=>{
    var response = [];
    const stream_url_prefix = "https://stans-stream-backend.herokuapp.com/live/";
    const stream_url_postfix = "/index.m3u8";

    await check_stream_keys().then((result)=>{
       for(const key of result){
          response.push(stream_url_prefix+key+stream_url_postfix);
       }
    });

    res.status(200).json(response);
});

module.exports = router;