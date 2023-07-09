import { duplicate } from "../utils";

describe("Jest PoC test", () => {
    test("it works", () => {
        const result = duplicate(5);
        expect(result).toBe(10);
    });
});
