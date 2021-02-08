// HTML Program to draw and manipulate a Parametric Cubic Curve in its
// Four Point Form and Hermite Form
// Written by Amarnath S, amarnaths.codeproject@gmail.com, July 2019
// Updated Jan 2021, with latest version of Three.js - 125

/* Requirements:
   1. Should enable the user to modify the x, y, z coordinates of four points, 
      in the Four Point Form of a Parametric Cubic Curve.
   2. Should enable the user to modify the x, y, z coordinates of the two end points
      and also the x, y, z components of the derivatives at the two end points
      in case of the Hermite Form of the Parametric Cubic Curve.
   3. The range for the coordinates should be in [-1, 1], and the range
      for the derivatives should be [-10, 10].
   4. Should display the Parametric Cubic Curve on the screen, and this curve should 
      change dynamically as the user modifies any of the values.
   5. Should display the bounding box of dimension 2 units, centred at the origin.
   6. Should enable the user to modify the camera angle, from which viewing is done.
   7. Should enable the user to modify the u value, and should display a moving point
      on the curve as the user modifies this value.

    Tested on Chrome and Firefox, on Windows.
    Uses the three.js library. 
 */

"use strict";

let scene, camera, renderer;
let points = [];
let spheres = [];
let controls;
let halfCubeSide, width;
let p1x, p1y, p1z, p2x, p2y, p2z, p3x, p3y, p3z, p4x, p4y, p4z;
let p1xh, p1yh, p1zh, p2xh, p2yh, p2zh;
let p1dxh, p1dyh, p1dzh, p2dxh, p2dyh, p2dzh;
let p1xRange, p1yRange, p1zRange, p2xRange, p2yRange, p2zRange;
let p3xRange, p3yRange, p3zRange, p4xRange, p4yRange, p4zRange;
let p1xRangeh, p1yRangeh, p1zRangeh, p2xRangeh, p2yRangeh, p2zRangeh;
let p1dxRangeh, p1dyRangeh, p1dzRangeh, p2dxRangeh, p2dyRangeh, p2dzRangeh;
let cameraAngleRange, cameraAngle, uRange, uValue;
let camRadius;
let curvePoints = [];
let noUPoints, uStep;
let curveLine;
let point1, point2, point3, point4, pointU;
let uVal, pageCurrent;
let arrowHelper1, arrowHelper2, arrowHelper3;
let arrowDirection1 = new THREE.Vector3();
let arrowDirection2 = new THREE.Vector3();
let arrowDirection3 = new THREE.Vector3();

window.onload = init;

function init() {
  scene = new THREE.Scene();
  width = (7 * window.innerWidth) / 10;
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
  //curvePointsTypedArray = new Float32Array(noUPoints * 3);

  // Four Point Tab
  p1xRange = document.getElementById("point1x");
  p1yRange = document.getElementById("point1y");
  p1zRange = document.getElementById("point1z");
  p2xRange = document.getElementById("point2x");
  p2yRange = document.getElementById("point2y");
  p2zRange = document.getElementById("point2z");
  p3xRange = document.getElementById("point3x");
  p3yRange = document.getElementById("point3y");
  p3zRange = document.getElementById("point3z");
  p4xRange = document.getElementById("point4x");
  p4yRange = document.getElementById("point4y");
  p4zRange = document.getElementById("point4z");

  // Hermite Tab
  p1xRangeh = document.getElementById("point1xh");
  p1yRangeh = document.getElementById("point1yh");
  p1zRangeh = document.getElementById("point1zh");
  p2xRangeh = document.getElementById("point2xh");
  p2yRangeh = document.getElementById("point2yh");
  p2zRangeh = document.getElementById("point2zh");
  p1dxRangeh = document.getElementById("point1dxh");
  p1dyRangeh = document.getElementById("point1dyh");
  p1dzRangeh = document.getElementById("point1dzh");
  p2dxRangeh = document.getElementById("point2dxh");
  p2dyRangeh = document.getElementById("point2dyh");
  p2dzRangeh = document.getElementById("point2dzh");

  window.addEventListener("resize", onResize, false);
  document.getElementById("defaultOpen").click();

  cameraAngle = 25; // degrees
  initializeValues();
  pageCurrent = "fourPoints";

  // Point P1 - Four Point Form
  p1xRange.addEventListener(
    "input",
    function () {
      p1x = parseFloat(p1xRange.value);
      document.getElementById("opPoint1x").textContent = p1x.toFixed(3);
      computeCurveFourPointsForm();
    },
    false
  );

  p1yRange.addEventListener(
    "input",
    function () {
      p1y = parseFloat(p1yRange.value);
      document.getElementById("opPoint1y").textContent = p1y.toFixed(3);
      computeCurveFourPointsForm();
    },
    false
  );

  p1zRange.addEventListener(
    "input",
    function () {
      p1z = parseFloat(p1zRange.value);
      document.getElementById("opPoint1z").textContent = p1z.toFixed(3);
      computeCurveFourPointsForm();
    },
    false
  );

  // Point P2 - Four Point Form
  p2xRange.addEventListener(
    "input",
    function () {
      p2x = parseFloat(p2xRange.value);
      document.getElementById("opPoint2x").textContent = p2x.toFixed(3);
      computeCurveFourPointsForm();
    },
    false
  );

  p2yRange.addEventListener(
    "input",
    function () {
      p2y = parseFloat(p2yRange.value);
      document.getElementById("opPoint2y").textContent = p2y.toFixed(3);
      computeCurveFourPointsForm();
    },
    false
  );

  p2zRange.addEventListener(
    "input",
    function () {
      p2z = parseFloat(p2zRange.value);
      document.getElementById("opPoint2z").textContent = p2z.toFixed(3);
      computeCurveFourPointsForm();
    },
    false
  );

  // Point P3 - Four Point Form
  p3xRange.addEventListener(
    "input",
    function () {
      p3x = parseFloat(p3xRange.value);
      document.getElementById("opPoint3x").textContent = p3x.toFixed(3);
      computeCurveFourPointsForm();
    },
    false
  );

  p3yRange.addEventListener(
    "input",
    function () {
      p3y = parseFloat(p3yRange.value);
      document.getElementById("opPoint3y").textContent = p3y.toFixed(3);
      computeCurveFourPointsForm();
    },
    false
  );

  p3zRange.addEventListener(
    "input",
    function () {
      p3z = parseFloat(p3zRange.value);
      document.getElementById("opPoint3z").textContent = p3z.toFixed(3);
      computeCurveFourPointsForm();
    },
    false
  );

  // Point P4 - Four Point Form
  p4xRange.addEventListener(
    "input",
    function () {
      p4x = parseFloat(p4xRange.value);
      document.getElementById("opPoint4x").textContent = p4x.toFixed(3);
      computeCurveFourPointsForm();
    },
    false
  );

  p4yRange.addEventListener(
    "input",
    function () {
      p4y = parseFloat(p4yRange.value);
      document.getElementById("opPoint4y").textContent = p4y.toFixed(3);
      computeCurveFourPointsForm();
    },
    false
  );

  p4zRange.addEventListener(
    "input",
    function () {
      p4z = parseFloat(p4zRange.value);
      document.getElementById("opPoint4z").textContent = p4z.toFixed(3);
      computeCurveFourPointsForm();
    },
    false
  );

  // Point P1 - Hermite
  p1xRangeh.addEventListener(
    "input",
    function () {
      p1xh = parseFloat(p1xRangeh.value);
      document.getElementById("opPoint1xh").textContent = p1xh.toFixed(3);
      computeCurveHermiteForm();
    },
    false
  );

  p1yRangeh.addEventListener(
    "input",
    function () {
      p1yh = parseFloat(p1yRangeh.value);
      document.getElementById("opPoint1yh").textContent = p1yh.toFixed(3);
      computeCurveHermiteForm();
    },
    false
  );

  p1zRangeh.addEventListener(
    "input",
    function () {
      p1zh = parseFloat(p1zRangeh.value);
      document.getElementById("opPoint1zh").textContent = p1zh.toFixed(3);
      computeCurveHermiteForm();
    },
    false
  );

  // Point P2 - Hermite
  p2xRangeh.addEventListener(
    "input",
    function () {
      p2xh = parseFloat(p2xRangeh.value);
      document.getElementById("opPoint2xh").textContent = p2xh.toFixed(3);
      computeCurveHermiteForm();
    },
    false
  );

  p2yRangeh.addEventListener(
    "input",
    function () {
      p2yh = parseFloat(p2yRangeh.value);
      document.getElementById("opPoint2yh").textContent = p2yh.toFixed(3);
      computeCurveHermiteForm();
    },
    false
  );

  p2zRangeh.addEventListener(
    "input",
    function () {
      p2zh = parseFloat(p2zRangeh.value);
      document.getElementById("opPoint2zh").textContent = p2zh.toFixed(3);
      computeCurveHermiteForm();
    },
    false
  );

  // Derivative at Point P1 - Hermite
  p1dxRangeh.addEventListener(
    "input",
    function () {
      p1dxh = parseFloat(p1dxRangeh.value);
      document.getElementById("opPoint1dxh").textContent = p1dxh.toFixed(3);
      computeCurveHermiteForm();
    },
    false
  );

  p1dyRangeh.addEventListener(
    "input",
    function () {
      p1dyh = parseFloat(p1dyRangeh.value);
      document.getElementById("opPoint1dyh").textContent = p1dyh.toFixed(3);
      computeCurveHermiteForm();
    },
    false
  );

  p1dzRangeh.addEventListener(
    "input",
    function () {
      p1dzh = parseFloat(p1dzRangeh.value);
      document.getElementById("opPoint1dzh").textContent = p1dzh.toFixed(3);
      computeCurveHermiteForm();
    },
    false
  );

  // Derivative at Point P2 - Hermite
  p2dxRangeh.addEventListener(
    "input",
    function () {
      p2dxh = parseFloat(p2dxRangeh.value);
      document.getElementById("opPoint2dxh").textContent = p2dxh.toFixed(3);
      computeCurveHermiteForm();
    },
    false
  );

  p2dyRangeh.addEventListener(
    "input",
    function () {
      p2dyh = parseFloat(p2dyRangeh.value);
      document.getElementById("opPoint2dyh").textContent = p2dyh.toFixed(3);
      computeCurveHermiteForm();
    },
    false
  );

  p2dzRangeh.addEventListener(
    "input",
    function () {
      p2dzh = parseFloat(p2dzRangeh.value);
      document.getElementById("opPoint2dzh").textContent = p2dzh.toFixed(3);
      computeCurveHermiteForm();
    },
    false
  );

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

  uRange.addEventListener(
    "input",
    function () {
      uValue = parseFloat(uRange.value);
      document.getElementById("opUvalue").textContent = uValue.toFixed(3);
      changeUvalue();
    },
    false
  );

  document.getElementById("bnFourLine1").addEventListener(
    "click",
    function () {
      setValuesFourLine1();
    },
    false
  );

  document.getElementById("bnFourLine2").addEventListener(
    "click",
    function () {
      setValuesFourLine2();
    },
    false
  );

  document.getElementById("bnFourLine3").addEventListener(
    "click",
    function () {
      setValuesFourLine3();
    },
    false
  );

  document.getElementById("bnHermiteLine1").addEventListener(
    "click",
    function () {
      setValuesHermiteLine1();
    },
    false
  );

  document.getElementById("bnHermiteLine2").addEventListener(
    "click",
    function () {
      setValuesHermiteLine2();
    },
    false
  );

  document.getElementById("bnHermiteLine3").addEventListener(
    "click",
    function () {
      setValuesHermiteLine3();
    },
    false
  );

  document.getElementById("bnHermiteLine4").addEventListener(
    "click",
    function () {
      setValuesHermiteLine4();
    },
    false
  );

  halfCubeSide = 1;

  renderer.setClearColor(new THREE.Color(0x000000));
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

  setupWireframeBox();
  handleCameraAngle();
  computeCurveFourPointsForm();
  document.getElementById("webglOp").appendChild(renderer.domElement);
  animate();
  render();
}

function setValuesFourLine1() {
  // Straight Line 1
  p1x = -1.0;
  p1y = -1.0;
  p1z = -1.0;
  p2x = -0.33;
  p2y = -0.33;
  p2z = -0.33;
  p3x = 0.33;
  p3y = 0.33;
  p3z = 0.33;
  p4x = 1.0;
  p4y = 1.0;
  p4z = 1.0;

  updateOutputLabelsFour();
  computeCurveFourPointsForm();
}

function setValuesFourLine2() {
  // Straight Line 2
  p1x = -1.0;
  p1y = -1.0;
  p1z = -1.0;
  p2x = -0.7;
  p2y = -0.7;
  p2z = -0.7;
  p3x = 0.7;
  p3y = 0.7;
  p3z = 0.7;
  p4x = 1.0;
  p4y = 1.0;
  p4z = 1.0;

  updateOutputLabelsFour();
  computeCurveFourPointsForm();
}

function setValuesFourLine3() {
  // Curved Line
  p1x = -1.0;
  p1y = -1.0;
  p1z = -1.0;
  p2x = -1.0;
  p2y = 1.0;
  p2z = -1.0;
  p3x = -1.0;
  p3y = 1.0;
  p3z = 1.0;
  p4x = 1.0;
  p4y = 1.0;
  p4z = 1.0;

  updateOutputLabelsFour();
  computeCurveFourPointsForm();
}

function updateOutputLabelsFour() {
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
}

function setValuesHermiteLine1() {
  // Straight Line
  p1xh = -1.0;
  p1yh = -1.0;
  p1zh = -1.0;
  p2xh = 1.0;
  p2yh = 1.0;
  p2zh = 1.0;
  p1dxh = 1.0;
  p1dyh = 1.0;
  p1dzh = 1.0;
  p2dxh = 1.0;
  p2dyh = 1.0;
  p2dzh = 1.0;

  updateOutputLabelsHermite();
  computeCurveHermiteForm();
}

function setValuesHermiteLine2() {
  // Straight line - this is a 'non-linear' straight line
  p1xh = -1.0;
  p1yh = -1.0;
  p1zh = -1.0;
  p2xh = 1.0;
  p2yh = 1.0;
  p2zh = 1.0;
  p1dxh = 10.0;
  p1dyh = 10.0;
  p1dzh = 10.0;
  p2dxh = 10.0;
  p2dyh = 10.0;
  p2dzh = 10.0;

  updateOutputLabelsHermite();
  computeCurveHermiteForm();
}

function setValuesHermiteLine3() {
  // Straight line - this is also a non-linear straight line
  p1xh = -1.0;
  p1yh = -1.0;
  p1zh = -1.0;
  p2xh = 1.0;
  p2yh = 1.0;
  p2zh = 1.0;
  p1dxh = -10.0;
  p1dyh = -10.0;
  p1dzh = -10.0;
  p2dxh = -10.0;
  p2dyh = -10.0;
  p2dzh = -10.0;

  updateOutputLabelsHermite();
  computeCurveHermiteForm();
}

function setValuesHermiteLine4() {
  // Curve
  p1xh = -1.0;
  p1yh = -1.0;
  p1zh = -1.0;
  p2xh = 1.0;
  p2yh = 1.0;
  p2zh = 1.0;
  p1dxh = -5.0;
  p1dyh = 5.0;
  p1dzh = -5.0;
  p2dxh = 5.0;
  p2dyh = -5.0;
  p2dzh = 5.0;

  updateOutputLabelsHermite();
  computeCurveHermiteForm();
}

function updateOutputLabelsHermite() {
  p1xRangeh.value = p1xh;
  p1yRangeh.value = p1yh;
  p1zRangeh.value = p1zh;
  p2xRangeh.value = p2xh;
  p2yRangeh.value = p2yh;
  p2zRangeh.value = p2zh;
  p1dxRangeh.value = p1dxh;
  p1dyRangeh.value = p1dyh;
  p1dzRangeh.value = p1dzh;
  p2dxRangeh.value = p2dxh;
  p2dyRangeh.value = p2dyh;
  p2dzRangeh.value = p2dzh;

  document.getElementById("opPoint1xh").textContent = p1xh.toFixed(3);
  document.getElementById("opPoint1yh").textContent = p1yh.toFixed(3);
  document.getElementById("opPoint1zh").textContent = p1zh.toFixed(3);

  document.getElementById("opPoint2xh").textContent = p2xh.toFixed(3);
  document.getElementById("opPoint2yh").textContent = p2yh.toFixed(3);
  document.getElementById("opPoint2zh").textContent = p2zh.toFixed(3);

  document.getElementById("opPoint1dxh").textContent = p1dxh.toFixed(3);
  document.getElementById("opPoint1dyh").textContent = p1dyh.toFixed(3);
  document.getElementById("opPoint1dzh").textContent = p1dzh.toFixed(3);

  document.getElementById("opPoint2dxh").textContent = p2dxh.toFixed(3);
  document.getElementById("opPoint2dyh").textContent = p2dyh.toFixed(3);
  document.getElementById("opPoint2dzh").textContent = p2dzh.toFixed(3);
}

function initializeValues() {
  // Initialize points for the Four Point Form
  p1x = -1.0;
  p1y = -1.0;
  p1z = -1.0;
  p2x = 0.9;
  p2y = -0.2;
  p2z = -0.2;
  p3x = 0.5;
  p3y = 0.5;
  p3z = 0.5;
  p4x = 1.0;
  p4y = 1.0;
  p4z = 1.0;

  // Initialize points and derivatives for the Hermite Form
  p1xh = -1.0;
  p1yh = -1.0;
  p1zh = -1.0;
  p2xh = 1.0;
  p2yh = 1.0;
  p2zh = 1.0;
  p1dxh = 0.0;
  p1dyh = 7.5;
  p1dzh = -0.5;
  p2dxh = 0.5;
  p2dyh = 9.5;
  p2dzh = 0.5;

  uVal = 0.25;
}

function changeUvalue() {
  scene.remove(pointU);

  uVal = parseFloat(uRange.value);
  let pt;

  if (pageCurrent === "fourPoints") {
    pt = computePointFourPointForm(uVal);
  } else {
    // Hermite
    pt = computePointHermiteForm(uVal);
  }

  let sphereGeometry = new THREE.SphereGeometry(0.02, 20, 20);
  let sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    wireframe: false,
  });
  pointU = new THREE.Mesh(sphereGeometry, sphereMaterial);
  pointU.position.x = pt.xVal;
  pointU.position.y = pt.yVal;
  pointU.position.z = pt.zVal;
  scene.add(pointU);
}

function openPage(pageName, elmnt, color) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].style.backgroundColor = "";
  }
  document.getElementById(pageName).style.display = "block";
  elmnt.style.backgroundColor = color;

  if (pageName === "hermite") {
    pageCurrent = "hermite";
    initializeValues();
    updateOutputLabelsHermite();
    computeCurveHermiteForm();
  } else {
    pageCurrent = "fourPoints";
    initializeValues();
    updateOutputLabelsFour();
    computeCurveFourPointsForm();
  }
}

function setupFourPoints() {
  scene.remove(point1);
  scene.remove(point2);
  scene.remove(point3);
  scene.remove(point4);

  let sphereGeometry = new THREE.SphereGeometry(0.02, 20, 20);
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

  scene.add(point1);
  scene.add(point2);
  scene.add(point3);
  scene.add(point4);
}

function computePointFourPointForm(uVal) {
  let u2, u3;
  let coeff1, coeff2, coeff3, coeff4;
  let xCurve, yCurve, zCurve;

  u2 = uVal * uVal;
  u3 = u2 * uVal;

  // This is the Four Point Formula from Mortenson's book on Geometric Modeling
  // For values of u being 0, 1/3, 2/3 and 1.
  coeff1 = -4.5 * u3 + 9 * u2 - 5.5 * uVal + 1;
  coeff2 = 13.5 * u3 - 22.5 * u2 + 9 * uVal;
  coeff3 = -13.5 * u3 + 18 * u2 - 4.5 * uVal;
  coeff4 = 4.5 * u3 - 4.5 * u2 + uVal;
  xCurve = p1x * coeff1 + p2x * coeff2 + p3x * coeff3 + p4x * coeff4;
  yCurve = p1y * coeff1 + p2y * coeff2 + p3y * coeff3 + p4y * coeff4;
  zCurve = p1z * coeff1 + p2z * coeff2 + p3z * coeff3 + p4z * coeff4;
  return {
    xVal: xCurve,
    yVal: yCurve,
    zVal: zCurve,
  };
}

function computePointHermiteForm(uVal) {
  let u2, u3;
  let coeff1, coeff2, coeff3, coeff4;
  let xCurve, yCurve, zCurve;

  u2 = uVal * uVal;
  u3 = u2 * uVal;

  // This is the Hermite Formula from Mortenson's book on Geometric Modeling
  // u and du at the endpoints.
  coeff1 = 2 * u3 - 3 * u2 + 1;
  coeff2 = -2 * u3 + 3 * u2;
  coeff3 = u3 - 2 * u2 + uVal;
  coeff4 = u3 - u2;
  xCurve = p1xh * coeff1 + p2xh * coeff2 + p1dxh * coeff3 + p2dxh * coeff4;
  yCurve = p1yh * coeff1 + p2yh * coeff2 + p1dyh * coeff3 + p2dyh * coeff4;
  zCurve = p1zh * coeff1 + p2zh * coeff2 + p1dzh * coeff3 + p2dzh * coeff4;
  return {
    xVal: xCurve,
    yVal: yCurve,
    zVal: zCurve,
  };
}

function computeCurveFourPointsForm() {
  setupFourPoints();
  let uVal;
  curvePoints.length = 0;

  for (let i = 0; i < noUPoints; ++i) {
    uVal = uStep * i;
    let pt = computePointFourPointForm(uVal);
    curvePoints.push(pt.xVal, pt.yVal, pt.zVal);
  }
  renderCurve();
  changeUvalue();
}

function setupHermitePoints() {
  scene.remove(point1);
  scene.remove(point2);
  scene.remove(point3);
  scene.remove(point4);

  let sphereGeometry = new THREE.SphereGeometry(0.02, 20, 20);
  let sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0xff00ff,
    wireframe: false,
  });
  point1 = new THREE.Mesh(sphereGeometry, sphereMaterial);
  point1.position.x = p1xh;
  point1.position.y = p1yh;
  point1.position.z = p1zh;

  point2 = new THREE.Mesh(sphereGeometry, sphereMaterial);
  point2.position.x = p2xh;
  point2.position.y = p2yh;
  point2.position.z = p2zh;

  scene.add(point1);
  scene.add(point2);
}

function computeCurveHermiteForm() {
  setupHermitePoints();

  let uVal;
  curvePoints.length = 0;

  for (let i = 0; i < noUPoints; ++i) {
    uVal = uStep * i;
    let pt = computePointHermiteForm(uVal);
    curvePoints.push(pt.xVal, pt.yVal, pt.zVal);
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
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(curvePoints, 3)
  );
  curveLine = new THREE.Line(geometry, material);
  scene.add(curveLine);
  render();
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
