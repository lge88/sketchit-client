(function() {
	var $D = DirectFEA;
	Ext.regApplication({
		name : "sketchit",
		glossOnIcon : false,
		launch : function() {
			sketchit.controllers.main = Ext.regController("main", {
				initAll : function(options) {
					//init views
					this.mainView = new sketchitMainView({
						listeners : {
							afterrender : function() {
								sketchit.controllers.main.canvas = this.getComponent(0);
								sketchit.controllers.main.topBar = this.getDockedItems()[0];
								sketchit.controllers.main.bottomBar = this.getDockedItems()[1];

							}
						}
					})
					// this.settingTabs = new Ext.TabPanel({
					    // sortable: true, // Tap and hold to sort
					    // ui: 'dark',
					    // floating : true,
					    // centered : true,
					    // width : 600,
					    // height : 450,
					    // activeTab : 1,
					    // tabBarPosition : 'tap',
					    // items: [{
					        // title: 'display',
					        // html: 'display settings',
					        // cls: 'card card1'
					    // },
					    // {
					        // title: 'model',
					        // html: 'model settngs',
					        // cls: 'card card2'
					    // },
					    // {
					        // title: 'analysis',
					        // html: 'analysis settings',
					        // cls: 'card card3'
					    // },
					    // {
					        // title: 'advanced',
					        // html: 'advanced settings',
					        // cls: 'card card4'
					    // }]
					// });

					//init model Domain
					this.Domain = new $D.Domain();
					window.Domain = this.Domain;

					//init Renderer
					this.Renderer = new $D.Renderer(document.getElementById('workspace'));
					window.Renderer = this.Renderer;

					this.settings = {};
					$D.apply(this.settings, {
						mode : 'draw',
						touchMoveAnimation : false,
						touchMoveFps : 10,
						snapAnimationFps : 50,
						snapAnimationElapse : 1500,
						dynamicsAnalysis: false,

						autoAnalysis : true,
						showMessage : true,
						messageBoxPositionX : 10,
						messageBoxPositionY : 10,
						messageTextFont : "bold 12px sans-serif",
						messageTextFillStye : "rgb(0,0,0)",
						messageLastTime : 5,

						modelScale : 2.0,
						loadScale : 100.0,
						// loadScale : 1.0,

						mouseWheelSpeedFactor : 5, //1~10, scale = e^(wheelDelta*speedFactor/speedBase)
						mouseWheelSpeedBase : 5000, //fixed

						viewPortScale : 1.0,
						maxViewPortScale : 20.0,
						minViewPortScale : 0.2,
						viewPortShiftX : 0.0,
						viewPortShiftY : 0.0,

						showDeformation : true,
						showMoment : true,

						deformationScale : 20,
						// deformationScale : 2000,
						momentScale : 0.01,
						autoDeformationScale : true,
						maxDeformationOnScreen : 40,
						deformationResolution : 20,
						autoMomentScale : true,
						maxMomentOnScreen : 80,
						momentResolution : 20,

						snapToNode : true,
						snapToNodeThreshold : 10,
						moveSnapToNodeThreshold: 10,

						snapToLine : true,
						snapToLineThreshold : 25,

						snapToGrid : true,
						grid : 20,
						gridLineWidth : 1,
						gridLineStyle : "rgba(0,0,0,0.5)",

						SPCSnapToDirection : true,
						SPCSnapToDirectionThreshold : 0.2,

						SPCSnapToNode : true,
						SPCSnapToNodeThreshold : 15,

						SPCSnapToLine : true,
						SPCSnapToLineThreshold : 15,

						circleSnapToSPCThreshold : 25,

						loadSnapToNode: true,
						loadSnapToNodeThreshold : 15,
						
						loadSnapToLine : true,
						loadSnapToLineThreshold : 15,

						autoMergeNodeOnLine : true,
						autoMergeNodeOnLineThreshold : 10,

						showStructure: true,
						showNodeId : true,
						showElementId : false,
						showMarks : false,
						showGrid : true,
						showSPC : true,
						showLineElementDirection : false,
						showConstraints: true,
						showLoads:true,
						showNodes: true,
						

						canvasBgColor : "rgb(255,255,255)",
						inputStrokeStyle : "rgb(0,0,255)",
						inputStrokeWidth : 2,

						// defaultLineELementType : DirectFEA.ElasticBeamColumn,
						defaultLineELementType : "ElasticBeamColumn",
						defaultGeomTransf : Domain.theGeomTransfs[3], 
						defaultGeomTransfId : 3,// 1:linear, 2:PDelta, 3:Corotational
						defaultNodeLoadType : "load",

						UniformElementLoadDirectionThreshold : 0.3,
						UniformElementLoadSnapToLineThreshold : 15,

						circleSelectThreshold : 0.1,
						clickSelectThreshold : 10,
						
						autoMesh: true,
						autoMeshSize: 20

					})

					this.inputStrokes = [];
					this.logs = [], this.shapeRecognizer = new DollarRecognizer();
					this.initHandlers();
					this.setCanvasPosition(0, this.topBar.getHeight(), this.mainView.getWidth(), this.mainView.getHeight() - this.topBar.getHeight() - this.bottomBar.getHeight());
					this.resetViewPort();
					this.refresh();
				},
				initHandlers : function() {
					this.mainView.on({
						orientationchange : this.onOrientationchange,
						scope : this
					})

					// init canvas handlers
					this.canvas.mon(this.canvas.el, {
						doubletap : this.onDoubleTap,
						touchmove : this.onTouchMove,
						touchstart : this.onTouchStart,
						touchend : this.onTouchEnd,
						mousewheel : this.onMouseWheel,
						pinchstart : this.onPinchStart,
						pinch : this.onPinch,
						pinchend : this.onPinchEnd,
						scope : this
					});

					//this.init Menu Handlers;

					//run button
					this.bottomBar.getComponent(0).getComponent(2).setHandler(function() {
						this.reanalyze();
					}, this);
					
					//show structre button
					this.topBar.getComponent(0).getComponent(0).setHandler(function() {
						this.settings.showStructure = !this.settings.showStructure;
						this.refresh();
					}, this);
					
					//show node id button
					this.topBar.getComponent(0).getComponent(1).setHandler(function() {
						this.settings.showNodeId = !this.settings.showNodeId;
						this.refresh();
					}, this);
					
					//grid button
					this.topBar.getComponent(0).getComponent(2).setHandler(function() {
						this.settings.showGrid = !this.settings.showGrid;
						this.refresh();
					}, this);
					
					//real time button
					this.topBar.getComponent(0).getComponent(3).setHandler(function() {
						this.settings.autoAnalysis = !this.settings.autoAnalysis;
						if(this.settings.autoAnalysis === true) {
							this.reanalyze(function() {
								this.refresh();
							})
						}
					}, this);
					
					//deformation button
					this.topBar.getComponent(0).getComponent(4).setHandler(function() {
						this.settings.showDeformation = !this.settings.showDeformation;
						this.reanalyze(function() {
							this.refresh();
						});
					}, this);
					//moment button
					this.topBar.getComponent(0).getComponent(5).setHandler(function() {
						this.settings.showMoment = !this.settings.showMoment;
						this.reanalyze(function() {
							this.refresh();
						})
					}, this);
					
					//snap to grid button
					this.topBar.getComponent(0).getComponent(6).setHandler(function() {
						this.settings.snapToGrid = !this.settings.snapToGrid;
					}, this);
					
					//snap to node button
					this.topBar.getComponent(0).getComponent(7).setHandler(function() {
						this.settings.snapToNode = !this.settings.snapToNode;
						this.settings.SPCSnapToNode = !this.settings.SPCSnapToNode;
						this.settings.loadSnapToNode = !this.settings.loadSnapToNode;
					}, this);
					
					//snap to line button
					this.topBar.getComponent(0).getComponent(8).setHandler(function() {
						this.settings.snapToLine = !this.settings.snapToLine;
						this.settings.SPCSnapToLine = !this.settings.SPCSnapToLine;
						this.settings.loadSnapToLine = !this.settings.loadSnapToLine;
					}, this);
					
					//show element direction
					this.topBar.getComponent(0).getComponent(9).setHandler(function() {
						this.settings.showLineElementDirection = !this.settings.showLineElementDirection;
						this.refresh();
					}, this);
					
					//show show ElementId button
					this.topBar.getComponent(0).getComponent(10).setHandler(function() {
						this.settings.showElementId = !this.settings.showElementId;
						this.refresh();
					}, this);
					
					//show show Loads button
					this.topBar.getComponent(0).getComponent(11).setHandler(function() {
						this.settings.showNodes = !this.settings.showNodes;
						this.refresh();
					}, this);
					//show show Loads button
					this.topBar.getComponent(0).getComponent(12).setHandler(function() {
						this.settings.showLoads = !this.settings.showLoads;
						this.refresh();
					}, this);
					
					//show show Constraints button
					this.topBar.getComponent(0).getComponent(13).setHandler(function() {
						this.settings.showConstraints = !this.settings.showConstraints;
						this.refresh();
					}, this);
					
					//show show Constraints button
					this.topBar.getComponent(0).getComponent(14).setHandler(function() {
						this.settings.dynamicsAnalysis = !this.settings.dynamicsAnalysis;
						this.refresh();
					}, this);
					
					// autoScale button
					
					this.topBar.getComponent(1).setHandler(this.autoScale, this);
					
					// more button
					this.topBar.getComponent(2).setHandler(this.showMoreSetting, this);
					
					//clear button
					this.bottomBar.getComponent(2).setHandler(this.clearAll, this);

					//unselect all button
					this.bottomBar.getComponent(3).setHandler(function() {
						this.Domain.mark();
						if(!this.Domain["unselectAll"]()) {
							console.log("do nothing");
							this.Domain.unmark();
						} else {
							this.Domain.group();
						}
						// this.Domain.commit();
						this.refresh();
					}, this);
					//delete button
					this.bottomBar.getComponent(4).setHandler(function() {
						this.Domain.mark();
						if(!this.Domain["removeSelectedObjects"]()) {
							console.log("do nothing");
							this.Domain.unmark();
						} else {
							this.Domain.group();
							if(this.settings.autoAnalysis) {
								this.reanalyze(function() {
									this.refresh();
								});
							} else {
								this.refresh();
							}
						}
					}, this);
					//undo button
					this.bottomBar.getComponent(5).setHandler(this.undo, this);
					this.bottomBar.getComponent(5).setDisabled(true);
					//redo button
					this.bottomBar.getComponent(6).setHandler(this.redo, this);
					this.bottomBar.getComponent(6).setDisabled(true);
					//save button
					this.bottomBar.getComponent(7).setHandler(this.saveScript, this);

					//log button
					this.bottomBar.getComponent(9).setHandler(this.showLog, this);
					
					//mesh button
					this.bottomBar.getComponent(10).setHandler(this.autoMesh, this);
					
					//mode toggle button
					this.bottomBar.getComponent(12).on({
						toggle : function() {
							this.settings.mode = this.bottomBar.getComponent(12).getPressed().text;
						},
						scope : this
					});

				},
				
				showMoreSetting : function() {
					// var settingTabs = new Ext.TabPanel({
						// floating : true,
						// modal : true,
						// centered : true,
						// ui : 'dark',
						// width : 300,
						// height : 200,
						// tabBarPosition : 'tap',
						// activeTab : 1,
						// items : [
							// {
								// title : '1',
								// html : 'test1',
								// cls : 'card card1'
							// },
							// {
								// title : '2',
								// html : 'test1',
								// cls : 'card card2'
							// },
							// {
								// title : '3',
								// html : 'test1',
								// cls : 'card card5'
							// },
						// ]
					// });
					
					var settingTabs = new Ext.TabPanel({
					    sortable: true, // Tap and hold to sort
					    // ui: 'dark',
					    // type : 'dark',
					    floating : true,
					    centered : true,
					    modal : true,
					    width : 600,
					    height : 500,
					    activeTab : 1,
					    tabBarPosition : 'tap',
					    items: [{
					        title: 'display',
					        // title: '1',
					        // html: 'display settings',
					        cls: 'card card1',
					        scroll : 'vertical',
					        defaults : {
					        	xtype : 'togglefield',
					        	labelWidth : '70%',
					        	// height : 30
					        },
					        items : [{
					        	// xtype : 'togglefield',
					        	label : 'structure'
					        },{
					        	// xtype : 'togglefield',
					        	label : 'deformation'
					        },{
					        	// xtype : 'togglefield',
					        	label : 'moment'
					        },{
					        	// xtype : 'togglefield',
					        	label : 'node'
					        },{
					        	// xtype : 'togglefield',
					        	label : 'node tag'
					        },{
					        	// xtype : 'togglefield',
					        	label : 'element tag'
					        },{
					        	// xtype : 'togglefield',
					        	label : 'element direction'
					        },{
					        	// xtype : 'togglefield',
					        	label : 'loads'
					        },{
					        	// xtype : 'togglefield',
					        	label : 'constraints'
					        }]
					    },
					    {
					        title: 'model',
					        // title: '2',
					        // html: 'model settngs',
					        cls: 'card card1',
					        scroll : 'vertical',
					        defaults : {
					        	xtype : 'togglefield',
					        	labelWidth : '50%',
					        	// height : 30
					        },
					        items : [{
					        	xtype: 'spinnerfield',
					        	label : 'number of dimension',
					        	maxValue : 3,
					        	minValue : 1,
					        	value : 2
					        },{
					        	xtype : 'spinnerfield',
					        	label : 'number of DOF',
					        	maxValue : 6,
					        	minValue : 1,
					        	value : 3
					        },{
					        	label : 'enable auto mesh',
					        },{
					        	label : 'mesh size',
					        	xtype: 'spinnerfield',
					        	value : 20
					        }]
					    },
					    {
					        // title: '3',
					        title: 'analysis',
					        // html: 'analysis settings',
					        cls: 'card card1',
					        defaults : {
					        	xtype : 'selectfield',
					        	labelWidth : '50%',
					        },
					        items : [{
					        	label : 'analysis type',
					        	options :[
							        {text: 'static',  value: 'static'},
							        {text: 'dynamic', value: 'dynamic'}
							    ]
					        },{
					        	xtype : 'togglefield',
					        	label : 'enable auto run',
					        },{
					        	label : 'time series',
					        	options :[
							        {text: 'constant',  value: 'constant'},
							        {text: 'linear', value: 'linear'},
							        {text: 'input ground motion', value: 'path'}
							    ]
					        },{
					        	label : 'algorithm',
					        	options :[
							        {text: 'Newton linear search',  value: 'NewtonLinear'},
							        {text: 'Newton-Raphson', value: 'Newton-Raphson'}
							    ]
					        },{
					        	label : 'test',
					        	options :[
							        {text: 'unbalanced load',  value: 'unbalancedload'},
							        {text: 'incremental displacement', value: 'incrdisp'},
							    ]
					        },{
					        	label : 'integrator',
					        	options :[
							        {text: 'load control',  value: 'loadcontrol'},
							    ]
					        },{
					        	label : 'constaint',
					        	options :[
							        {text: 'plain',  value: 'plain'},
							        {text: 'lagrange', value: 'lagrange'},
							    ]
					        },{
					        	label : 'numberer',
					        	options :[
							        {text: 'plain',  value: 'plain'},
							        {text: 'RCM',  value: 'RCM'}
							    ]
					        },{
					        	label : 'system',
					        	options :[
							        {text: 'Band General',  value: 'Bandgeneral'},
							    ]
					        }]
					    },
					    {
					        // title: '4',
					        title: 'advanced',
					        // html: 'advanced settings',
					        cls: 'card card1',
					        defaults : {
					        	xtype : 'togglefield',
					        	labelWidth : '50%',
					        },
					        items : [{
					        	label : 'snap to grid'
					        },{
					        	label : 'snap to line'
					        },{
					        	label : 'snap to node'
					        }]
					    },
					    {
					        // title: '4',
					        title: 'elements',
					        // html: 'advanced settings',
					        cls: 'card card1',
					        defaults : {
					        	xtype : 'togglefield',
					        	labelWidth : '50%',
					        },
					        items : [{
					        	xtype: 'selectfield',
					        	label : 'default element type',
					        	options : [
					        		{text: 'elastic beam', value: 'elasticBeamColumn'},
					        		{text: 'truss', value: 'truss'},
					        		{text: 'non-linear beam', value: 'nonlinearBeamColumn'},
					        		{text: 'beam with plastic hinges', value: 'beamWithHinges'}
					        	]
					        },{
					        	label : 'A',
					        	xtype : 'spinnerfield',
					        	value:  100
					        },{
					        	label : 'E',
					        	xtype : 'spinnerfield',
					        	value : 29000
					        },{
					        	label : 'I',
					        	xtype : 'spinnerfield',
					        	value:  833.3333
					        }]
					    }]
					});
					
					settingTabs.show();
					
				},
				
				getCanvasCoordFromViewPort : function(p) {
					return {
						X : (p.X - this.settings.viewPortShiftX) / this.settings.viewPortScale,
						Y : (p.Y - this.settings.viewPortShiftY) / this.settings.viewPortScale
					}
				},
				getViewPortCoordFromCanvas : function(p) {
					return {
						X : p.X * this.settings.viewPortScale + this.settings.viewPortShiftX,
						Y : p.Y * this.settings.viewPortScale + this.settings.viewPortShiftY
					}
				},
				getViewPortCoordFromPage : function(p) {
					return {
						X : p.X - this.canvasUpLeftX,
						Y : this.canvasHeight - p.Y + this.canvasUpleftY
					}
				},
				getCanvasCoordFromPage : function(p) {
					return {
						X : (p.X - this.canvasUpLeftX - this.settings.viewPortShiftX) / this.settings.viewPortScale,
						Y : (this.canvasHeight - p.Y + this.canvasUpleftY - this.settings.viewPortShiftY) / this.settings.viewPortScale
					}
				},
				setCanvasPosition : function(upleftX, upleftY, width, height) {
					this.canvasUpLeftX = upleftX;
					this.canvasUpleftY = upleftY;
					this.canvasWidth = width;
					this.canvasHeight = height;
				},
				initCT : function() {
					this.Renderer.setTransform(1.0, 0, 0, -1.0, 0, this.canvasHeight);
				},
				applyViewPortTransform : function() {
					this.Renderer.transform(this.settings.viewPortScale, 0, 0, this.settings.viewPortScale, this.settings.viewPortShiftX, this.settings.viewPortShiftY);
				},
				resetViewPort : function() {
					this.settings.viewPortScale = 1.0;
					this.settings.viewPortShiftX = 0.0;
					this.settings.viewPortShiftY = 0.0;
				},
				deltaTransform : function(dScale, dShiftX, dShiftY) {
					var R = this.Renderer;
					R.save();
					R.transform(dScale, 0, 0, dScale, dShiftX, dShiftY);
					this.deltaScale = dScale;
					this.deltaShiftX = dShiftX;
					this.deltaShiftY = dShiftY;
					this.clearScreen();
					R.save();
					this.initCT();
					this.drawMessage();
					R.restore();
					this.drawDomain();
					R.restore();
				},
				recordDeltaTransform : function() {
					var S = this.settings;
					S.viewPortShiftX = S.viewPortScale * this.deltaShiftX + S.viewPortShiftX;
					S.viewPortShiftY = S.viewPortScale * this.deltaShiftY + S.viewPortShiftY;
					S.viewPortScale = S.viewPortScale * this.deltaScale;
				},
				applyInputStrokeStyle : function(scale) {
					var R = this.Renderer, S = this.settings;
					R.strokeStyle = S.inputStrokeStyle;
					R.lineWidth = S.inputStrokeWidth / scale;
				},
				applyGridStyle : function(scale) {
					var R = this.Renderer, S = this.settings;
					R.strokeStyle = S.gridLineStyle;
					R.lineWidth = S.gridLineWidth / scale;
				},
				getAutoDeformationScale : function(maxDispOnScreen) {
					var a = $D.getAbsMax(this.Domain.theNodes, "dispX"), b = $D.getAbsMax(this.Domain.theNodes, "dispY"), m = a > b ? a : b;
					return maxDispOnScreen / m;
				},
				getAutoMomentScale : function(maxDispOnScreen) {
					var a = $D.getAbsMax(this.Domain.theElements, "maxMoment");
					console.log("maxM", a)
					return maxDispOnScreen / a;
				},
				clearScreen : function() {
					var R = this.Renderer;
					R.save();
					this.initCT();
					R.fillStyle = this.settings.canvasBgColor;
					R.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
					R.restore();
				},
				drawObjectStore : function(store, fn) {
					var iter = $D.iterate, //
					args = Array.prototype.slice.call(arguments, 2);
					iter(store, function(e) {
						e[fn].apply(e, args)
					})
				},
				drawMessage : function() {
					var R = this.Renderer, //
					S = this.settings, //
					msg = this.screenMessage;
					if($D.isDefined(msg)) {
						R.save();
						R.font = S.messageTextFont;
						R.fillStyle = S.messageTextFillStye;
						R.transform(1, 0, 0, -1, 0, 0);
						R.fillText(msg, S.messageBoxPositionX, -S.messageBoxPositionY);
						R.restore();
					}
				},
				drawDomain : function() {
					var R = this.Renderer, //
					S = this.settings, //
					vps = S.viewPortScale, //
					dfs = S.deformationScale, //
					draw = this.drawObjectStore, //
					domain = this.Domain, //
					nodes = domain.theNodes, //
					eles = domain.theElements;

					if(S.showGrid) {
						var c1 = this.getCanvasCoordFromViewPort({
							X : 0,
							Y : 0
						}), c2 = this.getCanvasCoordFromViewPort({
							X : this.canvasWidth,
							Y : this.canvasHeight
						});
						this.applyGridStyle(vps);
						R.drawGrid(S.grid, S.grid, c1.X, c2.X, c1.Y, c2.Y);
					}
					
					if (S.showStructure) {
						draw(eles, "display", R, vps);
					}
					if (S.showConstraints) {
						draw(domain.theSPCs, "display", R, vps);
					}
					if (S.showLoads) {
						draw(domain.thePatterns[1].Loads, "display", R, vps);
					}
					if (S.showNodes) {
						draw(nodes, "display", R, vps);
					}

					if(this.Domain.deformationAvailable && S.showDeformation) {
						draw(eles, "displayDeformation", R, vps, dfs, S.deformationResolution);
						draw(nodes, "displayDeformation", R, vps, dfs);
					}
					if(this.Domain.deformationAvailable && S.showMoment) {
						draw(eles, "displayMoment", R, vps, S.momentScale, S.momentResolution);
					}
					if(S.showNodeId) {
						draw(nodes, "displayTag", R, vps);
					}
					if(S.showElementId) {
						draw(eles, "displayTag", R, vps);
					}
					if(S.showLineElementDirection) {
						draw(eles, "displayDirection", R, vps);
					}
				},
				refresh : function() {
					this.clearScreen();
					this.initCT();
					this.drawMessage();
					this.applyViewPortTransform();
					this.drawDomain();
				},
				onOrientationchange : function() {
					this.setCanvasPosition(0, this.topBar.getHeight(), this.mainView.getWidth(), this.mainView.getHeight() - this.topBar.getHeight() - this.bottomBar.getHeight());
					this.resetViewPort();
					this.refresh();
				},
				onDoubleTap : function(e, el, obj) {
					this.resetViewPort();
					this.refresh();
				},
				animate : function(condition, fn, dt) {
					setTimeout(function(scope) {
						fn.call(scope);
						if(condition.call(scope)) {
							scope.animate(condition, fn, dt)
						}
					}, dt, this);
				},
				animate : function(condition, fn, dt) {
					var id = setInterval(function(scope) {
						fn.call(scope);
						if(!condition.call(scope)) {
							clearInterval(id);
						}
					}, dt, this)
				},
				onTouchStart : function(e, el, obj) {
					// console.log("touch start!",e)
					var P = this.getCanvasCoordFromPage({
						X : e.touches[0].pageX,
						Y : e.touches[0].pageY
					});
					this.touchCurrentX = P.X;
					this.touchCurrentY = P.Y;
					this.touchStartX = P.X;
					this.touchStartY = P.Y;
					this.shiftKey = e.event.shiftKey;
					if(this.settings.mode === "move") {
						if((e.event.type === "mousedown" && e.event.button == 1) || e.event.shiftKey) {

						} else {
							this.settings.touchMoveAnimation = true;
							this.animate(function() {
								return this.settings.touchMoveAnimation;
							}, function() {
								if(this.settings.autoAnalysis) {
									this.reanalyze(function() {
										this.refresh();
									});
								} else {
									this.refresh();
								}
							}, 1000 / this.settings.touchMoveFps);

						}
					} else {
						this.inputStrokes = [];
						this.inputStrokes.push(P);
					}
				},
				onTouchMove : function(e, el, obj) {
					var P = this.getCanvasCoordFromPage({
						X : e.touches[0].pageX,
						Y : e.touches[0].pageY
					});
					if(e.event.type === "mousemove" && (e.event.button == 1 || e.event.shiftKey)) {
						this.deltaTransform(1, P.X - this.touchStartX, P.Y - this.touchStartY);
					} else {
						if(this.settings.mode === "move" && this.settings.touchMoveAnimation === true) {
							this.Domain["moveSelectedObjects"](P.X - this.touchCurrentX, P.Y - this.touchCurrentY);
						} else {
							this.inputStrokes.push(P);
							var l = this.inputStrokes.length;
							this.applyInputStrokeStyle(this.settings.viewPortScale);
							this.Renderer.drawLine(this.inputStrokes[l - 2], this.inputStrokes[l - 1]);
						}
					}
					this.touchCurrentX = P.X;
					this.touchCurrentY = P.Y;
				},
				onTouchEnd : function(e, el, obj) {
					if(this.settings.mode === "move") {
						this.settings.touchMoveAnimation = false;
					}
					if((e.event.type === "mouseup" && e.event.button == 1) || (e.event.type === "mouseup" && this.shiftKey)) {
						this.recordDeltaTransform();
						this.refresh();
					} else if(e.touches.length === 0 || e.touches.length === 1) {
						switch (this.settings.mode) {
							case "move":
								this.afterMovingObjects();
								break;
							case "select":
								this.sketchSelect();
								break;
							case "draw":
							case "load":
								var shape = this.shapeRecognizer.Recognize(this.inputStrokes, false);
								var handler = this.sketchVocabulary[this.settings.mode][shape.name];
								if(handler && this.sketchHandlers[handler]) {
									this.sketchHandlers[handler].call(this, shape.data);
								} else {
									this.sketchHandlers["noSuchGesture"].call(this);
								}

								break;
							default:
								break;

						}
						this.Domain.group();
						this.Domain.unmark();

					}
					this.inputStrokes = [];
					this.shiftKey = e.event.shiftKey;
				},
				afterMovingObjects : function() {
					this.beforeUndoableCommand();
					var count;
					var dx = this.touchCurrentX - this.touchStartX;
					var dy = this.touchCurrentY - this.touchStartY;
					var S = this.settings;
					count = this.Domain["transitSelectedObjects"](dx, dy);
					var changed = count > 0 ? true : false;
					// test merge
					if($D.isDefined(this.Domain.selectedNodes[1])) {
						var np1 = this.Domain.snapToNode(this.Domain.selectedNodes[1], S.moveSnapToNodeThreshold);
						if(np1.capture) {
							this.Domain.mergeNodes(this.Domain.selectedNodes[1], np1.node);
						}
					}
					if(count) {
						var msg = "move " + count + " objects, dx = " + dx + " dy = " + dy;
					}
					this.afterUndoableCommand(changed, changed, msg);
					this.refresh();
				},
				sketchSelect : function() {
					this.beforeUndoableCommand();
					var data = this.shapeRecognizer.Recognize(this.inputStrokes, false).data;
					var d = $D.distance(data.from, data.to);
					var l = data.PathLength;
					var tags;
					if(d / l > this.settings.circleSelectThreshold) {
						tags = this.Domain["intersectSelect"]({
							"curve" : data.ResamplePoints
						});
					} else {
						if(l >= this.settings.clickSelectThreshold) {
							tags = this.Domain["circleSelect"]({
								"poly" : data.ResamplePoints
							});
						}
					}
					if(tags) {
						var selectCount = this.Domain.count(tags.select);
						var unSelectCount = this.Domain.count(tags.unselect);
						var msg = "";
						if(selectCount > 0) {
							msg += "select " + selectCount + " objects; ";
						}
						if(unSelectCount > 0) {
							msg += "unselect " + unSelectCount + " objects; ";
						}
					}
					this.afterUndoableCommand(tags, msg);
					this.refresh();
				},
				beforeUndoableCommand : function() {
					this.Domain.mark();
				},
				afterUndoableCommand : function(domainTouched, domainChanged, isUndoable) {
					var touched = $D.isDefined(domainTouched)? domainTouched:true;
					var changed = $D.isDefined(domainChanged)? domainChanged:true;
					var undoable = $D.isDefined(isUndoable)? isUndoable:true;
					this.Domain.group();
					if(touched) {
						if(changed) {
							if(!undoable) {
								this.Domain._timeline.pop();
								this.Domain._head--;
							} else {
								this.bottomBar.getComponent(5).setDisabled(false);
								this.bottomBar.getComponent(6).setDisabled(true);	
							}
						} else {
							this.Domain.undo();
							this.Domain._timeline.pop();
						}
					}
				},
				afterReanalyzeRequiredCommand: function() {
					var S = this.settings;
					if (S.autoAnalysis) {
						this.reanalyze(function(){
							this.refresh();
						})
					} else {
						this.refresh();
					}
				},
				printMessage : function(msg) {
					this.screenMessage = msg;
				},
				logMessage: function(msgobj) {
					this.logs.push(msgobj);
				},
				meshLine : function(l,n) {
					this.beforeUndoableCommand();
					var touched = true;
					var changed = true;
					var dm = this.Domain;
					var arr = [];
					if ($D.isArray(n)) {
						arr = n
					} else {
						for (var i = 1; i < n; i++) {
							arr.push(i/n);
						}
					}
					dm.splitLineElement (l, arr, true);
					var msg;
					if(changed) {
						msg = "mesh line "+ l.id + " into " + n + " segments";
						this.logMessage(msg);
					} else {
						msg = "do nothing";
					}
					this.afterUndoableCommand(touched,changed,true);
					this.printMessage(msg);
					this.afterReanalyzeRequiredCommand();
				},
				
				autoMesh: function(){
					this.beforeUndoableCommand();
					var touched = true;
					var changed = true;
					var dm = this.Domain;
					var sz = this.settings.autoMeshSize;
					var ratio = [];
					var n;
					var l;
					var ls = [];
					
					for (var i in dm.theElements) {
						if(dm.theElements.hasOwnProperty(i)) {
							ls.push(dm.theElements[i])
						}
					};
					
					for (var i=0; i < ls.length; i++) {
						l = ls[i];
						n = Math.round(l.getLength()/sz);
						ratio = [];
						for (var j=0; j < n-1; j++) {
							ratio.push((j+1)/n);
						};
						dm.splitLineElement (l, ratio, true);
					};

					var msg;
					if(changed) {
						msg = "auto mesh with size = "+ sz;
						this.logMessage(msg);
					} else {
						msg = "do nothing";
					}
					this.afterUndoableCommand(touched,changed,true);
					this.printMessage(msg);
					this.afterReanalyzeRequiredCommand();
					
				},
				
				sketchVocabulary : {
					"draw" : {
						"line" : "drawLine",
						"triangle" : "drawTriangle",
						"circle" : "drawCircle",
					},
					"load" : {
						"line" : "loadLine",
						"squareBracket" : "loadSquareBracket"
					}
				},
				sketchHandlers : {

					"noSuchGesture" : function() {
						var msg = "no such gesture :-(";
						// this.logMessage(msg);
						this.printMessage(msg);
						this.refresh();
					},
					"drawLine" : function(data) {
						this.beforeUndoableCommand();
						var dm = this.Domain;
						var S = this.settings;
						var fx = data.from.X;
						var fy = data.from.Y;
						var tx = data.to.X;
						var ty = data.to.Y;
						var n1 = dm.createNode(fx, fy);
						var n2 = dm.createNode(tx, ty);
						var changed = false;
						var touched = true;
						var nt = S.snapToNodeThreshold / S.viewPortScale;
						var lt = S.snapToLineThreshold / S.viewPortScale;
						var at = S.autoMergeNodeOnLineThreshold / S.viewPortScale
						if(S.snapToNode) {
							var np1 = dm.snapToNode(n1, nt);
							var np2 = dm.snapToNode(n2, nt);
							// var np1 = dm.snapToNode(n1, S.snapToNodeThreshold);
							// var np2 = dm.snapToNode(n2, S.snapToNodeThreshold);
							if(np1.capture && np2.capture) {
								if(np1.nodeId == n2.id || np2.nodeId == n1.id || np1.nodeId == np2.nodeId) {
									// dm.removeLineElement(e);
									// dm.removeNode(n1);
									// dm.removeNode(n2);
									changed = false;
								} else {
									n1 = dm.mergeNodes(n1, np1.node);
									n2 = dm.mergeNodes(n2, np2.node);
									// touched = true;
									changed = true;
								}
							} else if(np1.capture && !np2.capture) {
								n1 = dm.mergeNodes(n1, np1.node);
								// touched = true;
								changed = true;
							} else if(!np1.capture && np2.capture) {
								n2 = dm.mergeNodes(n2, np2.node);
								// touched = true;
								changed = true;
							} else {
								// touched = true;
								changed = true;
							}
						};
						
						if (!S.snapToNode || (!(np1.capture && np2.capture) && S.snapToLine)) {
							var nl1 = dm.snapToLine(n1, lt);
							var nl2 = dm.snapToLine(n2, lt);
							// var nl1 = dm.snapToLine(n1, S.snapToLineThreshold);
							// var nl2 = dm.snapToLine(n2, S.snapToLineThreshold);
							if ((nl1.capture && nl2.capture) && (nl1.lineId == nl2.lineId)) {
								changed = false
							} else {
								if (nl1.capture && Math.abs(nl1.ratio -1.0) > 0.01 && Math.abs(nl1.ratio) > 0.01){
									var nonnl1 = dm.splitLineElement(nl1.line,nl1.ratio);
									n1 = dm.mergeNodes(n1,nonnl1);
								}; 
								if (nl2.capture && Math.abs(nl2.ratio -1.0) > 0.01 && Math.abs(nl2.ratio) > 0.01) {
									var nonnl2 = dm.splitLineElement(nl2.line,nl2.ratio);
									n2 = dm.mergeNodes(n2,nonnl2);
								};
							};
						};
						
						if (S.snapToGrid) {
							var grid = S.grid;
							dm.transitNode(["theNodes",n1.id], Math.round(n1.X / grid) * grid - n1.X, Math.round(n1.Y / grid) * grid - n1.Y); 
							dm.transitNode(["theNodes",n2.id], Math.round(n2.X / grid) * grid - n2.X, Math.round(n2.Y / grid) * grid - n2.Y); 
							$D.iterate(dm.theNodes,function(n){
								if (n.id != n1.id && $D.distance(n,n1) < 0.01) {
									n1 = dm.mergeNodes(n1, n);
								};
								if (n.id != n2.id && $D.distance(n,n2) < 0.01) {
									n2 = dm.mergeNodes(n2, n);
								};
								
							});
							// dm.transitNode(n2.id, n2.X - Math.round(n2.X / grid) * grid, n2.Y - Math.round(n2.Y / grid) * grid); 
						};
						if (n1.id != n2.id) {
							var e = dm.createLineElement(S.defaultLineELementType, n1, n2, {
								geomTransf : dm.theGeomTransfs[S.defaultGeomTransfId]
							});
						} else {
							changed = false;
						}
						
						if (changed) {
							var ratios = [];
							var ns = [];
							$D.iterate(dm.theNodes,function(n){
								if (n.id != e.getFrom().id && n.id != e.getEnd().id) {
									var nl = dm.snapToLine(n, at);
									if (nl.capture && nl.lineId == e.id) {
									// if (nl.capture) {
										ratios.push(nl.ratio);
										ns.push(n);
									};
									
								}
							});
							if (ns.length > 0) {
								var narr = dm.splitLineElement(e, ratios);
								if (!$D.isArray(narr)) {
									narr = [narr]
								};
								for (var i=0; i < ns.length; i++) {
									dm.mergeNodes(ns[i],narr[i]);
									if (ns[i].SPC) {
										dm.set(["theNodes", narr[i].id, "SPC"], ns[i].SPC);
										dm.set(["theSPCs", ns[i].SPC.id, "node"], narr[i]);
									}
								};
							};
							
						};
						
						var msg;
						if(changed) {
							msg = "add a " + e.ComponetName;
							this.logMessage(msg);
						} else {
							msg = "nodes are merged, abort";
						}
						this.afterUndoableCommand(touched,changed,true);
						this.printMessage(msg);
						this.afterReanalyzeRequiredCommand();
						// this.refresh();
					},
					"drawTriangle" : function(data) {
						this.beforeUndoableCommand();
						var dm = this.Domain;
						var S = this.settings;
						var n = dm.createNode(data.from.X, data.from.Y);
						var changed;
						var np;
						var nt = S.SPCSnapToNodeThreshold/S.viewPortScale;
						var lt = S.SPCSnapToLineThreshold/S.viewPortScale;
						
						var temp = dm.snapTo4Direction(data.IndicativeAngle, S.SPCSnapToDirectionThreshold);
						// if(temp.capture) {
							// angle = temp.angle;
							// direction = temp.direction;
						// }
						// temp = {
							// node : n,
							// angle : angle,
							// show : show
						// };
						// if($D.isDefined(direction)) {
							// temp.direction = direction;
						// }
						// spc = new SPC(temp);
						// this.addComponent({
							// storeSelector : "theSPCs",
							// item : spc
						// });
						// //this.run("addAComponent", spc, this.theSPCs);
						// this.set("theNodes." + n.id + ".SPC", spc);
						
						
						var spc = dm.createSPC(n,{
							direction: temp.dir,
							angle : temp.angle
						});
						if(S.SPCSnapToNode) {
							// np = dm.snapToNode(n, S.SPCSnapToNodeThreshold);
							np = dm.snapToNode(n, nt);
							if(np.capture) {
								if(!$D.isDefined(np.node.SPC)) {
									dm.mergeNodes(n, np.node);
									dm.set(["theNodes", np.nodeId, "SPC"], spc);
									dm.set(["theSPCs", spc.id, "node"], np.node);
									changed = true;
								} else {
									// dm.removeNode(n);
									// dm.removeSPC(spc);
									changed = false;
								}
 							}
						}
						
						if (!S.snapToNode || (!(np && np.capture) && S.SPCSnapToLine)) {
							var nl = dm.snapToLine(n, lt);
							if (nl.capture){
								var nonnl = dm.splitLineElement(nl.line,nl.ratio);
								dm.mergeNodes(n,nonnl);
								dm.set(["theNodes", nonnl.id, "SPC"], spc);
								dm.set(["theSPCs", spc.id, "node"], nonnl);
								changed = true;
							}
						};

						if(changed) {
							var msg = "add a single point constraint";
							this.logMessage(msg);
						} else {
							var msg = "the point is already fixed, abort";
						}
						this.afterUndoableCommand(true, changed, true);
						this.printMessage(msg);
						this.afterReanalyzeRequiredCommand();
						// this.refresh();
					},
					"drawCircle" : function(data) {
						this.beforeUndoableCommand();
						var discard;
						var dm = this.Domain;
						var S = this.settings;
						var cen = data.Centroid;
						var top;
						var d = S.circleSnapToSPCThreshold + 10;
						var theSPC;
						var changed = false;
						$D.iterate(dm.theSPCs, function(spc) {
							var d1 = $D.distance(spc.node, cen);
							var d2 = $D.distance(spc.getBottomCenter(), cen);
							var tmp = (d1 < d2) ? d1 : d2;
							if(tmp < d) {
								d = tmp;
								top = (d1 < d2) ? true : false;
								theSPC = spc;
							}
						})
						if(theSPC && d < S.circleSnapToSPCThreshold) {
							if(top) {
								if(theSPC.RZ == 1) {
									dm.set(["theSPCs", theSPC.id, "RZ"], 0);
								}
							} else {
								if(theSPC.direction === "up" || theSPC.direction === "down") {
									if(theSPC.X == 1) {
										dm.set(["theSPCs", theSPC.id, "X"], 0);
									}
								} else if(theSPC.direction === "left" || theSPC.direction === "right") {
									if(theSPC.Y == 1) {
										dm.set(["theSPCs", theSPC.id, "Y"], 0);
									}
								}
							}
							changed = true;
						}

						var msg;
						if(changed) {
							if(top) {
								msg = "make a pin";
							} else {
								msg = "make a roller";
							}
							this.logMessage(msg);
						} else {
							msg = "do nothing";
						}
						
						var touched = changed;
						this.afterUndoableCommand(touched, changed, true);
						this.printMessage(msg);
						this.afterReanalyzeRequiredCommand();
						// this.refresh();
					},
					
					"loadLine" : function(data) {
						this.beforeUndoableCommand();
						var dm = this.Domain;
						var touched;
						var changed;
						var S = this.settings;
						var node;
						var freeEnd;
						var nodeAtArrowEnd;
						var dx, dy;
						var nt = S.loadSnapToNodeThreshold/S.viewPortScale;
						var lt = S.loadSnapToLineThreshold/S.viewPortScale;
						var np1 = dm.snapToNode(data.to, nt);
						var addOnNode = false;
						if (S.loadSnapToNode) {
							if (np1.capture) {
								node = np1.node;
								freeEnd = new $D.Node({
									X:data.from.X,
									Y:data.from.Y
								});
								
								nodeAtArrowEnd = true;
								dx = node.X - freeEnd.X;
								dy = node.Y - freeEnd.Y;
								addOnNode = true;
	
							} else {
								var np2 = dm.snapToNode(data.from, nt); 
								if (np2.capture) {
									node = np2.node;
									// freeEnd = data.to;
									freeEnd = new $D.Node({
										X:data.to.X,
										Y:data.to.Y
									});
									nodeAtArrowEnd = false;
									dx = freeEnd.X - node.X;
									dy = freeEnd.Y - node.Y;
									addOnNode = true;
								};
							};
						}
						
						
						if (!node && S.loadSnapToLine) {
							var nl = dm.snapToLine(data.to, lt);
							if (nl.capture){
								node = dm.splitLineElement(nl.line, nl.ratio, true);
								// freeEnd = data.from;
								freeEnd = new $D.Node({
									X:data.from.X,
									Y:data.from.Y,
									// constraintDirection:{
										// X : nl.line.getDx(),
										// Y : nl.line.getDy()
									// },
									// constraintOnLine:new $D.LineElement({
										// nodes : [{
											// X : nl.line.getFrom().X - data.to.X + data.from.X,
											// Y : nl.line.getFrom().Y - data.to.Y + data.from.Y
										// },{
											// X : nl.line.getEnd().X - data.to.X + data.from.X,
											// Y : nl.line.getEnd().Y - data.to.Y + data.from.Y
										// }]
									// })
								});
								nodeAtArrowEnd = true;
								dx = node.X - freeEnd.X;
								dy = node.Y - freeEnd.Y;
							} else {
								nl = dm.snapToLine(data.from, lt);
								if (nl.capture) {
									node = dm.splitLineElement(nl.line, nl.ratio, true);
									// freeEnd = data.to;
									freeEnd = new $D.Node({
										X:data.to.X,
										Y:data.to.Y,
										// constraintDirection:{
											// X : nl.line.getDx(),
											// Y : nl.line.getDy()
										// },
										// constraintOnLine:new $D.LineElement({
											// nodes : [{
												// X : nl.line.getFrom().X + data.to.X - data.from.X,
												// Y : nl.line.getFrom().Y + data.to.Y - data.from.Y
											// },{
												// X : nl.line.getEnd().X + data.to.X - data.from.X,
												// Y : nl.line.getEnd().Y + data.to.Y - data.from.Y
											// }]
										// })
									});
									nodeAtArrowEnd = false;
									dx = freeEnd.X - node.X;
									dy = freeEnd.Y - node.Y;
								}
							}
						};
						
						var load;
						if (node) {
							load = dm.createNodeLoad(node, freeEnd, nodeAtArrowEnd);
							// load = dm.createNodeLoad(node, freeEnd, nodeAtArrowEnd, dx, dy, 0.0);
							touched = true;
							changed = true;
							if (S.snapToGrid) {
								var grid = S.grid;
								
								if (load) {
									if (node) {
										dm.transitNode(["theNodes",node.id], Math.round(node.X / grid) * grid - node.X, Math.round(node.Y / grid) * grid - node.Y); 
										// dm.set(["theNodes",node.id,"X"],Math.round(node.X / grid) * grid)
										// dm.set(["theNodes",node.id, "Y"],Math.round(node.Y / grid) * grid)
										node.X = dm.theNodes[node.id].X;
										node.Y = dm.theNodes[node.id].Y;
										$D.iterate(dm.theNodes,function(n){
											if (n.id != node.id && $D.distance(n,node) < 0.01) {
												node = dm.mergeNodes(node, n);
											};
										});
									} 
									if (freeEnd) {
										dm.transitNode(["currentPattern","Loads",load.id,"freeEnd"], Math.round(freeEnd.X / grid) * grid - freeEnd.X, Math.round(freeEnd.Y / grid) * grid - freeEnd.Y); 
										freeEnd.X = load.freeEnd.X;
										freeEnd.Y = load.freeEnd.Y;
										// freeEnd.X = Math.round(freeEnd.X / grid) * grid;
										// freeEnd.Y = Math.round(freeEnd.Y / grid) * grid;
										// dm.set(["currentPattern","Loads",load.id,"freeEnd","X"],Math.round(freeEnd.X / grid) * grid)
										// dm.set(["currentPattern","Loads",load.id,"freeEnd","Y"],Math.round(freeEnd.Y / grid) * grid )
										$D.iterate(dm.theNodes,function(n){
											if (n.id != freeEnd.id && $D.distance(n,freeEnd) < 0.01) {
												freeEnd = dm.mergeNodes(freeEnd, n);
											};
										});
									} 
								}
								
							}
							if (freeEnd && !addOnNode) {
								dm.set(["currentPattern","Loads",load.id,"freeEnd","constraintOnLine"],new $D.LineElement({
									nodes : [{
										X : nl.line.getFrom().X + freeEnd.X - node.X,
										Y : nl.line.getFrom().Y + freeEnd.Y - node.Y,
									},{
										X : nl.line.getEnd().X + freeEnd.X - node.X,
										Y : nl.line.getEnd().Y + freeEnd.Y - node.Y,
									}]
								}))
							}
						} else {
							$D.iterate(dm.theNodes,function(n){
								if (!$D.isDefined(n.SPC)) {
									var fE = new $D.Node({
										X:n.X + data.to.X - data.from.X,
										Y:n.Y + data.to.Y - data.from.Y
									});
									load = dm.createNodeLoad(n, fE, false);
									touched = true;
									changed = true;
									
								}
							})
						}
						
						
						
						var msg;
						if(changed) {
							msg = "add a point load";
						} else {
							msg = "do nothing";
						}
						this.afterUndoableCommand(touched, changed, msg);
						this.printMessage(msg);
						this.afterReanalyzeRequiredCommand();
						// this.refresh();
					},
					"loadSquareBracket" : function(data) {
						this.beforeUndoableCommand();
						var flag;

						if(flag) {
							var msg = "add a uniform distributed load";
						}
						this.afterUndoableCommand(flag, msg);
						this.refresh();
					},
				},
				onPinchStart : function(e, el, obj) {
					var first = this.getCanvasCoordFromPage({
						X : e.touches[0].pageX,
						Y : e.touches[0].pageY
					}), second = this.getCanvasCoordFromPage({
						X : e.touches[1].pageX,
						Y : e.touches[1].pageY
					});
					this.pinchCenter0 = {
						X : 0.5 * (first.X + second.X),
						Y : 0.5 * (first.Y + second.Y)
					};
				},
				onPinch : function(e, el, obj) {
					if(!$D.isDefined(e.touches[0]) || !$D.isDefined(e.touches[1])) {
						return;
					}
					var first = this.getCanvasCoordFromPage({
						X : e.touches[0].pageX,
						Y : e.touches[0].pageY
					}), second = this.getCanvasCoordFromPage({
						X : e.touches[1].pageX,
						Y : e.touches[1].pageY
					}), s = e.scale, S = this.settings;
					this.pinchCenter1 = {
						X : 0.5 * (first.X + second.X),
						Y : 0.5 * (first.Y + second.Y)
					};
					if(S.viewPortScale * s < S.maxViewPortScale && S.viewPortScale * s > S.minViewPortScale) {
						this.deltaTransform(s, this.pinchCenter1.X - this.pinchCenter0.X * s, this.pinchCenter1.Y - this.pinchCenter0.Y * s);
					} else if(S.viewPortScale * s >= S.maxViewPortScale) {
						alert("max scale reached");
					} else {
						alert("min scale reached");
					}
				},
				onMouseWheel : function(event) {
					// console.log("event",event)
					var e = event.browserEvent, //
					S = this.settings, //
					s = Math.pow(Math.E, e.wheelDelta * S.mouseWheelSpeedFactor / S.mouseWheelSpeedBase), //
					P = this.getCanvasCoordFromPage({
						X : e.pageX,
						Y : e.pageY
					});

					if(S.viewPortScale * s < S.maxViewPortScale && S.viewPortScale * s > S.minViewPortScale) {
						S.viewPortShiftX = S.viewPortScale * P.X * (1 - s) + S.viewPortShiftX;
						S.viewPortShiftY = S.viewPortScale * P.Y * (1 - s) + S.viewPortShiftY;
						S.viewPortScale = S.viewPortScale * s;
					} else if(S.viewPortScale * s >= S.maxViewPortScale) {
						alert("max scale reached");
					} else {
						alert("min scale reached");
					}

					this.refresh();
				},
				onPinchEnd : function() {
					this.recordDeltaTransform();
					this.refresh();
				},
				autoScale: function() {
					this.settings.autoDeformationScale = true;
					this.settings.autoMomentScale = true;
					this.reanalyze(function(){
						this.refresh();
					})
					
				},
				clearAll : function() {
					var r = confirm("Restart the sketch: you can not undo this operation, are you sure?");
					if(r === true) {
						this.Domain.restart();
						this.bottomBar.getComponent(5).setDisabled(true);
						this.bottomBar.getComponent(6).setDisabled(true);
						this.refresh();
					}
				},
				undo : function() {
					this.Domain.undo();
					this.bottomBar.getComponent(6).setDisabled(false);
					if(this.Domain._head === -1) {
						this.bottomBar.getComponent(5).setDisabled(true);
					}

					if(this.settings.autoAnalysis) {
						this.reanalyze(function() {
							this.refresh();
						});
					} else {
						this.refresh();
					}
					this.logMessage("undo");

				},
				redo : function() {
					this.Domain.redo();
					this.bottomBar.getComponent(5).setDisabled(false);
					if(this.Domain._head === this.Domain._timeline.length - 1) {
						this.bottomBar.getComponent(6).setDisabled(true);
					}

					if(this.settings.autoAnalysis) {
						this.reanalyze(function() {
							this.refresh();
						});
					} else {
						this.refresh();
					}
					this.logMessage("redo");
				},
				saveScript : function() {
					alert(this.Domain.runStaticConstant(this.settings.modelScale, this.settings.loadScale));
				},
				showLog: function() {
					var str = "";
					str += "logs:\n";
					for (var i = 0; i < this.logs.length; i++) {
						str += this.logs[i] + "\n";
					}
					alert(str);
				},
				reanalyze : function(fn) {
					var args = Array.prototype.slice.call(arguments, 1), flag = false;
					if(this.Domain.isReadyToRun()) {
						if(this.settings.showMoment || this.settings.showDeformation) {
							$D.ajaxPost({
								url : "/cgi-bin/lge/sketchit-server.bak/test/sketchit.ops",
								scope : this,
								data : this.Domain.runStaticConstant(this.settings.showDeformation, this.settings.showMoment),
								success : function(result) {
									this.Domain.deformationAvailable = this.Domain.loadResultData(result.responseText);
									// this.Domain.loadResultData(result.responseText);
									// this.Domain.set("deformationAvailable", true);
									if(this.settings.autoDeformationScale) {
										var ascale = this.getAutoDeformationScale(this.settings.maxDeformationOnScreen)
										if(isFinite(ascale)) {
											this.settings.deformationScale = ascale;
											this.settings.autoDeformationScale = false;
										}
									}

									if(this.settings.autoMomentScale) {
										var mscale = this.getAutoMomentScale(this.settings.maxMomentOnScreen);
										if(isFinite(mscale)) {
											this.settings.momentScale = mscale;
											this.settings.autoMomentScale = false;
										}
									}
									if($D.isDefined(fn)) {
										fn.apply(this, args);
									}
								}
							});
							flag = true;
						}
					} else {
						// this.Domain.set("deformationAvailable", false);
						this.Domain.deformationAvailable = false;
					}
					if($D.isDefined(fn) && !flag) {
						fn.apply(this, args);
					}
				},
				nodeSnapAnimate : function(nodesBefore, nodesAfter, fn) {
					var count = 0, dt = 1000 / this.settings.snapAnimationFps, dx = [], dy = [], it, i, len = nodesBefore.length;
					max = this.settings.snapAnimationElapse * this.settings.snapAnimationFps / 1000;
					for( i = 0; i < len; i++) {
						dx.push((nodesAfter[i].X - nodesBefore[i].X) / max);
						dy.push((nodesAfter[i].Y - nodesBefore[i].Y) / max);
					}
					it = setInterval(function(scope) {
						for( i = 0; i < len; i++) {
							scope.Domain.moveNode(nodesBefore[i].id, dx[i], dy[i]);
						}
						scope.refresh()
						count++;
						if(count >= max) {
							clearInterval(it);
							fn.call(scope)
						}
					}, dt, this)
				}
			});
			window.Ctrl = sketchit.controllers.main;

			Ext.dispatch({
				controller : 'main',
				action : 'initAll'
			});

		}
	});

})();
