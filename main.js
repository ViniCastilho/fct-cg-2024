let cglib = {
	'canvas': document.querySelector('#cg-canvas'),
	'color': '#000000',
	'brush_size': 1,
};

cglib.resize = function (width, height) {
	cglib.canvas.height = height;
	cglib.canvas.width = width;
}

cglib.reset = function (width, height) {
	cglib.canvas = document.querySelector('#cg-canvas');
	cglib.color = '#000000';
	cglib.resize(height, width);
	let ctx = cglib.canvas.getContext('2d');
	ctx.fillStyle = '#FFFFFF';
	ctx.fillRect(0, 0, width, height);
	ctx.fillStyle = cglib.color;
}

cglib.draw = {};

// TODO: FIX
cglib.draw.bresenhamLine = function (x0, y0, x1, y1) {
	let dx = x1-x0;
	let dy = y1-y0;
	let is_x_greater = Math.abs(dx) >= Math.abs(dy);
	let g0 = null; let g1 = null;
	let l0 = null; let l1 = null;
	let gd = null; let ld = null;
	if (is_x_greater) {
		if (x1 < x0) {
			let aux = x1;
			x1 = x0;
			x0 = aux;
		}
		g0 = x0; g1 = x1;
		l0 = y0; l1 = y1;
		gd = dx;
		ld = dy;
	} else {
		if (y1 < y0) {
			let aux = y1;
			y1 = y0;
			y0 = aux;
		}
		g0 = y0; g1 = y1;
		l0 = x0; l1 = x1;
		gd = dy;
		ld = dx;
	}
	let ds = 2*ld - gd;
	let df = 2*ld;
	let dd = 2*(ld-gd);
	let g = g0;
	let l = l0;
	let ctx = cglib.canvas.getContext('2d');
	while (g < g1) {
		if (ds < 0) {
			ds += df;
			g++;
		} else {
			ds += dd;
			g++;
			l++;
		}
		if (is_x_greater) {
			ctx.fillRect(g, l, 1, 1);
		} else {
			ctx.fillRect(l, g, 1, 1);
		}
	}
}

cglib.draw.rootCircle = function (x, y, r) {
	let ctx = cglib.canvas.getContext('2d');
	for (let i = -r; i < r; i++) {
		let j = Math.sqrt(r*r - i*i);
		ctx.fillRect(i+x, Math.round(y+j), 1, 1);
		ctx.fillRect(i+x, Math.round(y-j), 1, 1);
	}
}

cglib.draw.paramCircle = function (x, y, r) {
	let ctx = cglib.canvas.getContext('2d');
	let step = Math.PI/(4*r);
	for (let n = 0; n < 2*Math.PI; n+=step) {
		let i = r*Math.cos(n);
		let j = r*Math.sin(n);
		ctx.fillRect(Math.round(x+i), Math.round(y+j), 1, 1);
	}
}

cglib.reset(256, 256);
cglib.draw.rootCircle(128, 128, 16);
cglib.draw.paramCircle(128, 128, 32);
cglib.draw.bresenhamLine(255,255,200,200);