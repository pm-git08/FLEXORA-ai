// controllers/authController.js
const pool = require('../config/db'); // Import the database connection pool
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const generateToken = require('../utils/generateToken'); // Import JWT generator

const saltRounds = 10; // Cost factor for bcrypt hashing

// --- User Login ---
exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  try {
    // Find user by email, ensuring password_hash column exists and is selected
    const findUserQuery = "SELECT id, name, email, username, password_hash, role FROM users WHERE email = ?";
    const [results] = await pool.query(findUserQuery, [email]);

    if (results.length === 0) {
      console.log(`Login attempt failed: User not found for email ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' }); // Generic message for security
    }

    const user = results[0];

    // Compare submitted password with stored hash
    if (!user.password_hash) {
        console.error(`Login attempt failed: User ${email} has no password hash stored.`);
        return res.status(500).json({ message: 'Server configuration error.' });
    }
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      console.log(`Login attempt failed: Incorrect password for email ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' }); // Generic message
    }

    // Generate JWT upon successful password match
    const token = generateToken(user.id);

    // Send successful response (exclude password hash)
    console.log(`User logged in successfully: ${email} (ID: ${user.id})`);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Login controller error:", err);
    res.status(500).json({ message: 'Server error during login.' });
  }
};


// --- User Registration / Signup ---
exports.registerUser = async (req, res, next) => {
  const { fullname, email, username, password } = req.body;

  if (!fullname || !email || !username || !password) {
    return res.status(400).json({ message: 'Please provide fullname, email, username, and password.' });
  }
  // Consider adding more specific validation (e.g., password length)

  try {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the new user (map fullname to name column, use username, store hashedPassword)
    // Assumes DB table has: name, email, username, password_hash columns
    const insertQuery = "INSERT INTO users (name, email, username, password_hash) VALUES (?, ?, ?, ?)";
    const [result] = await pool.query(insertQuery, [fullname, email, username, hashedPassword]);

    // Send successful response (do NOT send password hash back)
    console.log(`User registered successfully: ${email} (ID: ${result.insertId})`);
    res.status(201).json({
      message: 'User registered successfully! Please login.', // Inform user to login
      user: {
        id: result.insertId,
        name: fullname,
        email: email,
        username: username
        // Do not include token here; require login after registration
      }
    });

  } catch (err) {
    console.error("DATABASE SIGNUP ERROR:", err); // Log the specific DB error

    // Handle specific errors like duplicate entries
    if (err.code === 'ER_DUP_ENTRY') {
        let dupField = 'Email or username';
        if (err.message.includes('email')) dupField = 'Email';
        if (err.message.includes('username')) dupField = 'Username';
         return res.status(400).json({ message: `${dupField} already exists.` });
    }
    // Handle other potential errors
    res.status(500).json({ message: 'Server error during registration.' });
  }
};
