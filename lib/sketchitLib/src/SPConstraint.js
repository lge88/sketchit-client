(function() {
	window.sketchitLib = window.sketchitLib ? window.sketchitLib : {};
	var lib, SPConstraint, SPConstraintStore;
	lib = window.sketchitLib;
	SPConstraint = ut.extend(ut.Selectable, {
		ComponetName : "SPConstraint",
		defaults : {
			X : 1,
			Y : 1,
			RZ : 1,
			node : undefined,
			angle : -Math.PI / 2,
			direction : "up",
			isSelected : false,
			isShow : true,
		},
		toTcl : function() {
			if(this.X == 0 && this.Y == 0 && this.RZ == 0) {
				return "";
			} else {
				return "fix " + this.node.id + " " + this.X + " " + this.Y + " " + this.RZ;
			}
		},
		getBottomCenter : function() {
			return {
				X : this.node.X + this.triangleSize * Math.cos(this.angle),
				Y : this.node.Y + this.triangleSize * Math.sin(this.angle),
				SPC:this,
				bottom:true
			}
		},
		lineWidth : 2,
		normalStrokeStyle : [0, 0, 0, 255],
		selectedStrokeStyle : [255, 0, 255, 255],

		triangleSize : 20,
		groundLength : 40,
		groundThickness : 8,
		groundN : 10,
		pinRadius : 5,
		rollerRadius : 3,

		display : function(renderer, scale) {
			if(!this.isShow) {
				return false;
			} else {
				renderer.ctx.lineWidth = this.lineWidth / scale;
				if(this.isSelected) {
					renderer.ctx.strokeStyle = ut.array2rgba(this.selectedStrokeStyle);
				} else {
					renderer.ctx.strokeStyle = ut.array2rgba(this.normalStrokeStyle);
				}

				renderer.save();
				renderer.translate(this.node.X, this.node.Y);
				renderer.rotate(this.angle);
				renderer.ctx.beginPath();
				if(this.RZ === 0) {
					renderer.ctx.arc(0, 0, this.pinRadius, 0, Math.PI * 2, true);
					renderer.ctx.moveTo(this.pinRadius * Math.cos(Math.PI / 6), this.pinRadius * Math.sin(Math.PI / 6));
					renderer.ctx.lineTo(this.triangleSize, this.triangleSize * 0.5);
					renderer.ctx.lineTo(this.triangleSize, -this.triangleSize * 0.5);
					renderer.ctx.lineTo(this.pinRadius * Math.cos(Math.PI / 6), -this.pinRadius * Math.sin(Math.PI / 6));
				} else {
					renderer.ctx.moveTo(0, 0);
					renderer.ctx.lineTo(this.triangleSize, this.triangleSize * 0.5);
					renderer.ctx.lineTo(this.triangleSize, -this.triangleSize * 0.5);
					renderer.ctx.lineTo(0, 0);
				}
				if(this.X === 0 || this.Y === 0) {
					renderer.ctx.moveTo(this.triangleSize + 2 * this.rollerRadius, this.triangleSize * 0.5 - this.rollerRadius);
					renderer.ctx.arc(this.triangleSize + this.rollerRadius, this.triangleSize * 0.5 - this.rollerRadius, this.rollerRadius, 0, Math.PI * 2, true);
					renderer.ctx.moveTo(this.triangleSize + 2 * this.rollerRadius, -this.triangleSize * 0.5 + this.rollerRadius);
					renderer.ctx.arc(this.triangleSize + this.rollerRadius, -this.triangleSize * 0.5 + this.rollerRadius, this.rollerRadius, 0, Math.PI * 2, true);
					renderer.ctx.translate(this.triangleSize + 2 * this.rollerRadius, 0);
				} else {
					renderer.ctx.translate(this.triangleSize, 0);
				}

				renderer.ctx.moveTo(0, -this.groundLength * 0.5);
				renderer.ctx.lineTo(0, this.groundLength * 0.5);
				var k = -this.groundLength * 0.5, s = this.groundLength / this.groundN;

				while(k < this.groundLength * 0.5) {
					renderer.ctx.moveTo(0, k);
					renderer.ctx.lineTo(s, k + s);
					k += s;
				}

				renderer.ctx.stroke();
				renderer.restore();
				return true;
			}
		}
	});
	SPConstraintStore = ut.extend(ut.ObjectArrayStore, {
		model : SPConstraint,
		drawAll : function(renderer, scale) {
			var i;
			for( i = 0; i < this.max + 1; i++) {
				if(ut.isDefined(this[i])) {
					this[i].display(renderer, scale);
				}
			}
		}
	});

	lib.SPConstraint = SPConstraint;
	lib.SPConstraintStore = SPConstraintStore;
})();
