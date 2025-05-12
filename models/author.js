const {DataTypes, sequelize} = require("../lib/index.js")
const author = sequelize.define("author", {
    name: DataTypes.STRING,
    birthdate: DataTypes.DATE,
    email: DataTypes.STRING
})

author.associate = (models) => {
    author.hasMany(models.book, {foreignKey: "authorId"})
}

module.exports = { author }