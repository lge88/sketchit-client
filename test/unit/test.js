var myApp = new DirectFEA.Root({});
myApp.init();

myApp.doHandler({
	name : "addALineElement",
	args : {
		x1 : 0,
		y1 : 0,
		x2 : 10,
		y2 : 20
	}
})
myApp.doHandler({
	name : "addALineElement",
	args : {
		x1 : 11,
		y1 : 22,
		x2 : 100,
		y2 : 200
	}
})

myApp.doHandler({
	name : "addALineElement",
	args : {
		x1 : 11,
		y1 : 22,
		x2 : 100,
		y2 : 200
	}
})

myApp.doHandler({
	name : "editALineElement",
	args : {
		index : 1,
		config : {
			from : myApp.findTarget(["nodes", 0]),
			E : 1000,
			A : 800
		}
	},
	undo : false
})
console.log("myApp ", myApp);
