import { Verifiers as V } from "../../index";
import { VerifierConfig } from "../config/verifierConfig";
import { VerificationError } from "../error/v_error";

describe("Verifier.refine (base)", () => {
  beforeEach(() => {
    VerifierConfig.lang = "es";
  });

  it("pasa cuando el predicado devuelve true", () => {
    const verifier = V.StringNotNull().refine(
      (v) => v.startsWith("SK-"),
      "debe iniciar con SK-",
    );
    expect(verifier.check("SK-123")).toBe("SK-123");
  });

  it("falla cuando el predicado devuelve false con mensaje string", () => {
    const verifier = V.StringNotNull().refine(
      (v) => v.startsWith("SK-"),
      "debe iniciar con SK-",
    );
    expect(() => verifier.check("ABC")).toThrow(VerificationError);
    try {
      verifier.check("ABC");
    } catch (err: any) {
      expect(err.errorsObj[0].message).toBe("debe iniciar con SK-");
      expect(err.errorsObj[0].key).toBe("");
    }
  });

  it("soporta mensaje i18n", () => {
    const verifier = V.NumberNotNull().refine((n) => n % 2 === 0, {
      es: () => "debe ser par",
      en: () => "must be even",
    });
    VerifierConfig.lang = "en";
    try {
      verifier.check(3);
    } catch (err: any) {
      expect(err.errorsObj[0].message).toBe("must be even");
    }
    VerifierConfig.lang = "es";
    try {
      verifier.check(3);
    } catch (err: any) {
      expect(err.errorsObj[0].message).toBe("debe ser par");
    }
  });

  it("usa mensaje por defecto cuando no se pasa", () => {
    const verifier = V.NumberNotNull().refine((n) => n > 0);
    try {
      verifier.check(-1);
    } catch (err: any) {
      expect(err.errorsObj[0].message).toBe("valor inválido");
    }
  });

  it("aplica key cuando se proporciona como tercer argumento", () => {
    const verifier = V.StringNotNull().refine(
      (v) => v.length >= 3,
      "muy corto",
      "username",
    );
    try {
      verifier.check("ab");
    } catch (err: any) {
      expect(err.errorsObj[0].key).toBe("username");
      expect(err.errorsObj[0].message).toBe("muy corto");
    }
  });

  it("no ejecuta el predicado si la verificación base falla", () => {
    const spy = jest.fn(() => true);
    const verifier = V.NumberNotNull({ min: 10 }).refine(spy, "nope");
    expect(() => verifier.check(5)).toThrow(VerificationError);
    expect(spy).not.toHaveBeenCalled();
  });

  it("permite encadenar varios refine", () => {
    const verifier = V.NumberNotNull()
      .refine((n) => n > 0, "debe ser positivo")
      .refine((n) => n < 100, "debe ser menor a 100");

    expect(verifier.check(50)).toBe(50);
    expect(() => verifier.check(-1)).toThrow("debe ser positivo");
    expect(() => verifier.check(150)).toThrow("debe ser menor a 100");
  });

  it("funciona combinado con transform", () => {
    const verifier = V.StringNotNull()
      .refine((v) => v.length >= 3, "muy corto")
      .transform((v) => v.toUpperCase());

    expect(verifier.check("abc")).toBe("ABC");
    expect(() => verifier.check("a")).toThrow("muy corto");
  });
});

describe("VObject.refine (tipado con keys)", () => {
  beforeEach(() => {
    VerifierConfig.lang = "es";
  });

  it("aplica regla cruzada entre propiedades", () => {
    const verifier = V.ObjectNotNull({
      name: V.StringNotNull(),
      lastname: V.StringNotNull(),
    }).refine(
      (v) => !(v.name === "admin" && v.lastname === "admin"),
      "usuario reservado",
    );

    expect(() =>
      verifier.check({ name: "admin", lastname: "admin" }),
    ).toThrow(VerificationError);

    const ok = verifier.check({ name: "juan", lastname: "perez" });
    expect(ok).toEqual({ name: "juan", lastname: "perez" });
  });

  it("marca múltiples keys en el error", () => {
    const verifier = V.ObjectNotNull({
      name: V.StringNotNull(),
      lastname: V.StringNotNull(),
    }).refine(
      (v) => !(v.name === "admin" && v.lastname === "admin"),
      "combinación reservada",
      ["name", "lastname"],
    );

    try {
      verifier.check({ name: "admin", lastname: "admin" });
    } catch (err: any) {
      expect(err.errorsObj).toHaveLength(2);
      expect(err.errorsObj.map((e: any) => e.key).sort()).toEqual([
        "lastname",
        "name",
      ]);
      err.errorsObj.forEach((e: any) =>
        expect(e.message).toBe("combinación reservada"),
      );
    }
  });

  it("acepta una sola key como string", () => {
    const verifier = V.ObjectNotNull({
      age: V.NumberNotNull(),
    }).refine((v) => v.age >= 18, "mayor de edad requerido", "age");

    try {
      verifier.check({ age: 10 });
    } catch (err: any) {
      expect(err.errorsObj).toHaveLength(1);
      expect(err.errorsObj[0].key).toBe("age");
    }
  });

  it("reporta sin key cuando no se especifica", () => {
    const verifier = V.ObjectNotNull({
      a: V.NumberNotNull(),
      b: V.NumberNotNull(),
    }).refine((v) => v.a + v.b === 10, "la suma debe ser 10");

    try {
      verifier.check({ a: 1, b: 2 });
    } catch (err: any) {
      expect(err.errorsObj).toHaveLength(1);
      expect(err.errorsObj[0].key).toBe("");
      expect(err.errorsObj[0].message).toBe("la suma debe ser 10");
    }
  });

  it("no ejecuta refine si la verificación de props falla", () => {
    const spy = jest.fn(() => true);
    const verifier = V.ObjectNotNull({
      name: V.StringNotNull({ minLength: 3 }),
    }).refine(spy, "nope");

    expect(() => verifier.check({ name: "a" })).toThrow(VerificationError);
    expect(spy).not.toHaveBeenCalled();
  });

  it("permite encadenar varios refine en object", () => {
    const verifier = V.ObjectNotNull({
      password: V.StringNotNull(),
      confirm: V.StringNotNull(),
    })
      .refine(
        (v) => v.password === v.confirm,
        "las contraseñas no coinciden",
        "confirm",
      )
      .refine(
        (v) => v.password.length >= 8,
        "contraseña muy corta",
        "password",
      );

    expect(
      verifier.check({ password: "abcdefgh", confirm: "abcdefgh" }),
    ).toEqual({ password: "abcdefgh", confirm: "abcdefgh" });

    try {
      verifier.check({ password: "abcdefgh", confirm: "zzz" });
    } catch (err: any) {
      expect(err.errorsObj[0].key).toBe("confirm");
      expect(err.errorsObj[0].message).toBe("las contraseñas no coinciden");
    }

    try {
      verifier.check({ password: "abc", confirm: "abc" });
    } catch (err: any) {
      expect(err.errorsObj[0].key).toBe("password");
      expect(err.errorsObj[0].message).toBe("contraseña muy corta");
    }
  });

  it("VObject (nullable) ejecuta refine con null cuando el objeto es null", () => {
    const verifier = V.Object({
      name: V.StringNotNull(),
    }).refine((v) => v !== null, "requerido", "name");

    try {
      verifier.check(null);
    } catch (err: any) {
      expect(err.errorsObj[0].key).toBe("name");
      expect(err.errorsObj[0].message).toBe("requerido");
    }

    expect(verifier.check({ name: "ok" })).toEqual({ name: "ok" });
  });
});
