
const valid = require("../src/main");

describe("Validators and messages", () => {
	test("Size validator", () => {
		expect(valid.size(null, 1, 200)).toBeFalsy();
		expect(valid.size(null, 0, 200)).toBeTruthy();
		expect(valid.size("dafsklñfj sdñl sdgsf sdff kafdj sdñlkajaf asjdsf asdf syuuy", 1, 10)).toBe(false);
		expect(valid.dt.toDate("", 1, 200)).toBeFalsy();
	});

	test("Loggin RegExp", () => {
		expect(valid.login(null)).toBeTruthy();
		expect(valid.login("0,13")).toBe(false);
	});
});
