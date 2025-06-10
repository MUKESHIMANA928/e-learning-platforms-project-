const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests
  app.use(
    '/api', // This means any request starting with /api (e.g., /api/modules)
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );

  // You might also need to proxy other specific routes that are not '/api'
  // For example, if your /registration or /login routes don't start with /api:
  app.use(
    ['/registration', '/login', '/reset', '/uploads/contentFile-'], // Add other specific backend routes here
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
};