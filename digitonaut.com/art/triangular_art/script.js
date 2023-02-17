let palette = ["#EDF7F5", "#B7D7D8", "#FF8984", "#204E5F", "#FFC6A8"];
let points = [];

function setup() {
	createCanvas(min(windowWidth, windowHeight),min(windowWidth, windowHeight));
	colorMode(HSB, 360, 100, 100, 100);
	angleMode(DEGREES);
	// frameRate(1);
}

function draw() {
	background(0, 0, 90);
	points = [];
	randomSeed(frameCount / 100);
	let offset = width / 20;
	let lineStep = 30;

	noFill();

	push();
	// drawingContext.setLineDash([lineStep,lineStep/2]);
	// drawingContext.lineDashOffset = frameCount % (lineStep * 1.5);
	beginShape();
	for (let i = 0; i < 100; i++) {
		let x = random(offset, width - offset);
		let y = random(offset, height - offset);
		let p = createVector(x, y);
		strokeWeight(1);
		vertex(x, y);
		points.push(p);
	}
	endShape();
	pop();
	for (let i = 0; i < points.length - 2; i++) {
		let a = points[i];
		let b = points[i + 1];
		let c = points[i + 2];
		let ba = p5.Vector.sub(a, b);
		let bc = p5.Vector.sub(c, b);
		let dist = min(p5.Vector.dist(a, b), p5.Vector.dist(c, b));
		let _cos = (ba.x * bc.x + ba.y * bc.y) / (sqrt(sq(ba.x) + sq(ba.y)) * (sqrt(sq(bc.x) + sq(bc.y))));
		let angle = acos(_cos);
		let p = createVector(cos(angle) * 10, sin(angle) * 10);
		let angle_bc = (360 + atan2(c.y - b.y, c.x - b.x)) % 360;
		let angle_ba = (360 + atan2(a.y - b.y, a.x - b.x)) % 360;
		push();
		translate(b.x, b.y);
		push();
		strokeWeight(1);
		let d = dist * sin(angle + frameCount + i * 20);

		//map(angle, 0, 180, 50, 150);
		fill(random(palette));
		// fill(0, 0, 100);
		if (round(((angle_bc - angle_ba) + 360) % 360, 2) == round(angle, 2)) {
			rotate(angle_ba);
			drawSeparatedArc(0, 0, d, d, 0, angle, PIE, palette.concat());
		} else {
			rotate(angle_bc);
			drawSeparatedArc(0, 0, d, d, 0, angle, PIE, palette.concat());
		}
		// let x = cos(angle / 2) * d/2;
		// let y = sin(angle / 2) * d/2;
		// ellipse(x, y, 10, 10);
		pop();
		pop();
	}

	let g = get();
	clear();
	push();
	drawingContext.shadowColor = color(0, 0, 0);
	drawingContext.shadowBlur = offset;
	image(g, 0, 0);
	pop();
	// noLoop();
}

function drawSeparatedArc(x, y, w, h, sa, ea, SHAPE = PIE, colors) {
	let angle = ea - sa;
	let currentAngle = sa;
	let angleStep = random(max(angle / 2, 10));
	let c, pc;
	while (currentAngle < ea) {
		while (pc == c) c = random(colors);
		fill(c);
		strokeJoin(ROUND);
		arc(x, y, w, h, currentAngle, currentAngle + angleStep, SHAPE);
		currentAngle += angleStep;
		angleStep = random(max(angle / 2, 10));
		if (currentAngle + angleStep > ea) {
			angleStep = ea - currentAngle;
		}
		pc = c;
	}
}