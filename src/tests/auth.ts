import { assert } from "chai";
import request from "supertest";
import { app } from "../app";
import { User } from "../models/User";

const email = "carlo@gmail.com";
const password = "A12c!34@D567!!";

describe("status", () => {
  it("server is running", async () => {
    const { status, body } = await request(app).get("/status");
    assert.equal(status, 200);
    assert.equal("message" in body, true);
    assert.equal(body.message, "Server is running");
  });
});

describe("signup/validate/login/me", () => {
  after("delete user after test", async () => {
    await User.findOneAndDelete({ email });
  });
  it("auth process", async () => {
    const { status: status1 } = await request(app)
      .post("/auth/signup")
      .send({ email, password });
    assert.equal(status1, 201);
    const user = await User.findOne({ email });
    const { status: status2 } = await request(app).get(
      `/auth/validate/${user!.validateEmailToken}`
    );
    assert.equal(status2, 200);

    const { status: status3, body: body1 } = await request(app)
      .post("/auth/login")
      .send({ email, password });
    assert.equal(status3, 200);
    assert.equal("accessToken" in body1, true);
    const accessToken = body1.accessToken;

    const { status: status4, body: body2 } = await request(app)
      .get("/auth/me")
      .set("authorization", `Bearer ${accessToken}`);
    assert.equal(status4, 200);
    assert.equal("_id" in body2, true);
    assert.equal(body2.email, email);
  });
});

describe("signup/user already present", () => {
  before("create an user", async () => {
    await User.create({ email, password, emailIsActive: true });
  });
  after("delete user after test", async () => {
    await User.findOneAndDelete({ email });
  });
  it("try to register with already present email", async () => {
    const { status } = await request(app)
      .post("/auth/signup")
      .send({ email, password });
    assert.equal(status, 409);
  });
});

describe("Auth Tests", () => {
  after("delete user after test", async () => {
    try {
      await User.findOneAndDelete({ email });
    } catch (err) {
      console.error("Errore nella cancellazione dell'utente:", err);
    }
  });

  it("auth process", async () => {
    const { status: status1 } = await request(app)
      .post("/auth/signup")
      .send({ email, password });
    assert.equal(status1, 201);

    const user = await User.findOne({ email });
    assert.exists(user!.validateEmailToken, "Validation token should exist");

    const { status: status2 } = await request(app).get(
      `/auth/validate/${user!.validateEmailToken}`
    );
    assert.equal(status2, 200);

    const { status: status3, body: body1 } = await request(app)
      .post("/auth/login")
      .send({ email, password });
    assert.equal(status3, 200);
    assert.exists(body1.accessToken, "Access token should exist");
    const accessToken = body1.accessToken;

    const { status: status4, body: body2 } = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);
    assert.equal(status4, 200);
    assert.exists(body2._id in body2, "User ID should exist");
    assert.equal(body2.email, email);
  });

  it("should return 401 when accessToken is invalid", async () => {
    const { status, body } = await request(app)
      .get("/auth/me")
      .set("Authorization", "InvalidToken123"); // Token errato

    assert.equal(status, 401);
  });

  it("should return 400 when email format is invalid", async () => {
    const { status, body } = await request(app)
      .post("/auth/signup")
      .send({ email: "pippo@com", password });

    assert.equal(status, 400);
  });
});
