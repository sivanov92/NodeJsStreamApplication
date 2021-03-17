const { Sequelize ,Model,DataTypes} = require('sequelize');
const user = require('/User.js');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
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