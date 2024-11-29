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
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const token = req.headers['authorization']; // Get the token from the request header

  // Check if the token is provided
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided" });
  }

  // Verify the token
  jwt.verify(token, 'your_secret_key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    // If the token is valid, proceed to add the review
    const { username } = decoded; // Extract username from the decoded token
    // Add the review logic here (not implemented in this example)

    return res.status(200).json({ message: `Review added by ${username}` });
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
