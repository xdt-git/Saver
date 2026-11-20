import { normalizeRegister, validateLogin, validateRegister } from "./validation";

const VALID = {
    email: " Neo@Matrix.io ",
    username: " Neo_One ",
    password: "Follow1Rabbit",
    confirmPassword: "Follow1Rabbit",
};

describe("validateRegister (same rules as the API)", () => {
    it("accepts valid data and normalizes email and username like the API", () => {
        expect(validateRegister(VALID)).toEqual({});
        expect(normalizeRegister(VALID)).toMatchObject({
            email: "neo@matrix.io",
            username: "neo_one",
        });
    });

    it("reports every problem at once", () => {
        expect(
            validateRegister({ email: "", username: "", password: "", confirmPassword: "" }),
        ).toEqual({
            email: "required",
            username: "required",
            password: "required",
            confirmPassword: "required",
        });
    });

    it.each([
        [{ email: "neo@" }, { email: "email" }],
        [{ username: "ab" }, { username: "username" }],
        [{ username: "нео" }, { username: "username" }],
        [{ password: "Short1", confirmPassword: "Short1" }, { password: "passwordLength" }],
        [{ password: "alllower1", confirmPassword: "alllower1" }, { password: "passwordStrength" }],
        [
            { password: `A1${"ж".repeat(40)}`, confirmPassword: `A1${"ж".repeat(40)}` },
            { password: "passwordTooLong" },
        ],
        [{ confirmPassword: "Other1Rabbit" }, { confirmPassword: "passwordsMismatch" }],
    ])("flags %o", (change, expected) => {
        expect(validateRegister({ ...VALID, ...change })).toEqual(expected);
    });
});

describe("validateLogin", () => {
    it("only requires both fields (the API decides the rest)", () => {
        expect(validateLogin({ login: " ", password: "" })).toEqual({
            login: "required",
            password: "required",
        });
        expect(validateLogin({ login: "neo", password: "x" })).toEqual({});
    });
});
