
const valid = require("../src/main");

//https://jestjs.io/docs/en/getting-started.html
describe("Bilding ES DateTime objects", () => {
	test("Flasy Date", () => {
		valid.setI18n("es");
		expect(valid.dt.toDate()).toBeFalsy();
		expect(valid.dt.toDate(undefined)).toBeNull();
		expect(valid.dt.toDate(null)).toBeNull();
		expect(valid.dt.toDate("")).toBeFalsy();
		expect(valid.dt.toDate(0)).toBeFalsy();
	});

	test("String to Date", () => {
		valid.setI18n("es");
		expect(valid.dt.toDate("0,13,1")).toEqual(new Date(2001, 11, 1));
		expect(valid.dt.toDate("0,13")).toEqual(new Date(2000, 11, 1));
	});
});

describe("Bilding EN DateTime objects", () => {
	test("Flasy Date", () => {
		valid.setI18n("en");
		expect(valid.dt.toDate()).toBeFalsy();
		expect(valid.dt.toDate(undefined)).toBeNull();
		expect(valid.dt.toDate(null)).toBeNull();
		expect(valid.dt.toDate("")).toBeFalsy();
		expect(valid.dt.toDate(0)).toBeFalsy();
	});

	test("String to Date", () => {
		valid.setI18n("en");
		expect(valid.dt.toDate("1,13,0")).toEqual(new Date(2001, 11, 1));
		expect(valid.dt.toDate("xxxx,13")).toEqual(new Date(2000, 11, 1));
	});
});
