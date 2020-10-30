
//required node modeules
const fs = require("fs"); //file system
const url = require("url"); //url parser
const http = require("http"); //http server
const qs = require("querystring"); //parse post data
const valid = require("./main"); //validator

const _maxFieldsSize= 20 * 1024 * 1024; //20mb

//create server instance
const server = http.createServer(function(req, res) {
	let parts = url.parse(req.url.toLowerCase(), true); //parse url
	let pathname = parts.pathname; //https://example.org/abc/xyz?123 = /abc/xyz
	//Static request => res.end()
	if (pathname.indexOf("/favicon.ico") > -1)
		return res.end(); //ignore icon request
	if ((pathname.indexOf("/css/") > -1) || (pathname.indexOf("/js/") > -1))
		return res.end(fs.readFileSync(__dirname + pathname).toString());

	valid.setI18n(parts.query.lang);
	if (req.method == "POST") { //post request
		let rawData = ""; //buffer
		req.on("data", function(chunk) {
			rawData += chunk;
			if (rawData.length > _maxFieldsSize) { //20mb
				delete rawData; //free body memory
				req.connection.destroy(); //FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
			}
		});
		req.on("end", function() {
			req.body = (req.headers["content-type"] == "application/json") ? JSON.parse(rawData) : qs.parse(rawData);
			console.log("----------", "Validating", "----------");
			console.log(req.body);

			let error = {}; //err container
			let fields = req.body; //request fields
			error.name = valid.vb.size(fields.name, 1, 200) || "Field name ame tot valid";
			error.subject = valid.vb.size(fields.subject, 0, 200) || "Field subject not valid";
			error.email = (fields.email && valid.vb.email(fields.email)) || "Invalid email format";
			error.idUsuario = fields.idUsuario || "User is required";
			error.id = error.idUsuario ? valid.nb.toFloat(fields.idUsuario) : 0;
			if (error.id <= 0)
				error.idUsuario = "User not found";
			res.end(JSON.stringify(error), "application/json", () => {
				console.log("----------", "Results", "----------");
				console.log(error);
			});
		});
	}
	else //get request
		res.end(fs.readFileSync("src/views/index.html"), "text/html", () => {
			console.log(req.url, "->", "src/views/index.html");
		});
});

//capture Node.js Signals and Events
function fnExit(signal) { //exit handler
	console.log("------------------");
	console.log("> Received [" + signal + "].");
	server.close();
	console.log("> Http server closed.");
	console.log("> " + (new Date()));
	process.exit(0);
};
server.on("close", fnExit); //close server event
process.on("exit", function() { fnExit("exit"); }); //common exit signal
process.on("SIGHUP", function() { fnExit("SIGHUP"); }); //generated on Windows when the console window is closed
process.on("SIGINT", function() { fnExit("SIGINT"); }); //Press Ctrl-C / Ctrl-D keys to exit
process.on("SIGTERM", function() { fnExit("SIGTERM"); }); //kill the server using command kill [PID_number] or killall node
process.stdin.on("data", function(data) { (data == "exit\n") && fnExit("exit"); }); //console exit

//start http and https server
let port = process.env.port || 3000;
server.listen(port, "localhost");

console.log("> Server running at http://localhost:" + port + "/");
console.log("> " + (new Date()));
