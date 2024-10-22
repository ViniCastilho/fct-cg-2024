/*
	RESTANTE:
	4) Desenhar circunferência usando Pixels
		b) Eq. Paramétrica com simetria
	5) Desenhar circunferência c/ Bresenham (2a diferênça + simetria)
	6) Transformações e Projeção - Casinha
	7) Recorte usando Cohen-Sutherland.

//*/

let cglib = {
	'clr_r': document.querySelector('#clr-r'),
	'clr_g': document.querySelector('#clr-g'),
	'clr_b': document.querySelector('#clr-b'),
	'clr_h': document.querySelector('#clr-h'),
	'clr_s': document.querySelector('#clr-s'),
	'clr_v': document.querySelector('#clr-v'),
	'canvas': document.querySelector('#cg-canvas'),
	'color': '#000000',
	'brush_size': 1,
	'to_hsv': document.querySelector('#btn-to-hsv'),
	'to_rgb': document.querySelector('#btn-to-rgb'),
};

cglib.to_hsv.addEventListener('click', function () {
	let rf = cglib.clr_r.value/255;
	let gf = cglib.clr_g.value/255;
	let bf = cglib.clr_b.value/255;
	let cmax = Math.max(rf,gf,bf);
	let cmin = Math.min(rf,gf,bf);
	let delta = cmax-cmin;
	if (delta == 0) {
		cglib.clr_h.value = 0;
	} else if (cmax == rf) {
		cglib.clr_h.value = (Math.PI/3)*((gf - bf) / delta);
	} else if (cmax == gf) {
		cglib.clr_h.value = (Math.PI/3)*(((bf - rf) / delta) + 2);
	} else {
		cglib.clr_h.value = (Math.PI/3)*(((rf - gf) / delta) + 4);
	}
	if (cglib.clr_h.value < 0) {
		cglib.clr_h.value = Math.floor(((cglib.clr_h.value % 6) + 6) * 60);
	} else {
		cglib.clr_h.value = Math.floor((cglib.clr_h.value % 6) * 60);
	}
	if (cmax == 0) {
		cglib.clr_s.value = 0;
	} else {
		cglib.clr_s.value = delta/cmax;
	}
	cglib.clr_v.value = cmax;
});

cglib.to_rgb.addEventListener('click', function () {
	let hf = cglib.clr_h.value/60;
	let sf = cglib.clr_s.value;
	let vf = cglib.clr_v.value;
	let ca = vf*(1-sf);
	let cb = vf*(1-(hf-Math.floor(hf))*sf);
	let cc = vf*(1-(1-(hf-Math.floor(hf)))*sf);
	if (hf < 1) {
		cglib.clr_r.value = Math.floor(vf*255);
		cglib.clr_g.value = Math.floor(cc*255);
		cglib.clr_b.value = Math.floor(ca*255);
	} else if (hf < 2) {
		cglib.clr_r.value = Math.floor(cb*255);
		cglib.clr_g.value = Math.floor(vf*255);
		cglib.clr_b.value = Math.floor(ca*255);
	} else if (hf < 3) {
		cglib.clr_r.value = Math.floor(ca*255);
		cglib.clr_g.value = Math.floor(vf*255);
		cglib.clr_b.value = Math.floor(cc*255);
	} else if (hf < 4) {
		cglib.clr_r.value = Math.floor(ca*255);
		cglib.clr_g.value = Math.floor(cb*255);
		cglib.clr_b.value = Math.floor(vf*255);
	} else if (hf < 5) {
		cglib.clr_r.value = Math.floor(cc*255);
		cglib.clr_g.value = Math.floor(ca*255);
		cglib.clr_b.value = Math.floor(vf*255);
	} else {
		cglib.clr_r.value = Math.floor(vf*255);
		cglib.clr_g.value = Math.floor(ca*255);
		cglib.clr_b.value = Math.floor(cb*255);
	}
});

cglib.resize = function (width, height) {
	cglib.canvas.height = height;
	cglib.canvas.width = width;
}

cglib.reset = function (width, height) {
	cglib.clr_r.value = 0;
	cglib.clr_g.value = 0;
	cglib.clr_b.value = 0;
	cglib.clr_h.value = 0;
	cglib.clr_s.value = 0;
	cglib.clr_v.value = 0;
	cglib.canvas = document.querySelector('#cg-canvas');
	cglib.color = '#000000';
	cglib.resize(height, width);
	let ctx = cglib.canvas.getContext('2d');
	ctx.fillStyle = '#FFFFFF';
	ctx.fillRect(0, 0, width, height);
	ctx.fillStyle = cglib.color;
}

cglib.draw = {};

cglib.draw.slopeLine = function (x0, y0, x1, y1) {
	let ctx = cglib.canvas.getContext('2d');
	if (x0 > x1) { let aux = x0; x0 = x1; x1 = aux; }
	if (y0 > y1) { let aux = y0; y0 = y1; y1 = aux; }
	let dtx = x1-x0;
	let dty = y1-y0;
	if (Math.max(dtx,dty) == 0) {
		ctx.fillRect(x0, y0, 1, 1);
		return;
	}
	if (dtx > dty) { // Horizontal line
		if (dty == 0) {
			for (let i = x0; i <= x1; i++) {
				ctx.fillRect(i, y0, 1, 1);
			}
		} else {
			let m = dty/dtx;
			for (let i = x0; i <= x1; i++) {
				ctx.fillRect(i, Math.round(m*(i-x1)+y1), 1, 1);
			}
		}
	} else { // Vertical line
		if (dty == 0) {
			for (let i = y0; i <= y1; i++) {
				ctx.fillRect(x0, i, 1, 1);
			}
		} else {
			let m = dty/dtx;
			for (let i = y0; i <= y1; i++) {
				ctx.fillRect(Math.round((i-y1)/m+x1), i, 1, 1);
			}
		}
	}
}

cglib.draw.paramLine = function (x0, y0, x1, y1) {
	let ctx = cglib.canvas.getContext('2d');
	if (x0 > x1) { let aux = x0; x0 = x1; x1 = aux; }
	if (y0 > y1) { let aux = y0; y0 = y1; y1 = aux; }
	let dtx = x1-x0;
	let dty = y1-y0;
	let step = 1/Math.max(dtx,dty);
	for (let t = 0; t < 1; t+=step) {
		ctx.fillRect(Math.round(x0+dtx*t), Math.round(y0+dty*t), 1, 1);
	}
}

cglib.draw.bresenhamLine = function (x0, y0, x1, y1) {
	let ctx = cglib.canvas.getContext('2d');
	if (x0 > x1) { let aux = x0; x0 = x1; x1 = aux; }
	if (y0 > y1) { let aux = y0; y0 = y1; y1 = aux; }
	let dtx = x1-x0;
	let dty = y1-y0;
	if (dtx > dty) { // Horizontal line
		let dv = (2*dty)-dtx;
		let cy = y0;
		for (let i = x0; i <= x1; i++) {
			ctx.fillRect(i, cy, 1, 1);
			if (dv > 0) {
				cy++;
				dv += 2*(dty-dtx);
			} else {
				dv += 2*dty;
			}
		}
	} else { // Vertical line
		let dv = (2*dty)-dtx;
		let cx = x0;
		for (let i = y0; i <= y1; i++) {
			ctx.fillRect(cx, i, 1, 1);
			if (dv > 0) {
				cx++;
				dv += 2*(dtx-dty);
			} else {
				dv += 2*dtx;
			}
		}
	}
}

cglib.draw.rootCircle = function (x, y, r) {
	let ctx = cglib.canvas.getContext('2d');
	for (let i = 0; i < r; i++) {
		let j = Math.sqrt(r*r - i*i);
		ctx.fillRect(i+x, Math.round(y+j), 1, 1);
		ctx.fillRect(i+x, Math.round(y-j), 1, 1);
		ctx.fillRect(x-i, Math.round(y+j), 1, 1);
		ctx.fillRect(x-i, Math.round(y-j), 1, 1);
	}
}

cglib.draw.paramCircle = function (x, y, r) {
	let ctx = cglib.canvas.getContext('2d');
	let step = Math.PI/(4*r);
	for (let n = 0; n < Math.PI/2; n+=step) {
		let i = r*Math.cos(n);
		let j = r*Math.sin(n);
		ctx.fillRect(Math.round(x+i), Math.round(y+j), 1, 1);
		ctx.fillRect(Math.round(x+i), Math.round(y-j), 1, 1);
		ctx.fillRect(Math.round(x-i), Math.round(y+j), 1, 1);
		ctx.fillRect(Math.round(x-i), Math.round(y-j), 1, 1);
	}
}

cglib.reset(256, 256);
cglib.draw.slopeLine(0,0,0,0);
cglib.draw.paramLine(16,16,32,64);
cglib.draw.rootCircle(128,128,80);
cglib.draw.rootCircle(128,128,72);
cglib.draw.paramCircle(128,128,32);
cglib.draw.paramCircle(128,128,40);
cglib.draw.bresenhamLine(255,255,200,200);
cglib.draw.bresenhamLine(128,128,200,255);