
//Data structures Box extensions
module.exports = function() {
	const self = this; //self instance

	//helpers
	function fnVoid() {}
	function fnTrue() { return true; }
	function fnSize(arr) { return arr ? arr.length : 0; } //string o array
	function extract(arr, i, n) { arr.splice(i, n); return self; }
	function cmp(a, b) { return (a == b) ? 0 : ((a < b) ? -1 : 1); }
	function multisort(a, b, columns, orderby, index) {
		index = index || 0;
		var name = columns[index];
		var direction = (orderby && (orderby[index] == "asc"));
		var value = direction ? cmp(a[name], b[name]) : cmp(b[name], a[name]);
		return ((value == 0) && (index < (columns.length - 1))) ? multisort(a, b, columns, orderby, index + 1) : value;
	}

	this.size = fnSize;
	this.indexOf = function(arr, elem) { return arr ? arr.indexOf(elem) : -1; }
	this.intersect = function(a1, a2) { return a2 ? a1.filter(function(e) { return (a2.indexOf(e) > -1); }) : []; }
	this.multisort = function(arr, columns, orderby) { return arr.sort(function(a, b) { return multisort(a, b, columns, orderby); }); }
	this.swap = function(arr, a, b) { let aux = arr[a]; arr[a] = arr[b]; arr[b] = aux; return self; }
	this.shuffle = function(arr) { return arr.sort(function() { return 0.5 - Math.random(); }); }
	this.add = function(arr, obj) { arr && arr.push(obj); return obj; }
	this.addAt = function(arr, obj, i) { arr && arr.splice(i, 0, obj); return obj; }
	this.put = function(arr, obj) { arr && arr.unshift(obj); return self; }
	this.putAt = function(arr, obj, i) { self.addAt(arr, obj, i); return self; }
	this.push = function(arr, obj) { arr && arr.push(obj); return self; }
	this.remove = function(arr, i, n) { return arr && extract(arr, i, n); }
	this.reset = function(arr) { arr && arr.splice(0); return self; }
	this.pop = function(arr) { return arr && extract(arr, -1, 1); }
	this.last = function(arr) { return self.get(arr, fnSize(arr) - 1); }
	this.get = function(arr, i) { return arr && arr[i]; }

	this.find = function(arr, fn) { return arr ? arr.find(fn) : null; }
	this.ifind = function(arr, fn) { return arr ? arr.findIndex(fn) : -1; }
	this.distinct = function(arr, fn) { return fn ? arr.filter((a, i) => { return (arr.findIndex(b => { return fn(a, b); }) == i); }) : arr; }
	this.isect = function(a1, a2, fn) { return (a2 && fn) ? a1.filter(a => { return (a2.findIndex(b => { return fn(a, b); }) >= 0); }) : a1; }
	this.usect = function(a1, a2, fn) { return (a2 && fn) ? a1.concat(a2.filter(b => { return (a1.findIndex(a => { return fn(a, b); }) < 0); })) : a1; }
	this.sortBy = function(arr, name) { return name ? self.sort(arr, (a, b) => { return cmp(a[name], b[name]); }) : arr; }
	this.sort = function(arr, fn) { return arr ? arr.sort(fn || cmp) : arr; }
	this.clone = function(arr) { return arr ? arr.slice() : []; }
	this.each = function(arr, fn) { //iterator
		let size = fnSize(arr); //max
		for (let i = 0; (i < size); i++)
			fn(arr[i], i); //callback
		return self;
	}
	this.extract = function(arr, fn) {
		let size = fnSize(arr); //max
		for (let i = 0; (i < size); i++)
			fn(arr[i], i) && extract(arr, i--, 1); //remove?
		return self;
	}

	//Tree Traversal with PreOrder and PostOrder
	function fnTraversal(root, node, preorder, postorder) {
		node.childnodes.forEach((child, i) => { //iterate over next deep level
			preorder(root, node, child, i) && fnTraversal(root, child, preorder, postorder); //preorder = cut/poda
			postorder(root, node, child, i);
		});
		return self;
	}
	this.preorder = function(root, preorder, postorder) {
		return fnTraversal(root, root, preorder, postorder || fnVoid);
	}
	this.findNode = function(root, node, fn) {
		var result; //node result
		for (let i = 0; !result && (i < node.childnodes.length); i++) {
			let child = node.childnodes[i]; //get childnode
			result = fn(root, node, child, i) ? child : self.findNode(root, child, fn); //next deep level
		}
		return result;
	}

	var pkName, fkName, fnGroup;
	this.reduce = function(data, onGroup) {
		fnGroup = onGroup || fnTrue;
		let parts = []; //container

		let size = fnSize(data);
		(size > 0) && parts.push(data[0]);
		for (let i = 1; i < size; i++) {
			let row = data[i];
			let prev = parts[parts.length - 1];
			fnGroup(prev, row, i, parts) && parts.push(row); //resume?
		}
		return parts;
	}

	function newNode(parent, contents, idChild) {
		var child = { id: idChild, data: contents, childnodes: [] };
		child.level = parent.level + 1; //inc level
		//call group event handler (cut/poda?)
		if (fnGroup(parent, child)) {
			parent.childnodes.push(child); //add child
			return child;
		}
		return null; //poda la rama
	}
	function addNode(json, parent, idChild) {
		var child = newNode(parent, json.filter(row => { return (row[fkName] == idChild); }), idChild);
		child && child.data.forEach(row => { addNode(json, child, row[pkName]); }); //build level+1
		return child;
	}
	this.group = function(groups, root) {
		root = Object.assign({ id: 0, level: 0, data: [], childnodes: [] }, root);
		fnGroup = root.onGroup || fnTrue;

		root.data.forEach(function(row, i) {
			var node = root; //root node
			groups.forEach(function(colName, g) {
				var idChild = row[colName]; //pk value
				node = node.childnodes.find(n => { return (n.id == idChild); }) //node exists
					|| newNode(node, node.data.filter(row => { return (row[colName] == idChild); }), idChild)
					|| node; //move to next deep level
			});
		});
		return root;
	}
	this.tree = function(json, root) {
		root = Object.assign({ id: 0, level: 0, childnodes: [] }, root);

		//set global properties key name
		pkName = root.pk || "id"; //pk
		fkName = root.fk || "parent"; //fk
		fnGroup = root.onGroup || fnTrue;

		//build tree iterating recursively over nodes
		root.data = json.filter(row => { return !row[fkName]; }); //first deep level
		root.data.forEach(row => { addNode(json, root, row[pkName]); }); //build level=1
		return root;
	}
	/***********************************************/

	//Build graph from json data
	var buffer = []; //auxiliar container
	function addVertex(json, parent, idChild) {
		if (buffer.indexOf(idChild) > -1) //cycle?
			return null; //child node pre-visited
		buffer.push(idChild); //marck id node as visited => avoid cycles
		var child = newNode(parent, json.filter(row => { return (row[fkName] == idChild); }), idChild);
		child && child.data.forEach(row => { addVertex(json, child, row[pkName]); }); //build level+1
		return child;
	}
	this.graph = function(json, root) {
		root = Object.assign({ id: 0, level: 0, childnodes: [] }, root);
		buffer.slice(0); //reset visited array

		//set global properties key name
		pkName = root.pk || "id"; //pk
		fkName = root.fk || "parent"; //fk
		fnGroup = root.onGroup || fnTrue;

		//build graph iterating over all vertex
		root.data = json.filter(row => { return !row[fkName]; }); //first deep level
		root.data.forEach(row => { addVertex(json, root, row[pkName]); }); //build level=1
		return root;
	}
	//Graph Traversal with Breadth-First Search (BFS)
	this.bfs = function(graph, fn) {
		buffer.slice(0); //reset visited array
		buffer.push(graph.id); //marck id node as visited => avoid cycles
		var queue = [graph]; //Initialize queue for BFS

		//Iterate over all vertex
		while (queue.length > 0) {
			let node = queue.shift(); //Dequeue a vertex
			queue = node.childnodes.filter((child, i) => {
				//check if child node has been pre-visited and call fn for cut/poda
				let pendiente = (buffer.indexOf(child.id) < 0) && fn(graph, node, child, i);
				return pendiente ? buffer.push(child.id) : 0; //marck id node as visited => avoid cycles
			}).concat(queue);
		}
		return graph;
	}

	function fnVertex(graph, node, fn) {
		if (buffer.indexOf(node.id) > -1) //cycle?
			return null; //child node pre-visited
		var result; //node result
		buffer.push(node.id); //marck id node as visited => avoid cycles
		for (let i = 0; !result && (i < node.childnodes.length); i++) {
			let child = node.childnodes[i]; //get childnode
			result = fn(graph, node, child, i) ? child : fnVertex(graph, child, fn); //next deep level
		}
		return result;
	}
	this.findVertex = function(graph, fn) {
		buffer.slice(0); //reset visited array
		return fnVertex(graph, graph, fn);
	}
	/***********************************************/
}
