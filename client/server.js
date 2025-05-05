const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the 'out' directory
app.use(express.static(path.join(__dirname, 'out')));

// API proxy for development
app.use('/api', (req, res) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://iwanyu-store.onrender.com/api';
  res.redirect(`${apiUrl}${req.url}`);
});

// For all other routes, serve the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'out', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
