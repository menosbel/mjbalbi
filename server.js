const http = require('node:http');

const port = process.env.PORT || 3000;

http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('hola mundo');
  })
  .listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
  });
