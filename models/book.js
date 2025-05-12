const { DataTypes, sequelize } = require("../lib/index.js")
const book = sequelize.define("book", {
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    publicationYear: DataTypes.INTEGER,
    authorId: DataTypes.INTEGER
}) 

book.associate = (models) => {
    book.belongsTo(models.author, {foreignKey: "authorId"})
}

module.exports = { book }