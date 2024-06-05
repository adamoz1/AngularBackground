const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('myDb.db');

// Endpoint to check if the server is working
app.get('/working', function (req, res) {
    res.json({ "hello": "Manoj" });
});

// Endpoint to handle user registration
app.post('/register', async function (req, res) {
    const { firstName, lastName, uemail, password, address, gender } = req.body;
    try {
        // Insert user details into the database
        db.run(`INSERT INTO user (firstname, lastname, email, password, address, gender) VALUES (?, ?, ?, ?, ?, ?)`,
            [firstName, lastName, uemail, password, address, gender], function (err) {
                if (err) {
                    console.error(err.message);
                    // Handle unique constraint violation (user already exists)
                    if (err.message.includes('UNIQUE constraint failed')) {
                        console.log('User already exists.');
                        return res.status(409).json({ status: 409, message: 'User already exists.' });
                    }
                    return res.status(500).json({ status: 500, message: 'Error registering user.' });
                }
                return res.status(200).json({ status: 200, message: 'User registered successfully!' });
            });
    } catch (err) {
        // Handle any unexpected errors
        console.error(err.message);
        return res.status(500).json({ status: 500, message: 'Error registering user.' });
    }
});

// Endpoint to handle user login
app.post('/login', async function (req, res) {
    const { uemail, password } = req.body;
    console.log(uemail, password);
    try {
        var query = 'SELECT * FROM user WHERE email = ?';
        console.log(query);
        db.get(query, [uemail], async (err, user) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ status: 500, message: 'Error logging in.' });
            }
            // If user is not found
            if (!user) {
                return res.status(401).json({ status: 401, message: 'Invalid email or password.' });
            }
            // Check if the password matches
            if (password !== user.password) {
                return res.status(401).json({ status: 401, message: 'Invalid email or password.' });
            } else {
                // Remove's password from the user details before sending response
                delete user.password;
                return res.status(200).json({ status: 200, message: 'Login successful!', userDetail: user });
            }
        });
    } catch (err) {
        // Handle any unexpected errors
        console.error(err.message);
        return res.status(500).json({ status: 500, message: 'Error logging in.' });
    }
});

// Start the server on port 1112
app.listen(1112, function () {
    console.log(`http://localhost:1112/`);
});
