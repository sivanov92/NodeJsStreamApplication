var routing = require('./controllers/Router.js');
process.env.DATABASE_URL = 'mysql://doadmin:t52h3nnoqtlj3bfu@db-mysql-fra1-95766-do-user-8480655-0.b.db.ondigitalocean.com:25060/defaultdb?ssl-mode=REQUIRED';

var config = require('./config');
process.env.HOSTNAME = config.host;
process.env.PORT = config.db_port;
process.env.USERNAME = config.username;
process.env.PASSWORD = config.password;
process.env.DATABASE = config.dbname;

var express = require('express');
var router = express.Router();

router.use('/',routing);

