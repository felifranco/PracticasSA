const request = require("supertest");
require("dotenv").config();

describe("GET /", () => {
  test("Should respond with a 200 status code", async () => {
    const response = await request(`${process.env.SERVER}/?name=peter`)
      .get("/")
      .send();
    expect(response.statusCode).toBe(200);
  });

  test("Should have a respond a 'Content-Type': 'application/json' in header", async () => {
    const response = await request(`${process.env.SERVER}/?name=peter`)
      .get("/")
      .send();
    expect(response.headers["content-type"]).toEqual(
      expect.stringContaining("json")
    );
  });
});
