var routing = require('./controllers/Router.js');
var express = require('express');
var router = express.Router();
var app = express();
const PORT = process.env.PORT || 5000;

app.use('/',routing);


app.get('/',(req,res)=>{
  res.status(200).send('Welcome this is the home page for the stream app ');
});

module.exports = router;

app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
  })