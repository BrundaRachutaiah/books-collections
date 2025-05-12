const { DataTypes, sequelize } = require("../lib/index.js")
const genre = sequelize.define("genre", {
    name: DataTypes.STRING,
    description: DataTypes.TEXT
})

module.exports = { genre }