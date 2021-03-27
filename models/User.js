const { Sequelize ,Model,DataTypes} = require('sequelize');
const video = require('../models/Video.js');
const config = require('../config.js');

const sequelize = new Sequelize(config.dbname, config.username, config.password, {
    host: config.host,
    dialect: 'mysql' 
  });

  class User extends Model {}

User.init({
  // Model attributes are defined here
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email:{
      type:DataTypes.STRING,
      allowNull:false
  },
  StreamKey:{
      type:DataTypes.STRING     
  },
  password:{
      type:DataTypes.STRING,
      allowNull: false
  }
}, {
  // Other model options go here
  sequelize, // We need to pass the connection instance
  modelName: 'User' // We need to choose the model name
});

User.hasMany(video,{foreignKey:'author'});

module.exports = User;