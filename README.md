# Validate-Box

Same I18n validation on server and client for web applications.

## How It Works

1. Validate inputs in HTML form.
2. Fetch response to server optionally by ajax.

## Usage

### JS Applications

Suitable for web apps with a great variety of forms.

<details><summary><b>Show instructions</b></summary>

1. Install by npm:

    <pre>
    $ npm install validate-box
    </pre>

</details>

## Config

Start http server for validate request examples from client.

1. trees.start():

	<pre>
	const fs = require("fs"); //file system
	const url = require("url"); //url parser
	const http = require("http"); //http server
	const qs = require("querystring"); //parse post data
	const valid = require("validate-box"); //validator

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
					console.log("Error:", error);
				});
			});
		}
		else //get request
			res.end(fs.readFileSync("src/views/index.html"), "text/html", () => {
				console.log(req.url, "->", "src/views/index.html");
			});
	});
	</pre>

### test

Lunch jest testing

<pre>
npm test
</pre>
