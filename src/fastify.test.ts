import Fastify from "fastify";

import { Verifiers as V } from "./index";
import {
  hasStructureVerifierValidationErrors,
  serializerCompiler,
  StructureVerifierTypeProvider,
  validatorCompiler,
} from "./fastify";

const userVerifier = V.ObjectNotNull({
  name: V.StringNotNull({ minLength: 2 }).trim(),
  age: V.Number({ min: 0 }),
  tags: V.ArrayNotNull(V.StringNotNull({ strictMode: true }), {
    minLength: 1,
  }),
});

function buildApp() {
  const app = Fastify().withTypeProvider<StructureVerifierTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  return app;
}

describe("fastify adapter", () => {
  it("validates and coerces the body, with typed handler payload", async () => {
    const app = buildApp();

    app.post("/users", { schema: { body: userVerifier } }, async (req) => {
      const name: string = req.body.name;
      const age: number | null = req.body.age;
      return { name, age, tags: req.body.tags };
    });

    const res = await app.inject({
      method: "POST",
      url: "/users",
      payload: { name: "  Ana  ", age: "31", tags: ["admin"] },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ name: "Ana", age: 31, tags: ["admin"] });
  });

  it("responds 400 with FST_ERR_VALIDATION on invalid body", async () => {
    const app = buildApp();

    app.post("/users", { schema: { body: userVerifier } }, async () => ({}));

    const res = await app.inject({
      method: "POST",
      url: "/users",
      payload: { name: "A", age: -1, tags: [] },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().code).toBe("FST_ERR_VALIDATION");
  });

  it("exposes ajv-like validation items usable from an error handler", async () => {
    const app = buildApp();

    app.setErrorHandler((err, _req, reply) => {
      if (hasStructureVerifierValidationErrors(err)) {
        return reply
          .status(400)
          .send({ part: err.validationContext, errors: err.validation });
      }
      reply.send(err);
    });

    app.post("/users", { schema: { body: userVerifier } }, async () => ({}));

    const res = await app.inject({
      method: "POST",
      url: "/users",
      payload: { name: "Ana", tags: ["ok", 5] },
    });

    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.part).toBe("body");
    expect(body.errors).toEqual([
      expect.objectContaining({
        instancePath: "/tags/1",
        message: expect.any(String),
      }),
    ]);
  });

  it("validates and coerces the querystring", async () => {
    const app = buildApp();

    app.get(
      "/search",
      {
        schema: {
          querystring: V.ObjectNotNull({
            page: V.NumberNotNull({ min: 1 }),
            q: V.String(),
          }),
        },
      },
      async (req) => ({ page: req.query.page, q: req.query.q }),
    );

    const ok = await app.inject({ method: "GET", url: "/search?page=2" });
    expect(ok.statusCode).toBe(200);
    expect(ok.json()).toEqual({ page: 2, q: null });

    const bad = await app.inject({ method: "GET", url: "/search?page=0" });
    expect(bad.statusCode).toBe(400);
  });

  it("serializes responses through the verifier when schema.response is set", async () => {
    const app = buildApp();

    app.get(
      "/me",
      {
        schema: {
          response: {
            200: V.ObjectNotNull(
              { name: V.StringNotNull().trim() },
              { strictMode: true },
            ),
          },
        },
      },
      async () => ({ name: "  Ana  " }),
    );

    const res = await app.inject({ method: "GET", url: "/me" });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ name: "Ana" });
  });

  it("falls back to JSON.stringify for non-verifier response schemas", async () => {
    const app = buildApp();

    app.get(
      "/raw",
      { schema: { response: { 200: { type: "object" } } } },
      async () => ({ ok: true }),
    );

    const res = await app.inject({ method: "GET", url: "/raw" });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true });
  });
});
