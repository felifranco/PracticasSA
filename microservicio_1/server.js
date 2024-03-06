const express = require("express");
require('dotenv').config()
const app = express();
const host = process.env.HOST;
const port = process.env.PORT;

// Endpoint para obtener datos
app.get("/", (req, res) => {
  fetch("https://api.agify.io/?name=" + req.query.name)
    .then((response) => response.json())
    .then((data) => {
      res.send(data);
    });
});

app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});
