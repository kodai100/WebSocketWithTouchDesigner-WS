var express = require('express'),
    http = require('http'),
    url = require('url'),
    path = require('path'),
    webSocket = require('ws');

var app = express(),
    server = http.createServer(app),
    wss = new webSocket.Server({ server:server });

// client connections
var connects = []

// --------------------------------------------------------------

app.use(express.static(path.join(__dirname, '/public')));

// Called when success building connection
wss.on('connection', function (ws, req) {
    var location = url.parse(req.url, true);

    var initMessage = {message:"connection"};
    ws.send(JSON.stringify(initMessage));
    connects.push(ws);
    console.log("New Client Connected : " + connects.length);

    // Callback from client message
    ws.on('message', function (message) {
        console.log('received: %s', message);
        broadcast(message);  // Return to client
    });

    ws.on('close', function () {
        console.log('A Client Leave');
        connects = connects.filter(function (conn, i) {
            return (conn === ws) ? false : true;
        });
    });

});

server.listen(8080, function listening() {
    console.log('Listening on %d', server.address().port);
});

// Implement broadcast function because of ws doesn't have it
function broadcast (message) {
    connects.forEach(function (socket, i) {
        socket.send(message);
    });
}
