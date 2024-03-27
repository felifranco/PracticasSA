const express = require("express");
require("dotenv").config();
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const host = process.env.HOST;
const port = process.env.PORT;
const microAgify = process.env.MICRO_AGIFY;
const microGenderize = process.env.MICRO_GENDERIZE;

const docs = "/api";
app.use(docs, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Endpoint para obtener datos
app.get("/", async (req, res) => {
  const name = req.query.name;
  if (!name) {
    return res
      .status(400)
      .send(
        `Le hace falta un parámetro, revise la documentación en http://${host}:${port}${docs}/`
      );
  }

  let micro1, micro2;

  await fetch(`${microAgify}/?name=${req.query.name}`)
    .then((response) => response.json())
    .then((data) => {
      micro1 = data;
    });

  await fetch(`${microGenderize}/?name=${req.query.name}`)
    .then((response) => response.json())
    .then((data) => {
      micro2 = data;
    });

  res.setHeader("Content-Type", "application/json");
  res.json({
    agify: micro1,
    genderize: micro2,
  });
});

app.listen(port, host, () => {
  console.log(
    `\nMiddleware Server running at http://${host}:${port}/.\nSee the documentation at http://${host}:${port}${docs}`
  );
});
