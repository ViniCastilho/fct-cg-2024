/*
	RESTANTE:
	7) Recorte usando Cohen-Sutherland.

//*/

const PX0 = 0;
const PY0 = 1;
const PX1 = 2;
const PY1 = 3;

let cglib = {
	'clr_r': document.querySelector('#clr-r'),
	'clr_g': document.querySelector('#clr-g'),
	'clr_b': document.querySelector('#clr-b'),
	'clr_h': document.querySelector('#clr-h'),
	'clr_s': document.querySelector('#clr-s'),
	'clr_v': document.querySelector('#clr-v'),
	'color': '#000000',
	'canvas': document.querySelector('#cg-canvas'),
	'window': [null, null, null, null],
	'window_text': document.querySelector('#window-text'),
	'matrix': [],
	'context': null,
	'brush_size': 1,
	'tool': null,
	'pos': [null, null],
	'tool_text': document.querySelector('#curr-tool'),
	'pos_text': document.querySelector('#first-point'),
	'to_hsv': document.querySelector('#btn-to-hsv'),
	'to_rgb': document.querySelector('#btn-to-rgb'),
};

cglib.cohenSutherland = function (x0, y0, x1, y1) {
	let f0 = 0;
	let f1 = 0;

	if (x0 < cglib.window[PX0]) { f0 += 1; }
	if (x0 > cglib.window[PX1]) { f0 += 2; }
	if (y0 < cglib.window[PY0]) { f0 += 4; }
	if (y0 > cglib.window[PY1]) { f0 += 8; }

	if (x1 < cglib.window[PX0]) { f1 += 1; }
	if (x1 > cglib.window[PX1]) { f1 += 2; }
	if (y1 < cglib.window[PY0]) { f1 += 4; }
	if (y1 > cglib.window[PY1]) { f1 += 8; }

	console.log(f0, f1); 
	if (f0 == 0 && f1 == 0) {
		return [x0, y0, x1, y1];
	} else if ((f0 & f1 != 0)) {
		console.log(f0 & f1);
		return [null, null, null, null];
	} else {
		let m = (y1-y0)/(x1-x0);
		let values = [x0, y0, x1, y1];
		let src = [x0, y0, x1, y1];
		let plane = f0;
		let inc = 0;
		if (f0 == 0) {
			plane = f1;
			inc = 2;
		}
		let vx = inc;
		let vy = inc + 1;
		if (plane & 1 == 1) { // Esquerda
			let ny = m * (cglib.window[PX0] - src[vx]) + src[vy];
			if (ny >= cglib.window[PY0] && ny <= cglib.window[PY1]) {
				let c = Math.floor(inc/2);
				if (src[vx] > src[vy]) { c++; }
				if (c % 2 == 0) {
					values[PX0] = cglib.window[PX0];
					values[PY0] = ny;	
				} else {
					values[PX1] = cglib.window[PX0];
					values[PY1] = ny;
				}
			}
		}
		if (f0 & 2 == 1) { // Direita
			let ny = m * (cglib.window[PX1] - src[vx]) + src[vy];
			if (ny >= gclib.window[PY0] && ny <= cglib.window[PY1]) {
				let c = Math.floor(inc/2);
				if (src[vx] > src[vy]) { c++; }
				if (c % 2 == 0) {
					values[PX1] = cglib.window[PX1];
					values[PY1] = ny;	
				} else {
					values[PX0] = cglib.window[PX1];
					values[PY0] = ny;
				}
			}
		}
		if (f0 & 8 == 1) { // Acima
			let nx = (cglib.window[PY0] - src[vy]) / m + src[vx];
			if (nx >= cglib.window[PX0] && nx <= cglib.window[PX1]) {
				let c = Math.floor(inc/2);
				if (src[vx] > src[vy]) { c++; }
				if (c % 2 == 0) {
					values[PX0] = nx;
					values[PY0] = cglib.window[PY0];
				} else {
					values[PX1] = nx;
					values[PY1] = cglib.window[PY0];
				}
			}
		}
		if (f0 & 4 == 1) { // Abaixo
			let nx = (cglib.window[PY1] - src[vy]) / m + src[vx];
			if (nx >= cglib.window[PX0] && nx <= cglib.window[PX1]) {
				let c = Math.floor(inc/2);
				if (src[vx] > src[vy]) { c++; }
				if (c % 2 == 0) {
					values[PX0] = nx;
					values[PY0] = cglib.window[PY1];
				} else {
					values[PX1] = nx;
					values[PY1] = cglib.window[PY1];
				}
			}
		}
		return [values[PX0], values[PY0], values[PX1], values[PY1]];
	}
}

cglib.rotateCanvas = function (angle) {
	let aux = cglib.matrix;
	cglib.matrix = [];
	for (let i = 0; i < cglib.canvas.height; i++) {
		cglib.matrix.push([]);
		for (let j = 0; j < cglib.canvas.width; j++) {
			cglib.matrix[i].push('#FFFFFF');
		}
	}
	let s = Math.sin(angle);
	let c = Math.cos(angle);
	let h = cglib.canvas.height/2;
	let w = cglib.canvas.width/2;
	for (let i = 0; i < cglib.canvas.height; i++) {
		for (let j = 0; j < cglib.canvas.width; j++) {
			let x = Math.round((j-w)*c - (i-h)*s);
			let y = Math.round((j-w)*s + (i-h)*c);
			cglib.color = aux[i][j];
			cglib.draw.pixel(x+w, y+h);
		}
	}
	cglib.color = "#000000";
}

document.querySelector('#btn-rotateLeft90').addEventListener('click', function () { cglib.rotateCanvas(Math.PI/2); });
document.querySelector('#btn-rotateRight90').addEventListener('click', function () { cglib.rotateCanvas(-Math.PI/2); });

document.querySelector('#btn-clear').addEventListener('click', function () {
	cglib.reset(cglib.canvas.height, cglib.canvas.width);
});

cglib.canvas.addEventListener('click', function (ev) {
	let x1 = ev.offsetX;
	let y1 = ev.offsetY;
	if (cglib.window[0] == null) {
		cglib.window[0] = x1;
		cglib.window[1] = y1;
		cglib.window_text.innerHTML = `Janela definida: (${x1},${y1}), (_,_)`;
	} else if (cglib.window[2] == null) {
		if (x1 < cglib.window[0]) {
			cglib.window[2] = cglib.window[0];
			cglib.window[0] = x1;
		} else {
			cglib.window[2] = x1;
		}
		if (y1 < cglib.window[1]) {
			cglib.window[3] = cglib.window[1];
			cglib.window[1] = y1;
		} else {
			cglib.window[3] = y1;
		}
		cglib.window_text.innerHTML = `Janela definida: (${cglib.window[0]},${cglib.window[1]}), (${cglib.window[2]},${cglib.window[3]})`;
		cglib.color = '#FFFFFF';
		for (let i = cglib.window[1]; i <= cglib.window[3]; i++) {
			for (let j = cglib.window[0]; j < cglib.window[2]; j++) {
				cglib.draw.pixel(j, i);
			}
		}
		cglib.color = '#000000';
	} else if (cglib.tool == null) {
		return;
	} else if (cglib.pos[0] == null) {
		cglib.pos[0] = x1;
		cglib.pos[1] = y1;
		cglib.pos_text.innerHTML = `Ponto inicial: (${x1},${y1})`;
	} else {
		let x0 = cglib.pos[0];
		let y0 = cglib.pos[1];
		if (cglib.tool.includes('Circle')) {
			let r = Math.sqrt(
				(x1-x0)**2 + (y1-y0)**2
			);
			cglib.draw[cglib.tool](x0, y0, r);
		} else {
			cglib.draw[cglib.tool](x0, y0, x1, y1);
		}
		cglib.pos[0] = null;
		cglib.pos[1] = null;
		cglib.pos_text.innerHTML = 'Ponto inicial: (_,_)';
	}
})

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
		cglib.clr_h.value = ((cglib.clr_h.value % 6) + 6) * 60;
	} else {
		cglib.clr_h.value = (cglib.clr_h.value % 6) * 60;
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
	cglib.window_text.innerHTML = `Janela definida: (_,_), (_,_)`
	cglib.matrix = [];
	cglib.window = [null, null, null, null];
	for (let i = 0; i < height; i++) {
		cglib.matrix.push([]);
		for (let j = 0; j < width; j++) {
			cglib.matrix[i].push('#AAAAAA');
		}
	}
	cglib.color = '#000000';
	cglib.resize(height, width);
	cglib.context = cglib.canvas.getContext('2d');
	cglib.context.fillStyle = '#AAAAAA';
	cglib.context.fillRect(0, 0, width, height);
	cglib.context.fillStyle = cglib.color;
}

cglib.draw = {};

cglib.draw.pixel = function (x, y) {
	if (x < cglib.window[0] || y < cglib.window[1]) { return; }
	if (x > cglib.window[2] || y > cglib.window[3]) { return; }
	cglib.matrix[y][x] = cglib.color;
	cglib.context.fillStyle = cglib.color;
	cglib.context.fillRect(x, y, 1, 1);
}

cglib.draw.slopeLine = function (x0, y0, x1, y1) {
	let out = cglib.cohenSutherland(x0, y0, x1, y1);
	console.log(out);
	if (out[0] == null) { console.log('fuck');return; }
	x0 = out[PX0]; y0 = out[PY0]; x1 = out[PX1]; y1 = out[PY1];
	
	if (Math.max(Math.abs(x1-x0), Math.abs(y1-y0)) == 0) {
		cglib.draw.pixel(x0, y0, 1, 1);
		return;
	}
	if (Math.abs(x1-x0) > Math.abs(y1-y0)) { // Horizontal line
		if (x1 < x0) {
			let aux = x1; x1 = x0; x0 = aux;
			aux = y1; y1 = y0; y0 = aux;
		}
		let dtx = x1-x0;
		let dty = y1-y0;
		if (dty == 0) {
			for (let i = x0; i <= x1; i++) {
				cglib.draw.pixel(i, y0, 1, 1);
			}
		} else {
			let m = dty/dtx;
			for (let i = x0; i <= x1; i++) {
				cglib.draw.pixel(i, Math.round(m*(i-x1)+y1), 1, 1);
			}
		}
	} else { // Vertical line
		if (y1 < y0) {
			let aux = y1; y1 = y0; y0 = aux;
			aux = x1; x1 = x0; x0 = aux;
		}
		let dtx = x1-x0;
		let dty = y1-y0;
		if (dtx == 0) {
			for (let i = y0; i <= y1; i++) {
				cglib.draw.pixel(x0, i, 1, 1);
			}
		} else {
			let m = dty/dtx;
			for (let i = y0; i <= y1; i++) {
				cglib.draw.pixel(Math.round((i-y1)/m+x1), i, 1, 1);
			}
		}
	}
}

cglib.draw.paramLine = function (x0, y0, x1, y1) {
	let out = cglib.cohenSutherland(x0, y0, x1, y1);
	console.log(out);
	if (out[0] == null) { console.log('fuck');return; }
	x0 = out[PX0]; y0 = out[PY0]; x1 = out[PX1]; y1 = out[PY1];
	
	let dtx = x1-x0;
	let dty = y1-y0;
	let step = 1/Math.max(Math.abs(dtx), Math.abs(dty));
	for (let t = 0; t < 1; t+=step) {
		cglib.draw.pixel(Math.round(x0+dtx*t), Math.round(y0+dty*t), 1, 1);
	}
}

cglib.draw.bresenhamLine = function (x0, y0, x1, y1) {
	let out = cglib.cohenSutherland(x0, y0, x1, y1);
	console.log(out);
	if (out[0] == null) { console.log('fuck');return; }
	x0 = out[PX0]; y0 = out[PY0]; x1 = out[PX1]; y1 = out[PY1];

	if (Math.abs(x1-x0) > Math.abs(y1-y0)) { // Horizontal line
		if (x1 < x0) {
			let aux = x1; x1 = x0; x0 = aux;
			aux = y1; y1 = y0; y0 = aux;
		}
		let dtx = x1-x0;
		let dty = y1-y0;
		let inc = 1; if (y1 < y0) { inc = -1; dty = -dty; }
		let vd = 2*(dty)-dtx;
		let cy = y0;
		for (let i = x0; i < x1; i++) {
			cglib.draw.pixel(i, cy);
			if (vd > 0) {
				cy += inc;
				vd += 2*(dty-dtx);
			} else {
				vd += 2*dty;
			}
		}
	} else { // Vertical line
		if (y1 < y0) {
			let aux = y1; y1 = y0; y0 = aux;
			aux = x1; x1 = x0; x0 = aux;
		}
		let dtx = x1-x0;
		let dty = y1-y0;
		let inc = 1; if (x1 < x0) { inc = -1; dtx = -dtx; }
		let vd = 2*(dtx)-dty;
		let cx = x0;
		for (let i = y0; i < y1; i++) {
			cglib.draw.pixel(cx, i);
			if (vd > 0) {
				cx += inc;
				vd += 2*(dtx-dty);
			} else {
				vd += 2*dtx;
			}
		}
	}
}

cglib.draw.rootCircle = function (x, y, r) {
	for (let i = 0; i < r; i++) {
		let j = Math.sqrt(r*r - i*i);
		cglib.draw.pixel(i+x, Math.round(y+j), 1, 1);
		cglib.draw.pixel(i+x, Math.round(y-j), 1, 1);
		cglib.draw.pixel(x-i, Math.round(y+j), 1, 1);
		cglib.draw.pixel(x-i, Math.round(y-j), 1, 1);
	}
}

cglib.draw.paramCircle = function (x, y, r) {
	let step = Math.PI/(4*r);
	for (let n = 0; n < Math.PI/2; n+=step) {
		let i = r*Math.cos(n);
		let j = r*Math.sin(n);
		cglib.draw.pixel(Math.round(x+i), Math.round(y+j), 1, 1);
		cglib.draw.pixel(Math.round(x+i), Math.round(y-j), 1, 1);
		cglib.draw.pixel(Math.round(x-i), Math.round(y+j), 1, 1);
		cglib.draw.pixel(Math.round(x-i), Math.round(y-j), 1, 1);
	}
}

cglib.draw.rotationCircle = function (x, y, r) {
	let cx = r;
	let cy = 0;
	let step = Math.PI/r;
	let ts = Math.sin(step);
	let tc = Math.cos(step);
	for (let i = 0; i < Math.PI/2; i+=step) {
		let nx = cx*tc - cy*ts;
		cy = cx*ts + cy*tc;
		cx = nx;
		cglib.draw.pixel(Math.round(x+cx), Math.round(y+cy), 1, 1);
		cglib.draw.pixel(Math.round(x+cx), Math.round(y-cy), 1, 1);
		cglib.draw.pixel(Math.round(x-cx), Math.round(y+cy), 1, 1);
		cglib.draw.pixel(Math.round(x-cx), Math.round(y-cy), 1, 1);
	}
}

cglib.draw.bresenhamCircle = function (x, y, r) {
	let cx = r;
	let cy = 0;
	if (r > 0) {
		cglib.draw.pixel(Math.round(x+cx), Math.round(y-cy), 1, 1);
		cglib.draw.pixel(Math.round(x+cy), Math.round(y+cx), 1, 1);
		cglib.draw.pixel(Math.round(x-cy), Math.round(y+cx), 1, 1);
	}
	let p = 1-r;
	while (cx > cy) {
		cy++;
		if (p <= 0) {
			p += 2*cy + 1;
		} else {
			cx--;
			p += 2*(cy-cx) + 1;
		}
		if (cx < cy) { break; }
		cglib.draw.pixel(Math.round(x+cx), Math.round(y+cy), 1, 1);
		cglib.draw.pixel(Math.round(x+cx), Math.round(y-cy), 1, 1);
		cglib.draw.pixel(Math.round(x-cx), Math.round(y+cy), 1, 1);
		cglib.draw.pixel(Math.round(x-cx), Math.round(y-cy), 1, 1);
		if (cx != cy) {
			cglib.draw.pixel(Math.round(x+cy), Math.round(y+cx), 1, 1);
			cglib.draw.pixel(Math.round(x+cy), Math.round(y-cx), 1, 1);
			cglib.draw.pixel(Math.round(x-cy), Math.round(y+cx), 1, 1);
			cglib.draw.pixel(Math.round(x-cy), Math.round(y-cx), 1, 1);
		}
	}
}

Object.keys(cglib.draw).forEach(function (k) {
	let btn = document.querySelector(`#btn-${k}`);
	if (btn != null) {
		btn.addEventListener('click', function () {
			cglib.tool = k;
			cglib.tool_text.innerHTML = `Ferramenta: ${k}`;
		});
	}
});

cglib.reset(288, 288);