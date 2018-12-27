const JsonServer = require('./server/charging-station/JsonServer');

// Create Json Server
const jsonServer = new JsonServer();

// Start
jsonServer.start();