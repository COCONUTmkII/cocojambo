const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8081 }, () => {
  console.log("Signalling server is now listening on port 8081");
});

wss.broadcast = (ws, data) => {
  wss.clients.forEach((client) => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

wss.on('connection', ws => {
  console.log(`Client connected. Total connected clients: ${wss.clients.size}`);

  ws.on('message', message => {
    let msg = JSON.parse(message);
    let s = JSON.stringify(msg);
    console.log(s + "\n\n");
    wss.broadcast(ws, s);
  });
  ws.on('close', ws=> {
    console.log(`Client disconnected. Total connected clients: ${wss.clients.size}`);
  })

  ws.on('error', error => {
    console.log(`Client error. Total connected clients: ${wss.clients.size}`);
  });
});
