
const valid = require("../src/main");

//https://jestjs.io/docs/en/getting-started.html
describe("Is Number", () => {
	test("Multi input value", () => {
		expect(valid.nb.isNumber()).toBeFalsy();
		expect(valid.nb.isNumber(undefined)).toBeFalsy();
		expect(valid.nb.isNumber(null)).toBeFalsy();
		//Important! isNaN(null) isNaN("") isNaN("   ") == false
		expect(valid.nb.isNumber("   ")).toBeFalsy();
		expect(valid.nb.isNumber("")).toBeFalsy();
		expect(valid.nb.isNumber("0")).toBe(true);
		expect(valid.nb.isNumber("3j")).toBe(false);
	});
});

describe("Bilding ES Numbers", () => {
	test("Flasy Number", () => {
		valid.setI18n("es");
		expect(valid.nb.toFloat()).toBeNull();
		expect(valid.nb.toFloat(undefined)).toBeNull();
		expect(valid.nb.toFloat(null)).toBeNull();
		expect(valid.nb.toFloat("")).toBeNull();
		expect(valid.nb.toFloat("0")).toBe(0);
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
		expect(valid.nb.toFloat()).toBeNull();
		expect(valid.nb.toFloat(undefined)).toBeNull();
		expect(valid.nb.toFloat(null)).toBeNull();
		expect(valid.nb.toFloat("")).toBeNull();
		expect(valid.nb.toFloat("0")).toBe(0);
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
