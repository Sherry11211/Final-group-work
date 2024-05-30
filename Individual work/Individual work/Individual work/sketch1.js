let circles = [];
let circleDiameter = 180; // 主圆的直径，可以调整
let spacing = 35; // 圆圈之间的间距，可以调整
let offsetX = -10; // 所有圆向左移动的偏移量，可以调整
let offsetY = -20; // 所有圆向上移动的偏移量，可以调整

let specialCircleColor = [255, 255, 0]; // 特殊圆的颜色，默认黄色
let redLineStrokeWeight = 0.8; // 红线的宽度，默认3
let redLineSpikes = 130; // 红线的角的个数，默认16
let goldLineStrokeWeight = 3; // 金线的宽度，默认3
let goldLineSpikes = 16; // 金线的角的个数，默认16

let isMoving = false; // 用于控制图形的移动

function setup() {
    createCanvas(windowWidth, windowHeight); // 创建根据窗口大小调整画布
    noLoop(); // 停止draw函数连续执行，画面静止
    noStroke(); // 画圆时不显示边框
    initializeCircles(); // 初始化所有圆形
  }
  function initializeCircles() {
    circles = []; // 清空所有圆形
  
  // 初始化所有圆的信息，并加入到circles数组中
  let y = circleDiameter / 2;
  while (y < height + circleDiameter) {
    let x = circleDiameter / 2;
    while (x < width + circleDiameter) {
      let angle = random(TWO_PI);  // 随机起始角度
      let hasArc = random() > 0.5;  // 50% 的几率决定是否有弧线你 
      let styleType = random(['goldZigzag', 'multiLayeredRings']); // 随机选择风格
      circles.push({
        x: x + offsetX,
        y: y + offsetY,
        d: circleDiameter,
        colors: generateColors(),
        startAngle: angle,
        hasArc: hasArc,
        styleType: styleType,  // 存储风格类型
        vx: random(-2, 2), // 随机x方向速度
        vy: random(-2, 2)  // 随机y方向速度
      });
      x += circleDiameter + spacing;
    }
    y += circleDiameter + spacing;
  }

  // 随机选择两个同心圆组
  let selectedIndices = [];
  while (selectedIndices.length < 2) {
    let index = floor(random(circles.length));
    if (!selectedIndices.includes(index)) {
      selectedIndices.push(index);
    }
  }

  // 更新这两个同心圆的属性
  for (let i = 0; i < selectedIndices.length; i++) {
    circles[selectedIndices[i]].isSpecial = true;
  }
}

function draw() {
  background(50, 100, 150); // 设置背景颜色

  // 更新圆的位置并处理碰撞
  if (isMoving) {
    for (let i = 0; i < circles.length; i++) {
      let c = circles[i];
      c.x += c.vx;
      c.y += c.vy;

      // 碰撞检测并反弹
      if (c.x < c.d / 2 || c.x > width - c.d / 2) {
        c.vx *= -1;
      }
      if (c.y < c.d / 2 || c.y > height - c.d / 2) {
        c.vy *= -1;
      }
    }
  }

  // 绘制所有圆和其他图形
  for (let i = 0; i < circles.length; i++) {
    let c = circles[i];
    let radii = [c.d, c.d * 0.55, c.d * 0.5, c.d * 0.25, c.d * 0.15, c.d * 0.1, c.d * 0.05]; // 主圆及内部圆的大小

    if (c.isSpecial) {
      drawSpecialCirclePattern(c.x, c.y, radii, c.colors, c.styleType);
    } else {
      drawCirclePattern(c.x, c.y, radii, c.colors, c.styleType);
    }
  }

  // 绘制橘色圆环
  drawOrangeCircles(circles);

  // 在橘色圆环上绘制图案
  for (let i = 0; i < circles.length; i++) {
    let c = circles[i];
    drawPatternOnRing(c.x, c.y, c.d / 2 + 15);
  }

  // 最后绘制粉色弧线，确保它们在最顶层
  for (let i = 0; i < circles.length; i++) {
    let c = circles[i];
    if (c.hasArc) {  // 检查是否需要绘制弧线
      drawArcThroughCenter(c.x, c.y, c.d / 2, c.startAngle);
    }
  }

  // 在两组特殊的同心圆中分别绘制红线
  drawRedLinesInSpecialCircles();
}

function drawCirclePattern(x, y, radii, colors, styleType) {
  let numRings = radii.length; // 同心圆的数量
  for (let i = 0; i < numRings; i++) {
    fill(colors[i % colors.length]); // 设置填充颜色
    ellipse(x, y, radii[i], radii[i]); // 绘制圆形
    if (i == 0) { // 只在最大的圆和第二大的圆之间绘制白色点
      fillDotsOnCircle(x, y, radii[0] / 2, radii[1] / 2); // 填充圆点到整个圆
    }
    if (i == 2 && i + 1 < numRings) { // 在第三大和第四大圆之间根据风格绘制
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
  fill(specialCircleColor); // 设置最大的圆为特殊颜色
  ellipse(x, y, radii[0], radii[0]); // 绘制最大的圆

  // 绘制其他的圆，跳过白色小圆点的绘制
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
  stroke(255, 0, 0); // 红色
  strokeWeight(redLineStrokeWeight); // 设置线条宽度
  noFill(); // 不填充

  let numSpikes = redLineSpikes; // 尖角的数量
  let angleStep = TWO_PI / numSpikes; // 每个尖角之间的角度

  beginShape();
  for (let i = 0; i < numSpikes; i++) {
    // 计算外圈点位置（第一大圆和第二大圆的区间）
    let angle = i * angleStep;
    let outerX = cx + cos(angle) * outerRadius;
    let outerY = cy + sin(angle) * outerRadius;
    vertex(outerX, outerY); // 添加外圈点

    // 计算内圈点位置（向内收缩一些）
    let innerX = cx + cos(angle + angleStep / 2) * innerRadius;
    let innerY = cy + sin(angle + angleStep / 2) * innerRadius;
    vertex(innerX, innerY); // 添加内圈点
  }
  endShape(CLOSE);

  pop();
}

function drawGoldZShape(cx, cy, outerRadius, innerRadius) {
  push();
  stroke(255, 215, 0); // 金色
  strokeWeight(goldLineStrokeWeight); // 设置线条宽度
  noFill(); // 不填充

  let numSpikes = goldLineSpikes; // 尖角的数量
  let angleStep = TWO_PI / numSpikes; // 每个尖角之间的角度

  beginShape();
  for (let i = 0; i < numSpikes; i++) {
    // 计算外圈点位置（外层圆和内层圆的区间）
    let angle = i * angleStep;
    let outerX = cx + cos(angle) * outerRadius;
    let outerY = cy + sin(angle) * outerRadius;
    vertex(outerX, outerY); // 添加外圈点

    // 计算内圈点位置（向内收缩一些）
    let innerX = cx + cos(angle + angleStep / 2) * innerRadius;
    let innerY = cy + sin(angle + angleStep / 2) * innerRadius;
    vertex(innerX, innerY); // 添加内圈点
  }
  endShape(CLOSE);

  pop();
}

function drawMultiLayeredRings(cx, cy, outerRadius, innerRadius) {
  push();
  stroke(255); // 白色
  strokeWeight(0.5); // 线条宽度
  noFill(); // 不填充

  let numRings = 5; // 层数
  let ringStep = (outerRadius - innerRadius) / numRings; // 每层之间的半径差

  for (let i = 0; i <= numRings; i++) {
    let radius = outerRadius - i * ringStep;
    ellipse(cx, cy, radius * 2, radius * 2); // 画圆环
  }

  pop();
}

function drawGreenLayeredRings(cx, cy, outerRadius, innerRadius) {
  push();
  stroke(0, 255, 0); // 绿色
  strokeWeight(0.5); // 线条宽度
  noFill(); // 不填充

  let numRings = 3; // 层数
  let ringStep = (outerRadius - innerRadius) / numRings; // 每层之间的半径差

  for (let i = 0; i <= numRings; i++) {
    let radius = outerRadius - i * ringStep;
    ellipse(cx, cy, radius * 2, radius * 2); // 画圆环
  }

  pop();
}

function drawOrangeCircles(circles) {
  for (let i = 0; i < circles.length; i++) {
    let c = circles[i];
    stroke(255, 165, 0); // 橘色
    strokeWeight(3);
    noFill();
    ellipse(c.x, c.y, c.d + 30, c.d + 30); // 在现有的圆外绘制橘色圆环
  }
}

function drawPatternOnRing(cx, cy, radius) {
  push();
  noFill();
  stroke(255, 192, 203); // 粉色
  strokeWeight(2);
  
  let numSegments = 12; // 图案的分段数
  let angleStep = TWO_PI / numSegments; // 每段的角度

  for (let i = 0; i < numSegments; i++) {
    let angle1 = i * angleStep;
    let angle2 = (i + 1) * angleStep;

    let x1 = cx + cos(angle1) * radius;
    let y1 = cy + sin(angle1) * radius;
    let x2 = cx + cos(angle2) * radius;
    let y2 = cy + sin(angle2) * radius;

    line(x1, y1, cx, cy); // 从圆环上的点画线到圆心
    line(x1, y1, x2, y2); // 在圆环上画线段
  }

  pop();
}

function drawArcThroughCenter(cx, cy, radius, startAngle) {
  push();
  stroke(255, 182, 193); // 粉色
  strokeWeight(3);
  noFill();

  let arcAngle = PI / 4; // 弧线的角度范围
  let endAngle = startAngle + arcAngle;

  arc(cx, cy, radius * 2, radius * 2, startAngle, endAngle);

  pop();
}

function fillDotsOnCircle(cx, cy, outerRadius, innerRadius) {
  let numDots = 30; // 圆点的数量
  let angleStep = TWO_PI / numDots; // 每个圆点之间的角度

  for (let i = 0; i < numDots; i++) {
    let angle = i * angleStep;
    let radius = random(innerRadius, outerRadius); // 随机半径
    let x = cx + cos(angle) * radius;
    let y = cy + sin(angle) * radius;
    fill(255); // 白色圆点
    ellipse(x, y, 5, 5); // 画圆点
  }
}

function generateColors() {
  // 返回一组颜色，用于绘制同心圆
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
      isMoving = !isMoving; // 切换移动状态
      if (isMoving) {
        loop(); // 开始动画循环
      } else {
        noLoop(); // 停止动画循环
      }
    } else if (key === '2') {
      // 从初始位置开始滚动
      for (let i = 0; i < circles.length; i++) {
        circles[i].vx = 2; // 设置初始速度以向右移动图形
      }
      isMoving = true; // 启用移动
      loop(); // 开始动画循环
    } else if (key === '0') {
      background(50, 100, 150); // 清除画布
      initializeCircles(); // 重新初始化所有圆形
      redraw(); // 重新绘制画布
      noLoop(); // 停止动画循环
      isMoving = false; // 禁用移动
    }
  }