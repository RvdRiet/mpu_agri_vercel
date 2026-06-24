const http = require('http');
const fs = require('fs');
const path = require('path');
const { handleApiRequest } = require('./api/_routes/router');

const port = 3050;
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
  '.csv': 'text/csv',
};

const server = http.createServer(async (req, res) => {
  const urlPath = (req.url || '/').split('?')[0];
  if (urlPath.startsWith('/api/')) {
    try {
      await handleApiRequest(req, res);
    } catch (err) {
      console.error('API error', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
    return;
  }

  let p = urlPath;
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
  console.log('Analytics API at http://localhost:' + port + '/api/analytics/');
  console.log('Press Ctrl+C to stop.');
});
