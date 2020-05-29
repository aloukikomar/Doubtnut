'use strict';

var utils = require('../utils/writer.js');
var PDFMangement = require('../service/PDFMangementService');

module.exports.getPDF = function getPDF (req, res, next) {
  var body = req.swagger.params['body'].value
  PDFMangement.getPDF(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
