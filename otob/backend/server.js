// Entry untuk serverless (Vercel): export Express app tanpa app.listen()
const app = require('./src/app');

module.exports = app;
