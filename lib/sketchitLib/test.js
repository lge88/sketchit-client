var myApp=new sketchitLib.Root({});
myApp.init();

myApp.doHandler("addALineElement", {
	x1:0,
	y1:0,
	x2:10,
	y2:20
})
myApp.doHandler("addALineElement", {
	x1:20,
	y1:30,
	x2:100,
	y2:200
})
myApp.doHandler("addANode", {
	x:120,
	y:320
})
myApp.doHandler("addANode", {
	x:123,
	y:325
})
myApp.doHandler("editALineElement", {
	index:1,
	config: {
		from:myApp.findTarget(["nodes",0]),
		E:1000,
		A:800
	}
},false)
console.log("myApp ",myApp);