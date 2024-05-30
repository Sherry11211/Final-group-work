let circles = [];
let circleDiameter = 180; //Diameter of the main circle
let spacing = 35; // Spacing between circles
let offsetX = -10; // Offset of all circles to the left
let offsetY = -20; // Offset of all circles moving up

let specialCircleColor = [255, 255, 0]; // special circle is Yellow
let redLineStrokeWeight = 0.8; // redlinestrokeweight 
let redLineSpikes = 130; // Number of corners of the red line, 16
let goldLineStrokeWeight = 3; //  goldenlinestrokeweight 
let goldLineSpikes = 16; // Number of corners of the gold line, 16

let isMoving = false; // Control the movement of the graphic
let selectedCircleIndex = -1; // Index of selected circle
let isDragging = false; // Track mouse drag state

function setup() {
    createCanvas(windowWidth, windowHeight); // Creating a window-sized canvas
    noLoop(); // Stop the continuous execution of the draw function, the screen is still
    noStroke(); //
    initializeCircles(); //
  }
  function initializeCircles() {
    circles = []; //Clear all circles
  
  // Add to circles array
  let y = circleDiameter / 2;
  while (y < height + circleDiameter) {
    let x = circleDiameter / 2;
    while (x < width + circleDiameter) {
      let angle = random(TWO_PI);  
      let hasArc = random() > 0.5;  
      let styleType = random(['goldZigzag', 'multiLayeredRings']); // Randomize style selection
      circles.push({
        x: x + offsetX,
        y: y + offsetY,
        d: circleDiameter,
        colors: generateColors(),
        startAngle: angle,
        hasArc: hasArc,
        styleType: styleType,  
        vx: random(-2, 2), // Random x-direction velocity
        vy: random(-2, 2)  
      });
      x += circleDiameter + spacing;
    }
    y += circleDiameter + spacing;
  }

  // Randomly select two concentric circle groups
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

function mouseClicked() {
  if (selectedCircleIndex !== -1) {
      // If a circle is already selected, check whether to click on it again
      let c = circles[selectedCircleIndex];
      let d = dist(mouseX, mouseY, c.x, c.y);
      if (d < c.d / 2) {
          selectedCircleIndex = -1; // Uncheck
          isDragging = false; // Disable mouse dragging
          return; 
      }
  }

  // Check if the click is on another circle
  for (let i = 0; i < circles.length; i++) {
      let c = circles[i];
      let d = dist(mouseX, mouseY, c.x, c.y);
      if (d < c.d / 2) { // f the click is within a circle
          selectedCircleIndex = i; //selected
          isDragging = true; // dragging
          break; 
      }
  }
}

function mouseReleased() {
    isDragging = false; // stop dragging
}

  function draw() {
    background(50, 100, 150);
  
    // Update the position of the circle and handle collisions
    if (isMoving) {
      for (let i = 0; i < circles.length; i++) {
        let c = circles[i];
        c.x += c.vx;
        c.y += c.vy;
  
        // Collision detection and bouncing
        if (c.x < c.d / 2 || c.x > width - c.d / 2) {
          c.vx *= -1;
        }
        if (c.y < c.d / 2 || c.y > height - c.d / 2) {
          c.vy *= -1;
        }
      }
    }
  
    // Draw all circles and other shapes
    for (let i = 0; i < circles.length; i++) {
      let c = circles[i];
      let radii = [c.d, c.d * 0.55, c.d * 0.5, c.d * 0.25, c.d * 0.15, c.d * 0.1, c.d * 0.05]; // 主圆及内部圆的大小
  
      if (i === selectedCircleIndex) { // if choose
        // If the circle is selected, set its position to the mouse position
        c.x = mouseX;
        c.y = mouseY;
      }
  
      if (c.isSpecial) {
        drawSpecialCirclePattern(c.x, c.y, radii, c.colors, c.styleType);
      } else {
        drawCirclePattern(c.x, c.y, radii, c.colors, c.styleType);
      }
    }
  
    // orangecircles
    drawOrangeCircles(circles);
  
    // Drawing patterns on orange circles
    for (let i = 0; i < circles.length; i++) {
      let c = circles[i];
      drawPatternOnRing(c.x, c.y, c.d / 2 + 15);
    }
  
    // Pink Arc
    for (let i = 0; i < circles.length; i++) {
      let c = circles[i];
      if (c.hasArc) { // Checks if arcs need to be drawn
        drawArcThroughCenter(c.x, c.y, c.d / 2, c.startAngle);
      }
    }
  
    // redlines
    drawRedLinesInSpecialCircles();

    if (isDragging && selectedCircleIndex !== -1) {
        let c = circles[selectedCircleIndex];
        c.x = mouseX;
        c.y = mouseY;
  }
}

function drawCirclePattern(x, y, radii, colors, styleType) {
  let numRings = radii.length; // number
  for (let i = 0; i < numRings; i++) {
    fill(colors[i % colors.length]); // color
    ellipse(x, y, radii[i], radii[i]); // 
    if (i == 0) { // Draw white dots only between the largest circle and the second largest circle
      fillDotsOnCircle(x, y, radii[0] / 2, radii[1] / 2); // Fill dots to entire circle
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
  fill(specialCircleColor); // Setting the largest circle as a special color
  ellipse(x, y, radii[0], radii[0]); // Largest circle

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

  let numSpikes = redLineSpikes; // Number of sharp corners
  let angleStep = TWO_PI / numSpikes; // angle

  beginShape();
  for (let i = 0; i < numSpikes; i++) {
    // Calculate the position of the outer circle point (interval between the first and second great circles)
    let angle = i * angleStep;
    let outerX = cx + cos(angle) * outerRadius;
    let outerY = cy + sin(angle) * outerRadius;
    vertex(outerX, outerY); // Adding outer circle points

    // Calculate the position of the inner circle point (shrink it inward a bit)
    let innerX = cx + cos(angle + angleStep / 2) * innerRadius;
    let innerY = cy + sin(angle + angleStep / 2) * innerRadius;
    vertex(innerX, innerY); // Add inner circle point
  }
  endShape(CLOSE);

  pop();
}

function drawGoldZShape(cx, cy, outerRadius, innerRadius) {
  push();
  stroke(255, 215, 0); // golden
  strokeWeight(goldLineStrokeWeight); 
  noFill();

  let numSpikes = goldLineSpikes; // Number of sharp corners
  let angleStep = TWO_PI / numSpikes; // angle

  beginShape();
  for (let i = 0; i < numSpikes; i++) {
    // Calculate the position of the outer circle point (interval between the outer and inner circles)
    let angle = i * angleStep;
    let outerX = cx + cos(angle) * outerRadius;
    let outerY = cy + sin(angle) * outerRadius;
    vertex(outerX, outerY); // Add outer circle points

    // Calculate the position of the inner circle point (shrink it inward a bit
    let innerX = cx + cos(angle + angleStep / 2) * innerRadius;
    let innerY = cy + sin(angle + angleStep / 2) * innerRadius;
    vertex(innerX, innerY); // Add inner circle point
  }
  endShape(CLOSE);

  pop();
}

function drawMultiLayeredRings(cx, cy, thirdRadius, fourthRadius) {
  push();
  let colors = [
    color(255, 0, 121),  // Pink
    color(0, 179, 255)    // Blue
  ];
  strokeWeight(3);
  noFill();
  let numRings = 5; // Number of rings
  let radiusStep = (thirdRadius - fourthRadius) / numRings; // Radius step

  for (let j = 0; j < numRings; j++) {
    stroke(colors[j % colors.length]); // Set stroke color
    ellipse(cx, cy, thirdRadius * 2 - j * radiusStep, thirdRadius * 2 - j * radiusStep);
  }

  pop(); // Restore previous drawing settings
}

function drawGreenLayeredRings(cx, cy, fourthRadius, fifthRadius) {
  push();
  let colors = [
    color(68, 106, 55),  // Dark Green
    color(168, 191, 143) // Light Green
  ];
  strokeWeight(3);
  noFill();
  let numRings = 4; // Number of rings
  let radiusStep = (fourthRadius - fifthRadius) / numRings; // Radius step

  for (let j = 0; j < numRings; j++) {
    stroke(colors[j % colors.length]); // Set stroke color
    ellipse(cx, cy, fourthRadius * 2 - j * radiusStep, fourthRadius * 2 - j * radiusStep);
  }

  pop(); // Restore previous drawing settings
}

function drawOrangeCircles(circles) {
  for (let i = 0; i < circles.length; i++) {
    let c = circles[i];
    let arcRadius = c.d / 2 + 15; // Radius of the arc, adjustable
    stroke(255, 165, 0); // Orange color
    strokeWeight(2.5);
    noFill();
    ellipse(c.x, c.y, arcRadius * 2, arcRadius * 2); // Draw complete circle
  }
}

function drawPatternOnRing(cx, cy
  , radius) {
  let numPatterns = 8; // Number of patterns, reducing density
  let angleStep = TWO_PI / numPatterns; // Angle between each pattern
push();
  for (let i = 0; i < numPatterns; i++) {
    let angle = i * angleStep;
    let x = cx + cos(angle) * radius;
    let y = cy + sin(angle) * radius;
    // Draw red circle
    fill(200, 0, 0);
    ellipse(x, y, 10, 10);
    // Draw yellow circle
    let angleOffset = angleStep / 3;
    let xOffset = cx + cos(angle + angleOffset) * radius;
    let yOffset = cy + sin(angle + angleOffset) * radius;
    fill(255, 255, 0);
    ellipse(xOffset, yOffset, 6, 6);
    // Draw black ring
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

function drawArcThroughCenter(x, y, radius, startAngle) {
  push();
  let baseColor = color(255, 20, 147); // Original pink color
  let shadowColor = lerpColor(baseColor, color(0), 0.25); // Generate darker pink shadow

  strokeWeight(6); // Set line width
  noFill(); // No fill

  // Calculate start and end points of the arc based on startAngle
  let endX = x + cos(startAngle - PI / 4) * radius * 1.5;
  let endY = y + sin(startAngle - PI / 4) * radius * 1.5;

  // Draw shadow
  stroke(shadowColor); // Use darker pink as shadow color
  drawCurvedLine(x, y + 3, endX, endY + 3);

  // Draw main arc
  stroke(baseColor); // Use original pink
  drawCurvedLine(x, y, endX, endY);

  pop(); // Restore previous drawing settings
}

function drawCurvedLine(x1, y1, x2, y2) {
  // Calculate control points to make the curve arc-shaped
  let cx1 = (x1 + x2) / 2 + (y2 - y1) * 0.5;
  let cy1 = (y1 + y2) / 2 - (x2 - x1) * 0.5;

  // Use quadratic bezier curve to draw the arc
  noFill();
  beginShape();
  vertex(x1, y1);
  quadraticVertex(cx1, cy1, x2, y2);
  endShape();
}

function fillDotsOnCircle(cx, cy, outerRadius, innerRadius) {
  let numDots = 24; 
  let angleStep = TWO_PI / numDots; // Angle between each dot

  for (let i = 0; i < numDots; i++) {
    let angle = i * angleStep;
    let radius = random(innerRadius, outerRadius); // random radius
    let x = cx + cos(angle) * radius;
    let y = cy + sin(angle) * radius;
    fill(255); // white dots
    ellipse(x, y, 6, 6); 
  }
}

function generateColors() {
  // Returns a set of colors for drawing concentric circles.
  return [
    color(random(255), random(255), random(255)),
    color(random(255), random(255), random(255)),
    color(random(255), random(255), random(255)),
    color(random(255), random(255), random(255))
  ];
}
//Interactive keyboard function keys “1, 2, 3, 4, 5, 0”
function keyPressed() {
    if (key === '1') {
      // Moving/Stop Moving Graphics
      isMoving = !isMoving;
      if (isMoving) {
        loop(); // start
      } else {
        noLoop(); // stop
      }
    } else if (key === '2') {
      // Scroll right
      for (let i = 0; i < circles.length; i++) {
        circles[i].vx = 5.5; // speed
      }
      isMoving = true; 
      loop(); 
    } else if (key === '0') {
      // Clear the canvas and reinitialize the circle
      background(50, 100, 150);
      initializeCircles(); 
      redraw(); 
      noLoop(); 
      isMoving = false; 
    } else if (key === '3') {
      //Scroll left
      for (let i = 0; i < circles.length; i++) {
        circles[i].vx = -10; // speed
      }
      isMoving = true; 
      loop(); 
    } else if (key === '4') {
      // Move all circles toward the mouse position
      for (let i = 0; i < circles.length; i++) {
        let c = circles[i];
        let angle = atan2(mouseY - c.y, mouseX - c.x); // Calculate the angle pointing to the mouse
        c.vx = cos(angle) * 10; // Set the x position toward the mouse
        c.vy = sin(angle) * 10; // Set the y position toward the mouse
      }
      isMoving = true; 
      loop(); 
    } else if (key === '5') {
      // Circle randomly varying in size
      for (let i = 0; i < circles.length; i++) {
        let c = circles[i];
        // Randomized radius values 
        c.d = random(3, 27) * 10;
      }
      redraw(); 
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  circles = [];
  setup(); // Regenerate circles
  redraw();
}