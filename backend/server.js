// backend/server.js
const dotenv = require('dotenv');
const app = require('./app');

// Load environment variables
dotenv.config();

// Set port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});