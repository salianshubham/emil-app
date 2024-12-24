const dotenv = require('dotenv');

// Load environment variables
dotenv.config();
module.exports = {
    clientId: process.env.CLIENT_ID, // Replace with your Client ID
    clientSecret: process.env.CLIENT_SECRET, // Replace with your Client Secret
    redirectUri: process.env.REDIRECT_URI, // Redirect URI must match the registered one
};