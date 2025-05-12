const express = require("express")
const cors = require("cors")
const { sequelize } = require("./lib/index.js")
const { author } = require("./models/author.js")
const { book } = require("./models/book.js")
const { genre } = require("./models/genre.js")
const { bookGenre } = require("./models/bookGenre.js")
const app = express()
const PORT = 3000
app.use(express.json())
app.use(cors())

const authorsData = [
    { name: 'J.K. Rowling', birthdate: '1965-07-31', email: 'jkrowling@books.com' },
    { name: 'George R.R. Martin', birthdate: '1948-09-20', email: 'grrmartin@books.com' }
];

const genresData = [
    { name: 'Fantasy', description: 'Magical and mythical stories.' },
    { name: 'Drama', description: 'Fiction with realistic characters and events.' }
];
  
const booksData = [
    { title: 'Harry Potter and the Philosopher\'s Stone', description: 'A young wizard\'s journey begins.', publicationYear: 1997, authorId: 1 },
    { title: 'Game of Thrones', description: 'A medieval fantasy saga.', publicationYear: 1996, authorId: 2 }
];

app.get("/seed_db", async (req,res) => {
    try {
        await sequelize.sync({force: true})
        await author.bulkCreate(authorsData)
        await genre.bulkCreate(genresData)
        await book.bulkCreate(booksData)
        res.status(200).json({message: "Data seed successfull."})
    } catch (error) {
        res.status(500).json({message: "Error while seeding the data", error: error.message})
    }
})

async function assignGenreIdAndBookId(bookId, genreId) {
    let result = await bookGenre.create({
        bookId: bookId,
        genreId: genreId
    })
    return result
}

app.get("/genre-assign-set/:bookId/:genreId", async (req,res) => {
    try {
        const bookId = parseInt(req.params.bookId)
        if(!bookId || typeof bookId !== "number"){
            return res.status(400).json({message: "BookId is require and should be number."})
        }
        const genreId = parseInt(req.params.genreId)
        if(!genreId || typeof genreId !== "number"){
            return res.status(400).json({message: "genreid is require and should be number."})
        }
        const result = await assignGenreIdAndBookId(bookId, genreId)
        res.status(200).json({message: "assigned successfully.", bookGenres: result})
    } catch (error) {
        res.status(500).json({message: "error while assigning.", error: error.message})
    }
})

app.post("/assign-genres", async (req, res) => {
    try {
        const { bookId, genreIds } = req.body;
        const foundBook = await book.findByPk(bookId);
        const foundGenres = await genre.findAll({
            where: {
                id: genreIds
            }
        });
        if (!foundBook || foundGenres.length === 0) {
            return res.status(404).json({ message: "Book or genres not found." });
        }
        await foundBook.setGenres(foundGenres); 
        res.status(200).json({ message: "Genres assigned to book successfully."});
    } catch (error) {
        res.status(500).json({ message: "Error assigning genres", error: error.message });
    }
});

async function getAllBooks() {
    let result = await book.findAll()
    return {books: result}
}

app.get("/books", async (req,res) => {
    try {
        const result = await getAllBooks()
        if(result.books.length === 0){
            res.status(400).json({message: "No book found."})
        }
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({message: "errro while fetching all books", error: error.message})
    }
})

async function fetchBookByAuthor(authorId) {
    let result = await book.findAll({where: {authorId: authorId}})
    return {books: result}
}

app.get("/authors/:authorId/books", async (req,res) => {
    try {
        let authorId = parseInt(req.params.authorId)
        let result = await fetchBookByAuthor(authorId)
        if(result.books.length === 0){
            res.status(400).json({message: "No book of this author found."})
        }
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({message: "error while fetching book.", error:error.message})
    }
})

async function getBooksByGenre(genreId){
    let genreBookFound = await bookGenre.findAll({where: {genreId: genreId}})
    let books = []
    for (let i=0; i<genreBookFound.length; i++){
        let booksFound = await book.findOne({where: {id: genreBookFound[i].bookId}})
        books.push(booksFound)
    }
    return {books: books}
}

app.get("/genres/:genreId/books", async (req,res) => {
    try {
        let genreId = parseInt(req.params.genreId)
        if(!genreId || typeof genreId !== "number"){
            return res.status(400).json({message: "genreid is require and should be number."})
        }
        let result = await getBooksByGenre(genreId)
        if(result.books.result === 0){
            res.status(404).json({message: "No book found of this genre."})
        } 
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({message: "error while fetching the books.", error:error.message})
    }
})

async function addNewBook(newBook) {
    let result = await book.create(newBook)
    let authorDetails = await author.findOne({where: {id: result.authorId}})
    return {books: {
        ...result.dataValues,
        author: {
            ...authorDetails.dataValues
        }
    }}
}

app.post("/addBook", async (req,res) => {
    try {
        let newBook = req.body.newBook
        let result = await addNewBook(newBook)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({message: "error while adding a new book."})
    }
})

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})
