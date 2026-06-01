import request from "supertest";

import app from "../../../app.js";

import {
  connectDB,
  clearDB,
  closeDB,
} from "../setups/db.js";

import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";

import { BrandFranchiseDetails } from "../../model/Brand/Brand.model/FranchiseDetails.model.js";

import { BrandExpansionLocationData } from "../../model/Brand/Brand.model/ExpansionLocation.model.js";

describe("GET ALL BRANDS AND FILTER API", () => {

  beforeAll(async () => {
    await connectDB();
  });

  afterEach(async () => {
    await clearDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  const createMockBrand = async () => {

    const brand = await BrandDetails.create({
      uuid: "brand-001",

      brandDetails: {
        brandName: "Pizza Hub",
        companyName: "Pizza Company",
        slug: "pizza-hub",
        isBrandPause: false,
        isApproved: true,
      },
    });

    await BrandFranchiseDetails.create({
      brandOwnerId: "brand-001",

      franchiseDetails: {
        brandCategories: {
          main: "Food",
          sub: "Pizza",
          child: "Italian",
        },

        fico: [
          {
            investmentRange: "Rs. 5 Lakhs - 10 Lakhs",
            areaRequired: "200 - 500 Sq. Ft.",
            franchiseModel: "FOFO ",
          },
        ],
      },
    });

    await BrandExpansionLocationData.create({
      brandOwnerId: "brand-001",

      expansionLocationData: {
        expansionLocations: {
          domestic: {
            locations: [
              {
                state: "Tamil Nadu",

                districts: [
                  {
                    district: "Chennai",

                    cities: ["Velachery"],
                  },
                ],
              },
            ],
          },
        },
      },
    });

    return brand;
  };

  test("should fetch all brands", async () => {

    await createMockBrand();

    const res = await request(app)
      .get("/api/v1/filter/getAllBrandsAndFilter");

    expect(res.statusCode).toBe(200);

    expect(res.body.success).toBe(true);

    expect(res.body.data.brands.length).toBeGreaterThan(0);
  });

  test("should filter by main category", async () => {

    await createMockBrand();

    const res = await request(app)
      .get("/api/v1/filter/getAllBrandsAndFilter")
      .query({
        maincat: "Food",
      });

    expect(res.statusCode).toBe(200);

    expect(
      res.body.data.brands[0].brandCategories.main
    ).toBe("Food");
  });

  test("should filter by sub category", async () => {

    await createMockBrand();

    const res = await request(app)
      .get("/api/v1/filter/getAllBrandsAndFilter")
      .query({
        subcat: "Pizza",
      });

    expect(res.statusCode).toBe(200);

    expect(
      res.body.data.brands[0].brandCategories.sub
    ).toBe("Pizza");
  });

  test("should filter by investment range", async () => {

    await createMockBrand();

    const res = await request(app)
      .get("/api/v1/filter/getAllBrandsAndFilter")
      .query({
        investmentRange: "Rs. 5 Lakhs - 10 Lakhs",
      });

    expect(res.statusCode).toBe(200);

    expect(
      res.body.data.brands[0].fico.investmentRange
    ).toBe("Rs. 5 Lakhs - 10 Lakhs");
  });

  test("should filter by state", async () => {

    await createMockBrand();

    const res = await request(app)
      .get("/api/v1/filter/getAllBrandsAndFilter")
      .query({
        state: "Tamil Nadu",
      });

    expect(res.statusCode).toBe(200);

    expect(res.body.success).toBe(true);
  });

  test("should filter by district", async () => {

    await createMockBrand();

    const res = await request(app)
      .get("/api/v1/filter/getAllBrandsAndFilter")
      .query({
        district: "Chennai",
      });

    expect(res.statusCode).toBe(200);

    expect(res.body.success).toBe(true);
  });

  test("should filter by city", async () => {

    await createMockBrand();

    const res = await request(app)
      .get("/api/v1/filter/getAllBrandsAndFilter")
      .query({
        city: "Velachery",
      });

    expect(res.statusCode).toBe(200);

    expect(res.body.success).toBe(true);
  });

  test("should search by brand name", async () => {

    await createMockBrand();

    const res = await request(app)
      .get("/api/v1/filter/getAllBrandsAndFilter")
      .query({
        searchterm: "Pizza",
      });

    expect(res.statusCode).toBe(200);

    expect(
      res.body.data.brands[0].brandname
    ).toContain("Pizza");
  });

  test("should handle pagination", async () => {

    await createMockBrand();

    const res = await request(app)
      .get("/api/v1/filter/getAllBrandsAndFilter")
      .query({
        page: 1,
        limit: 10,
      });

    expect(res.statusCode).toBe(200);

    expect(
      res.body.data.pagination.currentPage
    ).toBe(1);
  });

  test("should return empty when no brands found", async () => {

    const res = await request(app)
      .get("/api/v1/filter/getAllBrandsAndFilter")
      .query({
        maincat: "Unknown",
      });

    expect(res.body.message)
      .toContain("No brands found");
  });

  test("should handle invalid query safely", async () => {

    const res = await request(app)
      .get("/api/v1/filter/getAllBrandsAndFilter")
      .query({
        page: "wrong",
      });

    expect(res.statusCode).toBe(200);
  });

});