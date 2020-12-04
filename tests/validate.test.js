
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

	test("Spanish ID's: NIF/CIF/NIE", () => {
		expect(valid.esId()).toBeFalsy();
		expect(valid.esId(null)).toBeFalsy();
		expect(valid.esId("")).toBeFalsy();
		expect(valid.esId("asdklñfj asdf")).toBeFalsy();
		expect(valid.esId("0,13")).toBe(false);
		expect(valid.esId("11111111h")).toBe(true);
		expect(valid.esId("11111111H")).toBe(true);
	});

	test("IBAN", () => {
		expect(valid.iban()).toBeFalsy();
		expect(valid.iban(null)).toBeFalsy();
		expect(valid.iban("0,13")).toBe(false);
		expect(valid.iban(" es34 4000056655665556 ")).toBe(false);
		expect(valid.iban(" es21 4242 4242 4242 4242 ")).toBe(false);
	});

	test("Credit Card Number", () => {
		expect(valid.creditCardNumber()).toBeFalsy();
		expect(valid.creditCardNumber(null)).toBeFalsy();
		expect(valid.creditCardNumber("0,13")).toBe(false);
		expect(valid.creditCardNumber("4001056655665556")).toBe(false);
		expect(valid.creditCardNumber("4000056655665556")).toBe(true);
		expect(valid.creditCardNumber(" 4000 056655665 556 ")).toBe(true);
		expect(valid.creditCardNumber(" 4242 4242 4242 4242 ")).toBe(true);
	});
});
