const r = require('express').Router();
const { subscribe } = require('../controllers/miscControllers');
r.post('/', subscribe);
module.exports = r;
