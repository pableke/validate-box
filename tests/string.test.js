
const valid = require("../src/main");

//https://jestjs.io/docs/en/getting-started.html
test("Translate string", () => {
	valid.setI18n("es");
	expect(valid.sb.tr()).toBe("");
	expect(valid.sb.tr("TÓÁúpadff dsfPPT")).toBe("toaupadff dsfppt");
	expect(valid.sb.tr(null)).toBe("");
});
