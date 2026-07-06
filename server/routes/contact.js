const r = require('express').Router();
const { sendContact } = require('../controllers/miscControllers');
r.post('/', sendContact);
module.exports = r;
