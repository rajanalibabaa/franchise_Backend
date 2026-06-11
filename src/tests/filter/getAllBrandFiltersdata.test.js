import request from "supertest";

import app from "../../../app.js";

import {
  connectDB,
  clearDB,
  closeDB,
} from "../setup/db.js";

import { IndustryManagement } from "../../model/Admin/CMS/industryManagement.model.js";

describe("FILTER DATA API", () => {

  beforeAll(async () => {
    await connectDB();
  });

  afterEach(async () => {
    await clearDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  test("should fetch industries", async () => {

    await IndustryManagement.create({
      industry: "Food",

      categories: [
        {
          category: "Pizza",
        },
      ],
    });

    const res = await request(app)
      .get("/api/v1/filter/getAllBrandFiltersdata");

    expect(res.statusCode).toBe(200);

    expect(res.body.data.maincat)
      .toContain("Food");
  });

  test("should fetch subcategories", async () => {

    await IndustryManagement.create({
      industry: "Food",

      categories: [
        {
          category: "Pizza",
        },
        {
          category: "Cafe",
        },
      ],
    });

    const res = await request(app)
      .get("/api/v1/filter/getAllBrandFiltersdata")
      .query({
        main: "Food",
      });

    expect(res.statusCode).toBe(200);

    expect(res.body.data.subcat)
      .toContain("Pizza");
  });

});