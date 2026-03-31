import { describe, test, expect, vi } from "vitest";
import request from "supertest";

vi.mock("./cloudinaryConfig.js", () => ({
  default: {
    uploader: {
      upload: vi.fn(),
      destroy: vi.fn()
    }
  }
}));

import { app } from "./index.js"; 
import cloudinary from "./cloudinaryConfig.js";


describe("POST /api/uploadImages", () => {
  test("feltölti a képeket és visszaadja az URL-eket", async () => {
    cloudinary.uploader.upload
      .mockResolvedValueOnce({ secure_url: "https://cdn.example.com/img1.jpg", public_id: "recipes/img1" })
      .mockResolvedValueOnce({ secure_url: "https://cdn.example.com/img2.jpg", public_id: "recipes/img2" });

    const res = await request(app).post("/api/uploadImages").send({ images: ["aaa", "bbb"] });

    expect(res.statusCode).toBe(200);
    expect(res.body.serverMsg).toBe("Images uploaded successfully!");
    expect(res.body.images).toEqual([
      { url: "https://cdn.example.com/img1.jpg", public_id: "recipes/img1" },
      { url: "https://cdn.example.com/img2.jpg", public_id: "recipes/img2" }
    ]);
    cloudinary.uploader.upload.mockReset();
  });

  test("400 ha nincs images mező", async () => {
    const res = await request(app).post("/api/uploadImages").send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.serverMsg).toBe("Nincsenek képek a kérésben!");
  });

  test("400 ha images nem tömb", async () => {
    const res = await request(app).post("/api/uploadImages").send({ images: "nem-tomb" });
    expect(res.statusCode).toBe(400);
    expect(res.body.serverMsg).toBe("Nincsenek képek a kérésben!");
  });

  test("500 ha a Cloudinary hibát dob", async () => {
    cloudinary.uploader.upload.mockRejectedValue(new Error("Cloudinary timeout"));
    const res = await request(app).post("/api/uploadImages").send({ images: ["aaa"] });
    expect(res.statusCode).toBe(500);
    expect(res.body.serverMsg).toBe("Upload failed!");
    cloudinary.uploader.upload.mockReset();
  });
});

describe("POST /api/deleteImage", () => {
  test("sikeresen törli a képet", async () => {
    cloudinary.uploader.destroy.mockResolvedValue({ result: "ok" });
    const res = await request(app).post("/api/deleteImage").send({ public_id: "recipes/img1" });
    expect(res.statusCode).toBe(200);
    expect(res.body.serverMsg).toBe("Image delete successful!");
    cloudinary.uploader.destroy.mockReset();
  });

  test("400 ha a kép nem található", async () => {
    cloudinary.uploader.destroy.mockResolvedValue({ result: "not found" });
    const res = await request(app).post("/api/deleteImage").send({ public_id: "recipes/nem-letezik" });
    expect(res.statusCode).toBe(400);
    expect(res.body.serverMsg).toBe("Image not found or already deleted!");
    cloudinary.uploader.destroy.mockReset();
  });

  test("500 ha a Cloudinary hibát dob", async () => {
    cloudinary.uploader.destroy.mockRejectedValue(new Error("Network error"));
    const res = await request(app).post("/api/deleteImage").send({ public_id: "recipes/img1" });
    expect(res.statusCode).toBe(500);
    expect(res.body.serverMsg).toBe("Failed to delete image!");
    cloudinary.uploader.destroy.mockReset();
  });
});