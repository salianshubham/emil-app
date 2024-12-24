    const express = require('express');
    const { login, authCallback,getEmails,fetchEmails,fetchFromElasticSearch,readOrUnread,readmail,unReadmail } = require('../controllers/authController');

    const router = express.Router();

    // Define Routes
    router.get('/login', login);
    router.get('/auth/callback', authCallback);
    router.get('/emails', getEmails);

    router.get('/testfetchEmails', fetchEmails);
    router.get('/testfetchFromElasticSearch', fetchFromElasticSearch);
    router.post('/read-or-unread', readOrUnread);
    router.get('/readmail', readmail);
    router.get('/unreadmail', unReadmail);


    module.exports = router;