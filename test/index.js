'use strict';
require('dotenv').config()
var cors = require('cors');



var pdf = require('html-pdf');
var options = { format: 'Letter' };
var express =require('express')
var fs = require('fs'),
    path = require('path'),
    http = require('http');
const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: process.env.LIVE_SERVER_PORT })
var app = require('connect')();
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var serverPort = process.env.SERVER_PORT;


app.use(cors()) 
// swaggerRouter configuration
var options = {
  swaggerUi: path.join(__dirname, '/swagger.json'),
  controllers: path.join(__dirname, './controllers'),
  useStubs: process.env.NODE_ENV === 'development' // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync(path.join(__dirname,'api/swagger.yaml'), 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {

  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());

  // Validate Swagger requests
  app.use(middleware.swaggerValidator());

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(options));

  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi());
  app.use('/pdfs',express.static(__dirname+"/pdfs"))
 
  
// Start the server
  http.createServer(app).listen(serverPort, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
  });

});

console.log("sever started at port:",process.env.LIVE_SERVER_PORT)
exports.sendLink = function(link,fileName,html,clientID) {
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          pdf.create(html, options).toFile('./pdfs/'+fileName, function(err, res) {
            if (err) return console.log(err);
            console.log(res); // { filename: '/app/businesscard.pdf' }
          });
          if (client.id==clientID){
          client.send('{"link":"'+link+'"}');
          }
        }
      });
}
wss.on('connection', function connection(ws,req) {
  var url = req.url;
  console.log(url.split("?")[1])
  ws.id =url.split("?")[1]
});