const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
  const user = users.find(user => user.username === username);
  return user && user.password === password; // Check if password matches
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const { username, password } = req.body; // Get username and password from the request body

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Validate if the username exists
  if (!isValid(username)) {
    return res.status(401).json({ message: "Invalid username" });
  }

  // Check if the password matches
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid password" });
  }

  // Generate a JWT token if authentication is successful
  const token = jwt.sign({ username }, 'your_secret_key', { expiresIn: '1h' }); // Token expires in 1 hour

  // Send the token in the response
  return res.status(200).json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auths/review/:isbn", (req,res) => {
  
  //Write your code here
 const authHeader = req.headers['authorization'];
 if (!authHeader || !authHeader.startsWith('Bearer ')) {
   return res.status(401).json({ message: 'Invalid token format' });
 }
 const token = authHeader.split(' ')[1];

  console.log(token);
  jwt.verify(token, 'your_secret_key', (err, decoded) => {
    if (err) {
      console.log('JWT Verification Failed:', err); // Log error
      return res.status(403).json({ message: "Invalid token" });
    }

    const { username } = decoded; // Extract username from the decoded token
    const { review } = req.body; // Get review and rating from request body
    const { isbn } = req.params; // Get the ISBN from the URL parameter


    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    book.reviews[username] = {
      review,
      date: new Date().toISOString(), // Store the current date/time
    };

    return res.status(200).json({ message: `Review added by ${username} for book ${book.title}` });
  
  });

});


regd_users.delete("/auths/review/:isbn", (req, res) => {
  // Step 1: Get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Invalid token format' });
  }
  const token = authHeader.split(' ')[1];

  // Step 2: Verify the token
  console.log(token);
  jwt.verify(token, 'your_secret_key', (err, decoded) => {
    if (err) {
      console.log('JWT Verification Failed:', err); // Log error
      return res.status(403).json({ message: "Invalid token" });
    }

    const { username } = decoded; // Extract username from the decoded token
    const { isbn } = req.params; // Get the ISBN from the URL parameter

    // Step 3: Find the book using ISBN
    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Step 4: Check if the user has reviewed this book
    if (!book.reviews[username]) {
      return res.status(404).json({ message: "No review found from this user for the given book" });
    }

    // Step 5: Delete the review
    delete book.reviews[username]; // Remove the review for the given username

    return res.status(200).json({ message: `Review deleted for book ${book.title} by ${username}` });
  });
});




module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
