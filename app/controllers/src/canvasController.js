/**
 * @class canvasController
 * @extends Ext.Controller
 */
Ext.regController("canvasController", {

	initController : function(options) {
		this.mainView = this.render({
			xtype : 'sketchitMain'
		}, Ext.getBody());
		
		console.log("w: ",this.mainView.getWidth()," h: ",this.mainView.getHeight())

		this.mainView.on({
			orientationchange : this.onOrientationchange,
			scope : this
		})
		this.onOrientationchange(this.mainView);

		this.canvasPanel = this.mainView.getComponent(0);
		this.Renderer = new sketchitLib.Renderer({
			Root : new sketchitLib.Root({}),
			Canvas : document.getElementById('workspace')
		})

		this.canvasPanel.mon(this.canvasPanel.el, {
			doubletap : this.onDoubleTap,
			touchmove : this.onTouchMove,
			touchstart : this.onTouchStart,
			touchend : this.onTouchEnd,

			//pinchstart : this.onPinchStart,
			pinch : this.onPinch,
			//pinchend : this.onPinchEnd,
			scope : this
		});

		this.recognizer = new DollarRecognizer();
		this.howManyTouches = 1;

		this.componentList = this.render({
			xtype : 'sketchitComponentList'

		}, Ext.getBody());
		
		var onHide=function(){
			this.bottomBar.getComponent(0).setPressed(0,false)			
		};
		
		this.componentList.on({
			hide : onHide,
			scope : this
		})

		var showList = function(btn, event) {
			console.log("btm ",btn)
			this.componentList.setCentered(false);
			//overlayTb.setTitle('Attached Overlay');
			this.componentList.showBy(btn);
		}
		this.bottomBar = this.mainView.getDockedComponent(1);
		this.bottomBar.getComponent(0).getComponent(0).setHandler(showList,this)

	},
	
	initCanvasHandler: function(){
		
		
		
	},
	
	initMenu: function(){
		
		
	},
	
	
	setOptions : function(options) {
		Ext.apply(this.options, options);

	},
	options : {
		inputStokeStyle : "rgb(0,0,255)",

	},

	canvas2model : function(canvasCoord) {
		return
	},
	onOrientationchange : function(panel) {
		var d = panel.getDockedItems(), c = panel.getComponent(0);
		this.canvasWidth = panel.getWidth();
		this.canvasHeight =  panel.getHeight() -  d[0].getHeight() -  d[1].getHeight();
		this.canvasUpLeftX = 0;
		this.canvasUpleftY = d[0].getHeight();
	},
	pagePoint2CanvasPoint : function(p) {
		return {
			X : p.X - this.canvasUpLeftX,
			Y : p.Y - this.canvasUpleftY
		}
	},
	onDoubleTap : function(e, el, obj) {
		//alert("double tab")
		//html.style.webkitTransform = 'scale(1)';
		this.resetViewPort();
	},
	onTouchStart : function(e, el, obj) {
		console.log("touches: " + e.touches.length)

		this.howManyTouches = e.touches.length;
		if(this.howManyTouches === 1) {
			//this.ctx.strokeStyle = "rgb(0,0,255)";
			//this.ctx.fillStyle = "rgb(255,255,255)";
			//this.ctx.fillRect(0, 0, this.canvasPanel.canvasWidth, this.canvasPanel.canvasHeight);
			this.inputStrokes = [];

			this.inputStrokes.push(this.pagePoint2CanvasPoint({
				X : e.touches[0].pageX,
				Y : e.touches[0].pageY
			}));
		} else {

		}

	},
	onTouchMove : function(event, html, obj) {
		//var p=c.getCanvasXY(x,y);

		this.inputStrokes.push(this.pagePoint2CanvasPoint({
			X : event.touches[0].pageX,
			Y : event.touches[0].pageY
		}));
		var l = this.inputStrokes.length;
		//console.log("stroke len: ",l)
		this.Renderer.drawASingleStroke(this.inputStrokes[ l - 1], this.inputStrokes[ l - 2], this.options.inputStokeStyle);

	},
	onTouchEnd : function(event, html, obj) {
		var result = this.recognizer.Recognize(this.inputStrokes, false); delete this.inputStrokes;

	},
	onPinchStart : function(e, el, obj) {

	},
	onPinch : function(e, el, obj) {
		//e.preventDefault();
		var first = this.canvasPanel.page2canvas({
			X : event.touches[0].pageX,
			Y : event.touches[0].pageY
		}), second = this.canvasPanel.page2canvas({
			X : event.touches[1].pageX,
			Y : event.touches[1].pageY
		});
		el.style["-webkit-transform-origin"] = 0.5 * (first.X + second.X) + ' ' + 0.5 * (first.Y + second.Y)

		el.style.webkitTransform = 'scale(' + e.scale + ')';
		console.log("e touches " + e.touches[0].pageX);

	},
	onPinchStart : function(e, el, obj) {

	},
	clearCanvas : function() {

	},
	refreshCanvas : function() {

	},
});
