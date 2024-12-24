const axios = require('axios');
const { clientId, clientSecret, redirectUri } = require('../config/authConfig');
const { query } = require('express');


const login = (req, res) => {
    const responseType = 'code';
    const scope = 'openid profile email Mail.Read';

    const outlookAuthUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=${responseType}&redirect_uri=${redirectUri}&scope=${scope}`;

    console.log('Redirecting to Outlook login...');
    res.redirect(outlookAuthUrl);
};


// Authentication Callback Handler
const authCallback = async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).json({ message: 'Missing authorization code' });
    }
    console.log("CODE " + code)
    try {
        const tokenResponse = await axios.post(
            'https://login.microsoftonline.com/common/oauth2/v2.0/token',
            new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                code,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const { access_token } = tokenResponse.data;
        console.log('Access Token:', access_token);
        res.cookie('jwt', access_token)
            .redirect("http://localhost:3000/home");
    } catch (error) {
        console.error('Error during token exchange:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Authentication failed' });
    }
};


const getEmails = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1]; // Extract the actual token
    console.log("Extracted Token:", token);

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    console.log("Check")
    try {
        const emailResponse = await axios.get('https://graph.microsoft.com/v1.0/me/messages', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        console.log("test :" + emailResponse.data);
        res.json(emailResponse.data);
    } catch (error) {
        console.error('Error fetching emails:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Failed to fetch emails' });
    }

}

const fetchEmails = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1]; // Extract the actual token

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {

        const emailResponse = await axios.get('https://graph.microsoft.com/v1.0/me/messages', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const emails = emailResponse.data.value;
        console.log("emails : " + emails);
        for (const email of emails) {
            await req.esClient.index({
                index: 'emails',
                id: email.id,
                body: {
                    id: email.id,
                    subject: email.subject,
                    from: email.from.emailAddress.address,
                    bodyPreview: email.bodyPreview,
                    receivedDateTime: email.receivedDateTime,
                    status: "unread"
                },
            });
            console.log("test subject : " + email.subject);
            // await axios.patch(
            //     `https://graph.microsoft.com/v1.0/me/messages/${email.id}`,
            //     { headers: { Authorization: `Bearer ${token}` } }
            // );
        }
        console.log(' emails indexed successfully');
        res.json({ message: ' emails indexed successfully' });

    } catch (error) {
        console.error('Error fetching or indexing emails:', error.message);
        res.status(500).json({ message: 'Failed to fetch emails' });
    }
}



const fetchFromElasticSearch = async (req, res) => {
    try {
        const response = await req.esClient.search({
            index: 'emails',
            body: {
                query: { match_all: {} },
            },
        });
        console.log("Elasticsearch Response:", response);
        if (!response.hits || !response.hits.hits) {
            return res.status(404).json({ message: 'No results found' });
        }

        const results = response.hits.hits.map((hit) => hit._source);
        res.json(results);
    } catch (error) {
        console.error('Error fetching from Elasticsearch:', error.message);
        res.status(500).json({ message: 'Failed to fetch emails' });
    }
}

const readOrUnread = async (req, res) => {
    try {
        const { id, status } = req.body;

        if (!id || typeof status === 'undefined') {
            return res.status(400).json({ message: 'Missing email ID or status' });
        }
        // Update the document in Elasticsearch
        console.log("readOrUnread : " + id)
        const response = await req.esClient.update({
            index: 'emails',
            id: id, // Use the email ID to locate the document
            body: {
                doc: { status: status === 1 ? "read" : "unread" }, // Update the status
            },
        });
        console.log('Updated email status:', response);
        res.json({ message: 'Email status updated successfully', result: response });
    } catch (error) {
        console.error('Error updating email status:', error.message);
        res.status(500).json({ message: 'Failed to update email status' });
    }
}

const readmail = async (req, res) => {
    try {
  
        const response = await req.esClient.search({
            index: 'emails',
            body: {
                query: {
                    match: { status: "read" }
                },
            },
        });
        console.log("Read Mail Response:", response);
        if (!response.hits || !response.hits.hits) {
            return res.status(404).json({ message: 'No results found' });
        }

        const results = response.hits.hits.map((hit) => hit._source);
        res.json(results);
    } catch (error) {
        console.error('Error fetching from Elasticsearch:', error.message);
        res.status(500).json({ message: 'Failed to fetch emails' });
    }
}

const unReadmail = async (req, res) => {
    try {
       
        const response = await req.esClient.search({
            index: 'emails',
            body: {
                query: {
                    match: { status: "unread" }
                },
            },
        });
        console.log("unread Mail Response:", response);
        if (!response.hits || !response.hits.hits) {
            return res.status(404).json({ message: 'No results found' });
        }

        const results = response.hits.hits.map((hit) => hit._source);
        res.json(results);
    } catch (error) {
        console.error('Error fetching from Elasticsearch:', error.message);
        res.status(500).json({ message: 'Failed to fetch emails' });
    }
}

module.exports = { login, authCallback, getEmails, fetchEmails, fetchFromElasticSearch, readOrUnread, readmail, unReadmail };