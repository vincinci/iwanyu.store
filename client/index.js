// Simple Express server that doesn't rely on Next.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Create a simple HTML page that redirects to the backend
app.get('*', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Iwanyu Store</title>
        <meta http-equiv="refresh" content="0;url=https://iwanyu-store.onrender.com">
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
          }
          .loader {
            border: 5px solid #f3f3f3;
            border-top: 5px solid #3498db;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <h1>Redirecting to Iwanyu Store</h1>
        <div class="loader"></div>
        <p>If you are not redirected automatically, <a href="https://iwanyu-store.onrender.com">click here</a>.</p>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
