const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 8080;
const root = __dirname;

const mime = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0];
  if (p === '/') p = '/index.html';
  const filePath = path.join(root, p);

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      const dirPath = path.join(root, p);
      const indexPath = path.join(dirPath, 'index.html');
      return fs.stat(indexPath, (e2, s2) => {
        if (e2 || !s2 || !s2.isFile()) {
          res.statusCode = 404;
          res.end('Not Found');
          return;
        }
        serve(indexPath, res);
      });
    }
    serve(filePath, res);
  });
});

function serve(filePath, res) {
  const ext = path.extname(filePath);
  const type = mime[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', type);
  fs.createReadStream(filePath).pipe(res);
}

server.listen(port, () => {
  console.log('Serving at http://localhost:' + port + '/');
  console.log('Press Ctrl+C to stop.');
});
