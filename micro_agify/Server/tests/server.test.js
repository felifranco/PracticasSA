const request = require("supertest");
require("dotenv").config();

const HOST = `${process.env.SERVER}`; //// Name defined in compose.yaml

describe("GET /", () => {
  console.log(`Testing Server -> ${HOST}`);
  test("Should respond with a 200 status code", async () => {
    const response = await request(`${HOST}/?name=peter`).get("/").send();
    expect(response.statusCode).toBe(200);
  });

  test("Should have a respond a 'Content-Type': 'application/json' in header", async () => {
    const response = await request(`${HOST}/?name=peter`).get("/").send();
    expect(response.headers["content-type"]).toEqual(
      expect.stringContaining("jsonsss")
    );
  });
});
