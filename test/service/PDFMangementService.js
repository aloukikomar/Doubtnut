'use strict';
require('dotenv').config()

var sendLink = require("../index").sendLink
var clients = {}
var pdfNO=0
var makeHTML = (id) => {
  var html = "<table>"
  if (clients[id].question) {
    console.log(clients[id].question)
    html += "<th>Questions related to '" + clients[id].question + "'</th>"
    clients[id].suggested_question.forEach(element => {
      html += "<tr><td>" + element + "</td></tr>"
    });
    html += "</table>"
    sendLink(process.env.PDF_HOST + "/pdfs/" + id +pdfNO+ ".pdf", id +pdfNO + ".pdf", html,id)
    pdfNO+=1
  }
}

var callmakePDF = (calls, id) => {
  if (id in clients) {
    if (calls === clients[id]['calls']) {
      makeHTML(id)
      //sendLink(calls)
    }
  }
  else {
    console.log("no")
  }
}
/**
 * request a pdf
 * 
 *
 * body GetPDF all keywords
 * returns getPDF
 **/
exports.getPDF = function (body) {
  var calls = 0
  var result = "PDF WILL BE GENERATED"
  body = body.payload
  if ("id" in body) {
    if ("question" in body) {
      if (body.id in clients) {
        calls = clients[body.id]['calls'] + 1
      }

      clients[body.id] = { 'question': body.question, "suggested_question": body.suggested_question, 'time': '1', 'calls': calls }
      setTimeout(() => {
        callmakePDF(calls, body.id)
      }, process.env.TIME_LAPSE);
    }

    else {
      result = "missing field 'question'"
    }
  }
  else {
    result = "missing field 'id'"
  }

  return new Promise(function (resolve, reject) {
    resolve({ "result": result });
  })

}

