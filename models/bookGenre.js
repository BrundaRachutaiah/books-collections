const { DataTypes, sequelize } = require("../lib/index.js")
const { book } = require("./book.js")
const { genre } = require("./genre.js")
const bookGenre = sequelize.define("bookGenre", {
    bookId: {
        type: DataTypes.INTEGER,
        references: {
            model: book,
            key: "id"
        }
    },
    genreId: {
        type: DataTypes.INTEGER,
        references: {
            model: genre,
            key: "id"
        }
    }
})

book.belongsToMany(genre, {through: bookGenre})
genre.belongsToMany(book, {through: bookGenre})

module.exports = { bookGenre }