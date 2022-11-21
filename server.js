var express = require('express'),
    uniqueNumberGenerator = require('unique-names-generator'),
    http = require('http'),
    url = require('url'),
    path = require('path'),
    webSocket = require('ws');

var app = express(),
    server = http.createServer(app),
    wss = new webSocket.Server({ server: server });

const { uniqueNamesGenerator, colors, animals } = require('unique-names-generator');

// client connections
var connects = []




// --------------------------------------------------------------

app.use(express.static(path.join(__dirname, '/public')));

// Called when success building connection
wss.on('connection', function (ws, req) {
    const location = url.parse(req.url, true);

    var initMessage = { message: "connection"};
    ws.send(JSON.stringify(initMessage));
    connects.push(ws);
    console.log("Total users: ", connects.length);

    // generating unique user name

    const userNumber = uniqueNumberGenerator.NumberDictionary.generate({ min: 100, max: 999 });
    const userName = {user: uniqueNamesGenerator({
        dictionaries: [animals, colors, userNumber],
        length: 3,
        separator: '',
        style: 'capital'
    })};
    ws.send(JSON.stringify(userName));
    connects.push(ws);
    console.log("New Client Connected: ", userName);

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
function broadcast(message) {
    connects.forEach(function (socket, i) {
        socket.send(message);
    });
}