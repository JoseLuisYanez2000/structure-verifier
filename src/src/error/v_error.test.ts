import { VerificationError } from "./v_error";

describe("VerificationError", () => {
  it("formats messages without leading spaces when key is empty", () => {
    const error = new VerificationError([
      { key: "", message: "  must be a string  " },
    ]);

    expect(error.message).toBe("must be a string");
    expect(error.errors).toEqual(["must be a string"]);
    expect(error.errorsObj).toEqual([{ key: "", message: "must be a string" }]);
  });

  it("returns defensive copies for errors and errorsObj", () => {
    const error = new VerificationError([
      { key: "email", message: "is invalid", isEmpty: false },
    ]);

    const errors = error.errors;
    const errorsObj = error.errorsObj;

    errors.push("tampered");
    errorsObj[0].message = "changed";

    expect(error.errors).toEqual(["email is invalid"]);
    expect(error.errorsObj).toEqual([
      { key: "email", message: "is invalid", isEmpty: false },
    ]);
  });

  it("does not keep references to the original input array", () => {
    const source = [{ key: "name", message: "is required" }];
    const error = new VerificationError(source);

    source[0].message = "changed";
    source.push({ key: "other", message: "mutated" });

    expect(error.errors).toEqual(["name is required"]);
    expect(error.errorsObj).toEqual([{ key: "name", message: "is required" }]);
  });
});
