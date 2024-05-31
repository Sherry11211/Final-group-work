let circles = [];
let circleDiameter = 180; 
let spacing = 35; 
let offsetX = -10; 
let offsetY = -20; 

let specialCircleColor = [255, 255, 0]; // yellow
let redLineStrokeWeight = 0.8; 
let redLineSpikes = 130; 
let goldLineStrokeWeight = 3; 
let goldLineSpikes = 16; 

let isMoving = false; // Used to control the movement of graphics

function setup() {
    createCanvas(windowWidth, windowHeight); 
    noLoop(); 
    noStroke(); 
    initializeCircles(); // Initialise all circles
  }
  function initializeCircles() {
    circles = []; // Clear all circles
  
  // Initialise information about all circles and add to the circles array
  let y = circleDiameter / 2;
  while (y < height + circleDiameter) {
    let x = circleDiameter / 2;
    while (x < width + circleDiameter) {
      let angle = random(TWO_PI);  
      let hasArc = random() > 0.5;  // 50% chance of having an arc.
      let styleType = random(['goldZigzag', 'multiLayeredRings']); 
      circles.push({
        x: x + offsetX,
        y: y + offsetY,
        d: circleDiameter,
        colors: generateColors(),
        startAngle: angle,
        hasArc: hasArc,
        styleType: styleType,  
        vx: random(-2, 2), // Random x-direction velocity
        vy: random(-2, 2)  //y
      });
      x += circleDiameter + spacing;
    }
    y += circleDiameter + spacing;
  }

  // Randomly select two groups of concentric circles
  let selectedIndices = [];
  while (selectedIndices.length < 2) {
    let index = floor(random(circles.length));
    if (!selectedIndices.includes(index)) {
      selectedIndices.push(index);
    }
  }

  // Update the properties of the two concentric circles
  for (let i = 0; i < selectedIndices.length; i++) {
    circles[selectedIndices[i]].isSpecial = true;
  }
}

function draw() {
    background(50, 100, 150); 
  
    // Update the position of the circle and handle collisions
    if (isMoving) {
      for (let i = 0; i < circles.length; i++) {
        let c = circles[i];
        c.x += c.vx;
        c.y += c.vy;
  
        //Collision detection and rebound
        if (c.x < c.d / 2 || c.x > width - c.d / 2) {
          c.vx *= -1;
        }
        if (c.y < c.d / 2 || c.y > height - c.d / 2) {
          c.vy *= -1;
        }
      }
    } else {
      // While pressing the ‘4’ key, let the circle converge towards the mouse position
      for (let i = 0; i < circles.length; i++) {
        let c = circles[i];
        // Calculate the angle to point to the mouse position
        let angle = atan2(mouseY - c.y, mouseX - c.x);
        // Set the x and y direction speeds towards the mouse position.
        c.vx = cos(angle) * 2;
        c.vy = sin(angle) * 2;
      }
    }
  
    // Draw all circles and other shapes
    for (let i = 0; i < circles.length; i++) {
      let c = circles[i];
      let radii = [c.d, c.d * 0.55, c.d * 0.5, c.d * 0.25, c.d * 0.15, c.d * 0.1, c.d * 0.05]; // 主圆及内部圆的大小
  
      if (c.isSpecial) {
        drawSpecialCirclePattern(c.x, c.y, radii, c.colors, c.styleType);
      } else {
        drawCirclePattern(c.x, c.y, radii, c.colors, c.styleType);
      }
    }
  
    // orange rings
    drawOrangeCircles(circles);
  
    // Drawing a pattern on an orange circle
    for (let i = 0; i < circles.length; i++) {
      let c = circles[i];
      drawPatternOnRing(c.x, c.y, c.d / 2 + 15);
    }
  
    // drawing pink arcs
    for (let i = 0; i < circles.length; i++) {
      let c = circles[i];
      if (c.hasArc) {  //Check if arcs need to be drawn
        drawArcThroughCenter(c.x, c.y, c.d / 2, c.startAngle);
      }
    }
  
    // Draw red lines in each of the two special sets of concentric circles
    drawRedLinesInSpecialCircles();
  }

function drawCirclePattern(x, y, radii, colors, styleType) {
  let numRings = radii.length; // Number of concentric circles
  for (let i = 0; i < numRings; i++) {
    fill(colors[i % colors.length]); 
    ellipse(x, y, radii[i], radii[i]); 
    if (i == 0) { // Draw white dots only between the largest circle and the second largest circle
      fillDotsOnCircle(x, y, radii[0] / 2, radii[1] / 2); // Fill dots to the whole circle
    }
    if (i == 2 && i + 1 < numRings) { // Drawing between the third and fourth largest circles according to style
      if (styleType === 'goldZigzag') {
        drawGoldZShape(x, y, radii[2] / 2, radii[3] / 2);
      } else if (styleType === 'multiLayeredRings') {
        drawMultiLayeredRings(x, y, radii[2] / 2, radii[3] / 2);
      }
    }
    if (styleType === 'multiLayeredRings' && i == 3 && i + 1 < numRings) {
      drawGreenLayeredRings(x, y, radii[3] / 2, radii[4] / 2);
    }
  }
}

function drawSpecialCirclePattern(x, y, radii, colors, styleType) {
  fill(specialCircleColor); // Setting the largest circle as a special colour
  ellipse(x, y, radii[0], radii[0]); // Drawing the largest circle

  // Draw other circles, skipping the drawing of the white dots
  for (let i = 1; i < radii.length; i++) {
    fill(colors[i % colors.length]);
    ellipse(x, y, radii[i], radii[i]);
  }

  if (styleType === 'goldZigzag') {
    drawGoldZShape(x, y, radii[2] / 2, radii[3] / 2);
  } else if (styleType === 'multiLayeredRings') {
    drawMultiLayeredRings(x, y, radii[2] / 2, radii[3] / 2);
  }
}

function drawRedLinesInSpecialCircles() {
  let specialCircles = circles.filter(c => c.isSpecial);
  for (let i = 0; i < specialCircles.length; i++) {
    let c = specialCircles[i];
    drawRedLine(c.x, c.y, c.d / 2, c.d * 0.55 / 2);
  }
}

function drawRedLine(cx, cy, outerRadius, innerRadius) {
  push();
  stroke(255, 0, 0); // red
  strokeWeight(redLineStrokeWeight); 
  noFill(); 

  let numSpikes = redLineSpikes; 
  let angleStep = TWO_PI / numSpikes; 

  beginShape();
  for (let i = 0; i < numSpikes; i++) {
    // Calculate the position of the outer circle point (interval between the first and second great circles)
    let angle = i * angleStep;
    let outerX = cx + cos(angle) * outerRadius;
    let outerY = cy + sin(angle) * outerRadius;
    vertex(outerX, outerY); // 添加外圈点

    // Calculate the position of the inner circle point (shrink it inwards a bit)
    let innerX = cx + cos(angle + angleStep / 2) * innerRadius;
    let innerY = cy + sin(angle + angleStep / 2) * innerRadius;
    vertex(innerX, innerY); //Add inner circle point
  }
  endShape(CLOSE);

  pop();
}

function drawGoldZShape(cx, cy, outerRadius, innerRadius) {
  push();
  stroke(255, 215, 0); // golden
  strokeWeight(goldLineStrokeWeight);
  noFill(); 

  let numSpikes = goldLineSpikes; 
  let angleStep = TWO_PI / numSpikes; 

  beginShape();
  for (let i = 0; i < numSpikes; i++) {
    // Calculate the position of the outer circle point (interval between the outer and inner circles)
    let angle = i * angleStep;
    let outerX = cx + cos(angle) * outerRadius;
    let outerY = cy + sin(angle) * outerRadius;
    vertex(outerX, outerY); // Adding Outer Circle Points

    // Calculate the position of the inner circle point (shrink it inwards a bit)
    let innerX = cx + cos(angle + angleStep / 2) * innerRadius;
    let innerY = cy + sin(angle + angleStep / 2) * innerRadius;
    vertex(innerX, innerY); //Add inner circle point
  }
  endShape(CLOSE);

  pop();
}

function drawMultiLayeredRings(cx, cy, outerRadius, innerRadius) {
  push();
  stroke(255); // white
  strokeWeight(0.5); 
  noFill();

  let numRings = 5; 
  let ringStep = (outerRadius - innerRadius) / numRings; // Radius difference between each level

  for (let i = 0; i <= numRings; i++) {
    let radius = outerRadius - i * ringStep;
    ellipse(cx, cy, radius * 2, radius * 2); // rings
  }

  pop();
}

function drawGreenLayeredRings(cx, cy, outerRadius, innerRadius) {
  push();
  stroke(0, 255, 0); // green
  strokeWeight(0.5); 
  noFill(); 

  let numRings = 3; 
  let ringStep = (outerRadius - innerRadius) / numRings; 

  for (let i = 0; i <= numRings; i++) {
    let radius = outerRadius - i * ringStep;
    ellipse(cx, cy, radius * 2, radius * 2); 
  }

  pop();
}

function drawOrangeCircles(circles) {
  for (let i = 0; i < circles.length; i++) {
    let c = circles[i];
    stroke(255, 165, 0); // orange
    strokeWeight(3);
    noFill();
    ellipse(c.x, c.y, c.d + 30, c.d + 30); // Drawing an orange circle outside an existing circle
  }
}

function drawPatternOnRing(cx, cy, radius) {
    let numPatterns = 8; 
    let angleStep = TWO_PI / numPatterns;
  
    push(); 
  
    for (let i = 0; i < numPatterns; i++) {
      let angle = i * angleStep;
      let x = cx + cos(angle) * radius;
      let y = cy + sin(angle) * radius;
  
      //yellow circle
      let angleOffset = angleStep / 3;
      let xOffset = cx + cos(angle + angleOffset) * radius;
      let yOffset = cy + sin(angle + angleOffset) * radius;
      fill(255, 255, 0);
      ellipse(xOffset, yOffset, 6, 6);
  
      // black rings
      let angleOffset2 = angleStep / 3 * 2;
      let xOffset2 = cx + cos(angle + angleOffset2) * radius;
      let yOffset2 = cy + sin(angle + angleOffset2) * radius;
      fill(0);
      ellipse(xOffset2, yOffset2, 21, 21);
      fill(255);
      ellipse(xOffset2, yOffset2, 7, 7);
    }
  
    pop(); 
  }

function drawArcThroughCenter(cx, cy, radius, startAngle) {
  push();
  stroke(255, 182, 193); // pink
  strokeWeight(3);
  noFill();

  let arcAngle = PI / 4; // Angular range of arcs
  let endAngle = startAngle + arcAngle;

  arc(cx, cy, radius * 2, radius * 2, startAngle, endAngle);

  pop();
}

//random dots
function fillDotsOnCircle(cx, cy, outerRadius, innerRadius) {
  let numDots = 30; 
  let angleStep = TWO_PI / numDots; 

  for (let i = 0; i < numDots; i++) {
    let angle = i * angleStep;
    let radius = random(innerRadius, outerRadius); 
    let x = cx + cos(angle) * radius;
    let y = cy + sin(angle) * radius;
    fill(255); // white
    ellipse(x, y, 5, 5); 
  }
}

function generateColors() {
  // Returns a set of colours for drawing concentric circles.
  return [
    color(random(255), random(255), random(255)),
    color(random(255), random(255), random(255)),
    color(random(255), random(255), random(255)),
    color(random(255), random(255), random(255))
  ];
}
//0\1\2
function keyPressed() {
    if (key === '1') {
      //stop moving
      isMoving = !isMoving;
      if (isMoving) {
        loop(); // start
      } else {
        noLoop(); // stop
      }
    } else if (key === '2') {
      // Scroll right from the initial position
      for (let i = 0; i < circles.length; i++) {
        circles[i].vx = 5.5; //  Setting the speed to move to the right
      }
      isMoving = true;
      loop(); 
    } else if (key === '0') {
      // Clear the canvas and reinitialise the circle
      background(50, 100, 150); // Clearing the canvas
      initializeCircles(); 
      redraw();
      noLoop(); 
      isMoving = false; // Disable Mobile
    } else if (key === '3') {
      // Scroll left from the initial position
      for (let i = 0; i < circles.length; i++) {
        circles[i].vx = -10; //speed
      }
      isMoving = true;
      loop(); 
    } else if (key === '4') {
      // Move all circles towards the mouse position
      for (let i = 0; i < circles.length; i++) {
        let c = circles[i];
        let angle = atan2(mouseY - c.y, mouseX - c.x); 
        c.vx = cos(angle) * 10; // Set the x-direction speed towards the mouse position
        c.vy = sin(angle) * 10; 
      }
      isMoving = true; 
      loop(); 
    } else if (key === '5') {
      // When the ‘5’ key is pressed, the circle changes size randomly.
      for (let i = 0; i < circles.length; i++) {
        let c = circles[i];
        c.d = random(3, 27) * 10;
      }
      redraw(); 
    }
  } 
  
