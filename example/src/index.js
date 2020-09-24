/**
 * Create NodeJS HTTP Server Application.
 */

/** Import generics dependences */
import path from 'path';
import http from 'http';
import pino from 'pino';
import File from './tools/file.js';

// Set pino for get pretty logs.
const logger = pino({
  prettyPrint: { colorize: true }
})

// Set host and port.
const hostname = '127.0.0.1';
const port = 3000;

// Define path of html static file.
const staticHtmlFile = `${path.resolve()}/src/statics/index.html`;

// Define http server for return error and static file.
const server = http.createServer(async (req, res) => {
  try {
    /* 
     * Log to show method and url of request.
     * This log will be show into the terminal via demon.
     */
    logger.info(`METHOD: ${req.method} URL: ${req.url}`);
    // Get method and url for show the static file or 404 status.
    if(req.method === 'GET' && req.url === '/'){
      const data = await File.readFile(staticHtmlFile);
      res.setHeader('Content-Type', 'text/html');
      res.statusCode = 200;
      res.end(data);
    } else {
      res.setHeader('Content-Type', 'text/plain');
      res.statusCode = 404;
      res.end('HTTP ERROR 404 | Page not found');
    }
  } catch (err) {
    logger.error(err);
    res.setHeader('Content-Type', 'text/plain');
    res.statusCode = 500;
    res.end(err.message);
  }
});

// Set listen with host and port.
server.listen(port, hostname, () => {
  logger.info(`The server is running on http://${hostname}:${port}/`);
});