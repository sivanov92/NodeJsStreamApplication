const { Sequelize ,Model,DataTypes} = require('sequelize');
const user = require('User.js');
const config = require('./config.js');

const sequelize = new Sequelize(config.dbname, config.username, config.password, {
    host: config.host,
    dialect: 'mysql' 
  });

  class Video extends Model {}

Video.init({
  // Model attributes are defined here
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  author: {
    type: DataTypes.STRING
    // allowNull defaults to true
  }
}, {
  // Other model options go here
  sequelize, // We need to pass the connection instance
  modelName: 'Video' // We need to choose the model name
});

Video.belongsTo(user);

module.exports = Video;