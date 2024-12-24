const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { Client } = require('@elastic/elasticsearch');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const corsOptions = require('./config/corsOptions')


// Load environment variables from .env file
dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;

// Elasticsearch Client Setup
const esClient = new Client({
    node: process.env.ELASTIC_NODE,
    auth: {
        username: process.env.ELASTIC_USERNAME,
        password: process.env.ELASTIC_PASSWORD,
    },
});
console.log(esClient)
// Middleware
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json()); // Parse incoming JSON requests
// Attach Elasticsearch client to request
app.use((req, res, next) => {
    req.esClient = esClient;
    next();
});

// Routes
app.use(authRoutes);
app.get("/health", async (req, res) => {
    try {
        const status = await req.esClient.ping();  // Replace with your Elasticsearch client
        res.status(200).json({ message: "Elasticsearch is running", status });
    } catch (error) {
        console.error("Elasticsearch connection issue:", error.message);
        res.status(500).json({ message: "Elasticsearch is down", error: error.message });
    }
});
// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

