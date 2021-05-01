const { Sequelize ,Model,DataTypes} = require('sequelize');
const user = require('./User');
const config = require('../config.js');

const sequelize = new Sequelize(config.dbname, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',
    port:config.db_port ,
    retry: {
      match: [/Deadlock/i],
      max: 3
  }
  });

  class Video extends Model {}

Video.init({
  // Model attributes are defined here
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull:false
  },
  file:{
    type: DataTypes.STRING,
    allowNull:false 
  },
  uid:{
    type: DataTypes.STRING,
    allowNull:false
  },
  thumbnail:{
    type: DataTypes.STRING
  }
}, {
  // Other model options go here
  sequelize, // We need to pass the connection instance
  modelName: 'Video' // We need to choose the model name
});

const sync = async()=>{
  try{   
   await Video.sync({ alter: true });
  }
  catch(err){
   console.log(err);
  }  
 };
 sync();

module.exports = Video;