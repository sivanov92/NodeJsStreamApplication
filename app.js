var routing = require('./controllers/Router.js');
var express = require('express');
var router = express.Router();
var app = express();

const PORT = process.env.PORT || 5000;

router.use('/',routing);

module.exports = router;

app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
  })