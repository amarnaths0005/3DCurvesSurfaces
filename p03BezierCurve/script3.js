// HTML Program to draw and manipulate a Bezier Curve with five control points.
// Written by Amarnath S, amarnaths.codeproject@gmail.com, July 2019

/* Requirements:
   1. Should enable the user to modify the x, y, z coordinates of five control points,
      in the Five Point Form of Bezier Curve.
   2. The range for the coordinates should be in [-1, 1] for the end points, and [-4,4]
      for the intermediate points.
   3. Should display the Bezier Curve as a magenta curve, and this curve should 
      change dynamically as the user modifies any of the Control Polygon coordinates.
   4. Should show the Control Polygon as a yellow line.
   5. Should display the bounding box of dimension 2 units, centred at the origin.
   6. Should enable the user to modify the camera angle, from which viewing is done.
   7. Should enable the user to modify the u value, and should display a moving red point
      on the curve as the user modifies this value.

    Tested on Chrome and Firefox, on Windows.
    Uses the three.js library. 
 */

let scene;
let camera;
let renderer;
let points = [];
let spheres = [];
let controls;
let halfCubeSide;
let p1x, p1y, p1z, p2x, p2y, p2z, p3x, p3y, p3z, p4x, p4y, p4z, p5x, p5y, p5z;
let p1xRange, p1yRange, p1zRange, p2xRange, p2yRange, p2zRange;
let p3xRange, p3yRange, p3zRange, p4xRange, p4yRange, p4zRange;
let p5xRange, p5yRange, p5zRange;
let cameraAngleRange, cameraAngle, uRange, uValue;
let controlLine;
let camRadius;
let curvePoints = [];
let noUPoints, uStep;
let curveLine;
let point1, point2, point3, point4, point5, pointU;
let uVal;
let arrowHelper1, arrowHelper2, arrowHelper3;
let arrowDirection1 = new THREE.Vector3();
let arrowDirection2 = new THREE.Vector3();
let arrowDirection3 = new THREE.Vector3();

window.onload = init;

function init() {
  scene = new THREE.Scene();
  let width = (7 * window.innerWidth) / 10;
  camera = new THREE.PerspectiveCamera(
    45,
    width / window.innerHeight,
    0.1,
    1000
  );
  renderer = new THREE.WebGLRenderer({ antialias: true });
  uRange = document.getElementById("uValue");
  camRadius = 5;
  noUPoints = 1000;
  uStep = 1.0 / noUPoints;

  window.addEventListener("resize", onResize, false);

  cameraAngle = 25; // degrees

  // Initialize points for the Five Point Form
  initializePoints();

  uVal = 0.25;

  // Point P1
  p1xRange = document.getElementById("point1x");
  p1xRange.addEventListener(
    "input",
    function () {
      p1x = parseFloat(p1xRange.value);
      document.getElementById("opPoint1x").textContent = p1x.toFixed(3);
      computeBezierCurve();
    },
    false
  );

  p1yRange = document.getElementById("point1y");
  p1yRange.addEventListener(
    "input",
    function () {
      p1y = parseFloat(p1yRange.value);
      document.getElementById("opPoint1y").textContent = p1y.toFixed(3);
      computeBezierCurve();
    },
    false
  );

  p1zRange = document.getElementById("point1z");
  p1zRange.addEventListener(
    "input",
    function () {
      p1z = parseFloat(p1zRange.value);
      document.getElementById("opPoint1z").textContent = p1z.toFixed(3);
      computeBezierCurve();
    },
    false
  );

  // Point P2
  p2xRange = document.getElementById("point2x");
  p2xRange.addEventListener(
    "input",
    function () {
      p2x = parseFloat(p2xRange.value);
      document.getElementById("opPoint2x").textContent = p2x.toFixed(3);
      computeBezierCurve();
    },
    false
  );

  p2yRange = document.getElementById("point2y");
  p2yRange.addEventListener(
    "input",
    function () {
      p2y = parseFloat(p2yRange.value);
      document.getElementById("opPoint2y").textContent = p2y.toFixed(3);
      computeBezierCurve();
    },
    false
  );

  p2zRange = document.getElementById("point2z");
  p2zRange.addEventListener(
    "input",
    function () {
      p2z = parseFloat(p2zRange.value);
      document.getElementById("opPoint2z").textContent = p2z.toFixed(3);
      computeBezierCurve();
    },
    false
  );

  // Point P3
  p3xRange = document.getElementById("point3x");
  p3xRange.addEventListener(
    "input",
    function () {
      p3x = parseFloat(p3xRange.value);
      document.getElementById("opPoint3x").textContent = p3x.toFixed(3);
      computeBezierCurve();
    },
    false
  );

  p3yRange = document.getElementById("point3y");
  p3yRange.addEventListener(
    "input",
    function () {
      p3y = parseFloat(p3yRange.value);
      document.getElementById("opPoint3y").textContent = p3y.toFixed(3);
      computeBezierCurve();
    },
    false
  );

  p3zRange = document.getElementById("point3z");
  p3zRange.addEventListener(
    "input",
    function () {
      p3z = parseFloat(p3zRange.value);
      document.getElementById("opPoint3z").textContent = p3z.toFixed(3);
      computeBezierCurve();
    },
    false
  );

  // Point P4
  p4xRange = document.getElementById("point4x");
  p4xRange.addEventListener(
    "input",
    function () {
      p4x = parseFloat(p4xRange.value);
      document.getElementById("opPoint4x").textContent = p4x.toFixed(3);
      computeBezierCurve();
    },
    false
  );

  p4yRange = document.getElementById("point4y");
  p4yRange.addEventListener(
    "input",
    function () {
      p4y = parseFloat(p4yRange.value);
      document.getElementById("opPoint4y").textContent = p4y.toFixed(3);
      computeBezierCurve();
    },
    false
  );

  p4zRange = document.getElementById("point4z");
  p4zRange.addEventListener(
    "input",
    function () {
      p4z = parseFloat(p4zRange.value);
      document.getElementById("opPoint4z").textContent = p4z.toFixed(3);
      computeBezierCurve();
    },
    false
  );

  // Point P5
  p5xRange = document.getElementById("point5x");
  p5xRange.addEventListener(
    "input",
    function () {
      p5x = parseFloat(p5xRange.value);
      document.getElementById("opPoint5x").textContent = p5x.toFixed(3);
      computeBezierCurve();
    },
    false
  );

  p5yRange = document.getElementById("point5y");
  p5yRange.addEventListener(
    "input",
    function () {
      p5y = parseFloat(p5yRange.value);
      document.getElementById("opPoint5y").textContent = p5y.toFixed(3);
      computeBezierCurve();
    },
    false
  );

  p5zRange = document.getElementById("point5z");
  p5zRange.addEventListener(
    "input",
    function () {
      p5z = parseFloat(p5zRange.value);
      document.getElementById("opPoint5z").textContent = p5z.toFixed(3);
      computeBezierCurve();
    },
    false
  );

  // Camera
  cameraAngleRange = document.getElementById("cameraAngle");
  cameraAngleRange.addEventListener(
    "input",
    function () {
      cameraAngle = parseFloat(cameraAngleRange.value);
      document.getElementById("opCameraAngle").textContent = cameraAngle;
      handleCameraAngle();
    },
    false
  );

  // U value
  uRange.addEventListener(
    "input",
    function () {
      uValue = parseFloat(uRange.value);
      document.getElementById("opUvalue").textContent = uValue.toFixed(3);
      changeUvalue();
    },
    false
  );

  halfCubeSide = 1;

  renderer.setClearColor(new THREE.Color(0x111111));
  renderer.setSize(width, window.innerHeight);

  let axes = new THREE.AxesHelper(0.4);
  scene.add(axes);

  let origin = new THREE.Vector3(0, 0, 0);
  let xPos = new THREE.Vector3(0.4, 0, 0);
  let yPos = new THREE.Vector3(0, 0.4, 0);
  let zPos = new THREE.Vector3(0, 0, 0.4);

  arrowDirection1.subVectors(xPos, origin).normalize();
  arrowHelper1 = new THREE.ArrowHelper(
    arrowDirection1,
    origin,
    0.4,
    0xff0000,
    0.07,
    0.04
  );
  scene.add(arrowHelper1);

  arrowDirection2.subVectors(yPos, origin).normalize();
  arrowHelper2 = new THREE.ArrowHelper(
    arrowDirection2,
    origin,
    0.4,
    0x00ff00,
    0.07,
    0.04
  );
  scene.add(arrowHelper2);

  arrowDirection3.subVectors(zPos, origin).normalize();
  arrowHelper3 = new THREE.ArrowHelper(
    arrowDirection3,
    origin,
    0.4,
    0x0000ff,
    0.07,
    0.04
  );
  scene.add(arrowHelper3);

  document.getElementById("bnBezCurve1").addEventListener(
    "click",
    function () {
      setupCurve1();
    },
    false
  );

  document.getElementById("bnBezCurve2").addEventListener(
    "click",
    function () {
      setupCurve2();
    },
    false
  );

  document.getElementById("bnBezCurve3").addEventListener(
    "click",
    function () {
      setupCurve3();
    },
    false
  );

  setupCubePoints();
  setupBoundaryPoints();
  setupWireframeBox();
  handleCameraAngle();
  computeBezierCurve();

  document.getElementById("webglOp").appendChild(renderer.domElement);

  animate();
  render();
}

function initializePoints() {
  p1x = -1.0;
  p1y = -1.0;
  p1z = -1.0;

  p2x = -2.0;
  p2y = -0.6;
  p2z = -0.6;

  p3x = 1.3;
  p3y = 0.0;
  p3z = 0.0;

  p4x = 0.5;
  p4y = -2.0;
  p4z = 0.5;

  p5x = 1.0;
  p5y = 1.0;
  p5z = 1.0;
}

function setupCurve1() {
  p1x = -1.0;
  p1y = -1.0;
  p1z = -1.0;

  p5x = 1.0;
  p5y = 1.0;
  p5z = 1.0;

  let diffX = p5x - p1x;
  let diffY = p5y - p1y;
  let diffZ = p5z - p1z;

  p2x = p1x + diffX / 4;
  p2y = p1y + diffY / 4;
  p2z = p1z + diffZ / 4;

  p3x = p1x + diffX / 2;
  p3y = p1y + diffY / 2;
  p3z = p1z + diffZ / 2;

  p4x = p1x + (diffX * 3) / 4;
  p4y = p1y + (diffY * 3) / 4;
  p4z = p1z + (diffZ * 3) / 4;

  updateOutputLabels();
  computeBezierCurve();
  renderCurve();
}

function setupCurve2() {
  p1x = 1.0;
  p1y = -1.0;
  p1z = -1.0;

  p2x = 0.0;
  p2y = 0.0;
  p2z = -1.0;

  p3x = -1.0;
  p3y = 0.0;
  p3z = 0.0;

  p4x = 0.0;
  p4y = 0.0;
  p4z = 1.0;

  p5x = 1.0;
  p5y = 1.0;
  p5z = 1.0;

  updateOutputLabels();
  computeBezierCurve();
  renderCurve();
}

function setupCurve3() {
  p1x = 1.0;
  p1y = -1.0;
  p1z = -1.0;

  p2x = 1.0;
  p2y = 0.9;
  p2z = -1.0;

  p3x = -1.0;
  p3y = 0.9;
  p3z = -1.0;

  p4x = -1.0;
  p4y = 0.9;
  p4z = 1.0;

  p5x = 1.0;
  p5y = 1.0;
  p5z = 1.0;

  updateOutputLabels();
  computeBezierCurve();
  renderCurve();
}

function updateOutputLabels() {
  p1xRange.value = p1x;
  p1yRange.value = p1y;
  p1zRange.value = p1z;

  p2xRange.value = p2x;
  p2yRange.value = p2y;
  p2zRange.value = p2z;

  p3xRange.value = p3x;
  p3yRange.value = p3y;
  p3zRange.value = p3z;

  p4xRange.value = p4x;
  p4yRange.value = p4y;
  p4zRange.value = p4z;

  p5xRange.value = p5x;
  p5yRange.value = p5y;
  p5zRange.value = p5z;

  document.getElementById("opPoint1x").textContent = p1x.toFixed(3);
  document.getElementById("opPoint1y").textContent = p1y.toFixed(3);
  document.getElementById("opPoint1z").textContent = p1z.toFixed(3);

  document.getElementById("opPoint2x").textContent = p2x.toFixed(3);
  document.getElementById("opPoint2y").textContent = p2y.toFixed(3);
  document.getElementById("opPoint2z").textContent = p2z.toFixed(3);

  document.getElementById("opPoint3x").textContent = p3x.toFixed(3);
  document.getElementById("opPoint3y").textContent = p3y.toFixed(3);
  document.getElementById("opPoint3z").textContent = p3z.toFixed(3);

  document.getElementById("opPoint4x").textContent = p4x.toFixed(3);
  document.getElementById("opPoint4y").textContent = p4y.toFixed(3);
  document.getElementById("opPoint4z").textContent = p4z.toFixed(3);

  document.getElementById("opPoint5x").textContent = p5x.toFixed(3);
  document.getElementById("opPoint5y").textContent = p5y.toFixed(3);
  document.getElementById("opPoint5z").textContent = p5z.toFixed(3);
}

function changeUvalue() {
  scene.remove(pointU);

  uVal = parseFloat(uRange.value);
  let u2,
    u3,
    u4,
    coeff1,
    coeff2,
    coeff3,
    coeff4,
    coeff5,
    xCurve,
    yCurve,
    zCurve;

  u2 = uVal * uVal;
  u3 = u2 * uVal;
  u4 = u3 * uVal;

  // This is the Bezier Curve Formula from Rogers and Adam's Book - Mathematical Elements for
  // Computer Graphics
  coeff1 = u4 - 4 * u3 + 6 * u2 - 4 * uVal + 1;
  coeff2 = -4 * u4 + 12 * u3 - 12 * u2 + 4 * uVal;
  coeff3 = 6 * u4 - 12 * u3 + 6 * u2;
  coeff4 = -4 * u4 + 4 * u3;
  coeff5 = u4;
  xCurve =
    p1x * coeff1 + p2x * coeff2 + p3x * coeff3 + p4x * coeff4 + p5x * coeff5;
  yCurve =
    p1y * coeff1 + p2y * coeff2 + p3y * coeff3 + p4y * coeff4 + p5y * coeff5;
  zCurve =
    p1z * coeff1 + p2z * coeff2 + p3z * coeff3 + p4z * coeff4 + p5z * coeff5;

  let sphereGeometry = new THREE.SphereGeometry(0.02, 20, 20);
  let sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    wireframe: false,
  });
  pointU = new THREE.Mesh(sphereGeometry, sphereMaterial);
  pointU.position.x = xCurve;
  pointU.position.y = yCurve;
  pointU.position.z = zCurve;

  scene.add(pointU);
}

function setupControlPoints() {
  scene.remove(point1);
  scene.remove(point2);
  scene.remove(point3);
  scene.remove(point4);
  scene.remove(point5);
  scene.remove(controlLine);

  let sphereGeometry = new THREE.SphereGeometry(0.015, 20, 20);
  let sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0xff00ff,
    wireframe: false,
  });
  point1 = new THREE.Mesh(sphereGeometry, sphereMaterial);
  point1.position.x = p1x;
  point1.position.y = p1y;
  point1.position.z = p1z;

  point2 = new THREE.Mesh(sphereGeometry, sphereMaterial);
  point2.position.x = p2x;
  point2.position.y = p2y;
  point2.position.z = p2z;

  point3 = new THREE.Mesh(sphereGeometry, sphereMaterial);
  point3.position.x = p3x;
  point3.position.y = p3y;
  point3.position.z = p3z;

  point4 = new THREE.Mesh(sphereGeometry, sphereMaterial);
  point4.position.x = p4x;
  point4.position.y = p4y;
  point4.position.z = p4z;

  point5 = new THREE.Mesh(sphereGeometry, sphereMaterial);
  point5.position.x = p5x;
  point5.position.y = p5y;
  point5.position.z = p5z;

  scene.add(point1);
  scene.add(point2);
  scene.add(point3);
  scene.add(point4);
  scene.add(point5);

  let material = new THREE.LineBasicMaterial({
    color: 0xffff00,
    opacity: 0.25,
    transparent: true,
  });
  let geometry = new THREE.BufferGeometry();
  let vertices = [];
  vertices.push(point1.position.x, point1.position.y, point1.position.z);
  vertices.push(point2.position.x, point2.position.y, point2.position.z);
  vertices.push(point3.position.x, point3.position.y, point3.position.z);
  vertices.push(point4.position.x, point4.position.y, point4.position.z);
  vertices.push(point5.position.x, point5.position.y, point5.position.z);
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  controlLine = new THREE.Line(geometry, material);
  scene.add(controlLine);
}

function computeBezierCurve() {
  setupControlPoints();
  curvePoints.length = 0;
  let uVal, u2, u3, u4;
  let coeff1, coeff2, coeff3, coeff4, coeff5;
  let xCurve, yCurve, zCurve;

  for (let i = 0; i < noUPoints; ++i) {
    uVal = uStep * i;
    u2 = uVal * uVal;
    u3 = u2 * uVal;
    u4 = u3 * uVal;

    // This is the Bezier Curve Formula from Rogers and Adam's Book - Mathematical Elements for
    // Computer Graphics
    coeff1 = u4 - 4 * u3 + 6 * u2 - 4 * uVal + 1;
    coeff2 = -4 * u4 + 12 * u3 - 12 * u2 + 4 * uVal;
    coeff3 = 6 * u4 - 12 * u3 + 6 * u2;
    coeff4 = -4 * u4 + 4 * u3;
    coeff5 = u4;
    xCurve =
      p1x * coeff1 + p2x * coeff2 + p3x * coeff3 + p4x * coeff4 + p5x * coeff5;
    yCurve =
      p1y * coeff1 + p2y * coeff2 + p3y * coeff3 + p4y * coeff4 + p5y * coeff5;
    zCurve =
      p1z * coeff1 + p2z * coeff2 + p3z * coeff3 + p4z * coeff4 + p5z * coeff5;
    let poi = new THREE.Vector3(xCurve, yCurve, zCurve);
    curvePoints.push(poi);
  }
  renderCurve();
  changeUvalue();
}

function renderCurve() {
  scene.remove(curveLine);
  let material = new THREE.LineBasicMaterial({
    color: 0x00ffff,
    linewidth: 3, // For some reason, this line width does not work
  });
  let geometry = new THREE.BufferGeometry();
  let vertices = [];
  for (let i = 0; i < curvePoints.length; ++i) {
    vertices.push(curvePoints[i].x, curvePoints[i].y, curvePoints[i].z);
  }
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  curveLine = new THREE.Line(geometry, material);
  scene.add(curveLine);
  render();
}

function setupCubePoints() {
  let pt = new THREE.Vector3(halfCubeSide, -halfCubeSide, halfCubeSide); // Point A
  points.push(pt);
  pt = new THREE.Vector3(halfCubeSide, -halfCubeSide, -halfCubeSide); // Point B
  points.push(pt);
  pt = new THREE.Vector3(-halfCubeSide, -halfCubeSide, -halfCubeSide); // Point C
  points.push(pt);
  pt = new THREE.Vector3(-halfCubeSide, -halfCubeSide, halfCubeSide); // Point D
  points.push(pt);
  pt = new THREE.Vector3(halfCubeSide, halfCubeSide, halfCubeSide); // Point E
  points.push(pt);
  pt = new THREE.Vector3(halfCubeSide, halfCubeSide, -halfCubeSide); // Point F
  points.push(pt);
  pt = new THREE.Vector3(-halfCubeSide, halfCubeSide, -halfCubeSide); // Point G
  points.push(pt);
  pt = new THREE.Vector3(-halfCubeSide, halfCubeSide, halfCubeSide); // Point H
  points.push(pt);
  pt = new THREE.Vector3(0, 0, 0); // Point O
  points.push(pt);
}

function setupBoundaryPoints() {
  let sphereGeometry = new THREE.SphereGeometry(0.02, 20, 20);
  let sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x7777ff,
    wireframe: false,
  });

  for (let i = 0; i < points.length; ++i) {
    let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.x = points[i].x;
    sphere.position.y = points[i].y;
    sphere.position.z = points[i].z;
    spheres.push(sphere);
  }

  for (let i = 0; i < spheres.length; ++i) {
    scene.add(spheres[i]);
  }
}

function setupWireframeBox() {
  let line1, line2, line3, line4, line5, line6;
  const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
  const geometry1 = new THREE.BufferGeometry();

  const geomVertices1 = [];
  geomVertices1.push(halfCubeSide, -halfCubeSide, halfCubeSide);
  geomVertices1.push(halfCubeSide, -halfCubeSide, -halfCubeSide);
  geomVertices1.push(-halfCubeSide, -halfCubeSide, -halfCubeSide);
  geomVertices1.push(-halfCubeSide, -halfCubeSide, halfCubeSide);
  geomVertices1.push(halfCubeSide, -halfCubeSide, halfCubeSide);

  geometry1.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(geomVertices1, 3)
  );
  line1 = new THREE.Line(geometry1, material);
  scene.add(line1);

  const geometry2 = new THREE.BufferGeometry();
  const geomVertices2 = [];
  geomVertices2.push(halfCubeSide, halfCubeSide, halfCubeSide);
  geomVertices2.push(halfCubeSide, halfCubeSide, -halfCubeSide);
  geomVertices2.push(-halfCubeSide, halfCubeSide, -halfCubeSide);
  geomVertices2.push(-halfCubeSide, halfCubeSide, halfCubeSide);
  geomVertices2.push(halfCubeSide, halfCubeSide, halfCubeSide);

  geometry2.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(geomVertices2, 3)
  );
  line2 = new THREE.Line(geometry2, material);
  scene.add(line2);

  const geometry3 = new THREE.BufferGeometry();
  const geomVertices3 = [];
  geomVertices3.push(halfCubeSide, -halfCubeSide, halfCubeSide);
  geomVertices3.push(halfCubeSide, halfCubeSide, halfCubeSide);

  geometry3.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(geomVertices3, 3)
  );
  line3 = new THREE.Line(geometry3, material);
  scene.add(line3);

  const geometry4 = new THREE.BufferGeometry();
  const geomVertices4 = [];
  geomVertices4.push(halfCubeSide, -halfCubeSide, -halfCubeSide);
  geomVertices4.push(halfCubeSide, halfCubeSide, -halfCubeSide);

  geometry4.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(geomVertices4, 3)
  );
  line4 = new THREE.Line(geometry4, material);
  scene.add(line4);

  const geometry5 = new THREE.BufferGeometry();
  const geomVertices5 = [];

  geomVertices5.push(-halfCubeSide, -halfCubeSide, -halfCubeSide);
  geomVertices5.push(-halfCubeSide, halfCubeSide, -halfCubeSide);

  geometry5.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(geomVertices5, 3)
  );
  line5 = new THREE.Line(geometry5, material);
  scene.add(line5);

  const geometry6 = new THREE.BufferGeometry();
  const geomVertices6 = [];
  geomVertices6.push(-halfCubeSide, -halfCubeSide, halfCubeSide);
  geomVertices6.push(-halfCubeSide, halfCubeSide, halfCubeSide);

  geometry6.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(geomVertices6, 3)
  );
  line6 = new THREE.Line(geometry6, material);
  scene.add(line6);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function handleCameraAngle() {
  let angle = (cameraAngle * Math.PI) / 180.0;
  let xCam = camRadius * Math.cos(angle);
  let zCam = camRadius * Math.sin(angle);
  camera.position.set(xCam, 3, zCam);
  camera.lookAt(scene.position);
  render();
}

function onResize() {
  width = (7 * window.innerWidth) / 10;
  camera.aspect = width / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(width, window.innerHeight);
  render();
}

function render() {
  renderer.render(scene, camera);
}
