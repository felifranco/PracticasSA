const express = require("express");
require("dotenv").config();
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const host = process.env.HOST;
const port = process.env.PORT;

const docs = "/api";
app.use(docs, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Endpoint para obtener datos
app.get("/", (req, res) => {
  if (!req.query.name) {
    return res
      .status(400)
      .send(
        `Le hace falta un parámetro, revise la documentación en http://${host}:${port}${docs}/`
      );
  }

  fetch("https://api.agify.io/?name=" + req.query.name)
    .then((response) => response.json())
    .then((data) => {
      res.setHeader("Content-Type", "application/json");
      res.json(data);
    });
});

app.listen(port, host, () => {
  console.log(
    `\nAgify Server running at http://${host}:${port}/.\nSee the documentation at http://${host}:${port}${docs}`
  );
});
