const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
// In app.js

// ... other middleware like cors, express.json ...

app.use('/api/auth', authRoutes);

// Add a simple handler for GET requests to the root path
app.get('/', (req, res) => {
  res.send('Flexora API is running!'); // Send a simple text response
});

// ... app.listen() ...
