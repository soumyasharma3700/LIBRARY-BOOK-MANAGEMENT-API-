
const express = require("express");

const app = express();
const PORT = 3000;


app.use(express.json());


app.get("/", (req, res) => {
    res.send("Student Management API is running. Visit /api/books");
});


let books = [
    {
        id: 101,
        title: "Wings of Fire",
        author: "A.P.J. Abdul Kalam",
        genre: "Autobiography",
        publishedYear: 1999,
        available: true
    },
    {
        id: 102,
        title: "The Alchemist",
        author: "Paulo Coelho",
        genre: "Fiction",
        publishedYear: 1988,
        available: true
    },
    {
        id: 103,
        title: "Harry Potter",
        author: "J.K. Rowling",
        genre: "Fantasy",
        publishedYear: 1997,
        available: false
    }
];

let nextId = Math.max(...books.map(book => book.id)) + 1;



function validateBook(data) {

    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return "Request body must be a JSON object";
    }

    const { title, author, genre, publishedYear, available } = data;

    if (typeof title !== "string" || !title.trim()) {
        return "Valid title is required";
    }

    if (typeof author !== "string" || !author.trim()) {
        return "Valid author is required";
    }

    if (typeof genre !== "string" || !genre.trim()) {
        return "Valid genre is required";
    }

    if (!Number.isInteger(publishedYear) || publishedYear < 0) {
        return "Published year must be a valid non-negative integer";
    }

    if (typeof available !== "boolean") {
        return "Available must be true or false";
    }

    return null;
}



function getValidId(idParam) {

    if (!/^\d+$/.test(idParam)) {
        return null;
    }

    const id = Number(idParam);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return null;
    }

    return id;
}



app.get("/api/books", (req, res) => {

    res.status(200).json(books);

});



app.post("/api/books", (req, res) => {

    const error = validateBook(req.body);

    if (error) {
        return res.status(400).json({
            message: error
        });
    }

    const newBook = {
        id: nextId++,
        title: req.body.title.trim(),
        author: req.body.author.trim(),
        genre: req.body.genre.trim(),
        publishedYear: req.body.publishedYear,
        available: req.body.available
    };

    books.push(newBook);

    res.status(201).json(newBook);

});

app.get("/api/books/filter", (req, res) => {

    const author = req.query.author;

    if (typeof author !== "string" || !author.trim()) {
        return res.status(400).json({
            message: "Author query parameter is required"
        });
    }

    const filteredBooks = books.filter((book) =>
        book.author.toLowerCase() === author.trim().toLowerCase()
    );

    res.status(200).json(filteredBooks);

});


app.get("/api/books/:id", (req, res) => {

    const id = getValidId(req.params.id);

    if (id === null) {
        return res.status(400).json({
            message: "Invalid book ID"
        });
    }

    const book = books.find((b) => b.id === id);

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    res.status(200).json(book);

});


app.put("/api/books/:id", (req, res) => {

    const id = getValidId(req.params.id);

    if (id === null) {
        return res.status(400).json({
            message: "Invalid book ID"
        });
    }

    const index = books.findIndex((b) => b.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const error = validateBook(req.body);

    if (error) {
        return res.status(400).json({
            message: error
        });
    }

    const updatedBook = {
        id: id,
        title: req.body.title.trim(),
        author: req.body.author.trim(),
        genre: req.body.genre.trim(),
        publishedYear: req.body.publishedYear,
        available: req.body.available
    };

    books[index] = updatedBook;

    res.status(200).json(updatedBook);

});



app.delete("/api/books/:id", (req, res) => {

    const id = getValidId(req.params.id);

    if (id === null) {
        return res.status(400).json({
            message: "Invalid book ID"
        });
    }

    const index = books.findIndex((b) => b.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    books.splice(index, 1);

    res.status(200).json({
        message: "Book deleted successfully"
    });

});


app.use((err, req, res, next) => {

    if (err.type === "entity.parse.failed") {
        return res.status(400).json({
            message: "Invalid JSON format"
        });
    }

    console.error(err);

    res.status(500).json({
        message: "Internal Server Error"
    });

});


app.listen(PORT, () => {

    console.log(`Server running at http://localhost:${PORT}`);

});
