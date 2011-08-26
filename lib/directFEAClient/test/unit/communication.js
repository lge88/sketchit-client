module("websocket", {
	setup : function() {
		/*
		 var ws = new WebSocket('ws:/lge/sketchit/server/test1.tcl')
		 Ext.Ajax.request({
		 url : '/lge/sketchit/server/test1.tcl',
		 params : tcl,
		 method : 'POST',
		 scope : this,
		 success : function(result) {
		 //console.log(result)

		 this.Root.run("loadResultData", result.responseText);
		 this.Root.runsave("set", this.Root, "deformationAvailable", true);
		 //this.deformationAvailable = true;
		 this.autoSetDeformationScale(this.settings.maxDeformationOnScreen);
		 this.refresh();
		 }
		 });*/

	}
});

test("basic communication", function() {
	//stop();
	var tcl = "hello world asdfdsfasdfsdfffdf"
	
	window.ws = new WebSocket('ws://vision2.uscd.edu:12345/')
	ws.onopen    = function(msg){ console.log("Welcome - status "+this.readyState); };
  	ws.onmessage = function(msg){ console.log("Received: "+msg.data); };
 	ws.onclose   = function(msg){ console.log("Disconnected - status "+this.readyState); };

	/*
	var socket = io.connect('http://localhost');
	socket.on('news', function(data) {
		console.log(data);
		socket.emit('my other event', {
			my : 'data'
		});
	});*/
	console.log("ws", ws);
	/*
	 Ext.Ajax.request({
	 url : '/cgi-bin/lge/sketchit-server/a.out',
	 params : tcl,
	 method : 'POST',
	 scope : this,
	 success : function(result) {
	 //console.log(result.responseText);
	 alert(result.responseText)
	 //equals(result.responseTe)

	 }
	 });*/

});
