const r = require('express').Router();
const c = require('../controllers/assistantController');
const { simpleRateLimit } = require('../middleware/rateLimit');

r.post('/chat', simpleRateLimit, c.chat);
r.post('/design', simpleRateLimit, c.design);

module.exports = r;
