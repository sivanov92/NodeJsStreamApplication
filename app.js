var routing = require('./controllers/Router.js');
process.env.DATABASE_URL = 'mysql://doadmin:t52h3nnoqtlj3bfu@db-mysql-fra1-95766-do-user-8480655-0.b.db.ondigitalocean.com:25060/defaultdb?ssl-mode=REQUIRED';

var express = require('express');
var router = express.Router();

router.use('/',routing);

