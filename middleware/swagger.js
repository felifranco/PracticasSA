const swaggerAutogen = require("swagger-autogen")();
require("dotenv").config();

const host = process.env.HOST;
const port = process.env.PORT;

const doc = {
  info: {
    title: "Middleware",
    description: `'Se consumen el microservicio 1 y microservicio 2'`,
  },
  host: `${host}:${port}`,
};

const outputFile = "./swagger.json";
// assuming your routes are located in app.js
const routes = ["./server.js"];
swaggerAutogen(outputFile, routes, doc);
