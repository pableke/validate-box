
const valid = require("../src/main");

//https://jestjs.io/docs/en/getting-started.html
describe("Bilding ES Numbers", () => {
	test("Flasy Number", () => {
		valid.setI18n("es");
		expect(valid.nb.toFloat()).toBe(0);
		expect(valid.nb.toFloat(undefined)).toBe(0);
		expect(valid.nb.toFloat(null)).toBe(0);
		expect(valid.nb.toFloat("")).toBe(0);
		expect(valid.nb.toFloat(0)).toBe(0);
	});

	const LONG = "5.398.245.163,75";
	test("String formated", () => {
		valid.setI18n("es");
		expect(valid.nb.float(5398245163.7546)).toEqual(LONG);
		expect(valid.nb.float(13.1)).toEqual("13,10");
		expect(valid.nb.float(.13)).toEqual("0,13");
	});

	test("String to float", () => {
		valid.setI18n("es");
		expect(valid.nb.trIsoFloat("5398245163.7546")).toEqual(LONG);
		expect(valid.nb.trIsoFloat("5163.1")).toEqual("5.163,10");
		expect(valid.nb.trIsoFloat(".13")).toEqual("0,13");
	});
});

describe("Bilding EN Numbers", () => {
	test("Flasy Number", () => {
		valid.setI18n("en");
		expect(valid.nb.toFloat()).toBe(0);
		expect(valid.nb.toFloat(undefined)).toBe(0);
		expect(valid.nb.toFloat(null)).toBe(0);
		expect(valid.nb.toFloat("")).toBe(0);
		expect(valid.nb.toFloat(0)).toBe(0);
	});

	const LONG = "5,398,245,163.75";
	test("String formated", () => {
		valid.setI18n("en");
		expect(valid.nb.float(5398245163.7546)).toEqual(LONG);
		expect(valid.nb.float(13.1)).toEqual("13.10");
		expect(valid.nb.float(.13)).toEqual("0.13");
	});

	test("String to float", () => {
		valid.setI18n("en");
		expect(valid.nb.trIsoFloat("5398245163.7546")).toEqual(LONG);
		expect(valid.nb.trIsoFloat("5163.1")).toEqual("5,163.10");
		expect(valid.nb.trIsoFloat(".13")).toEqual("0.13");
	});
});
