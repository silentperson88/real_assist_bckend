const express = require('express');
const routes = express.Router();
const pdfMakerController = require('../controllers/pdfmaker.controller');

routes.get('/pdf', pdfMakerController.exportPdf);

module.exports = routes;
