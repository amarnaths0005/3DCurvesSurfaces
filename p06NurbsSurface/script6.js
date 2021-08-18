// HTML Program to draw and manipulate a NURBS Surface
// Written by Amarnath S, amarnaths.codeproject@gmail.com, July 2019
// Modified and fixed some bugs - August 2019
// Revised August 2021. Fixed an issue with computation of normals.
//  Now, Three.js does the normal computations.

// NURBS Surface = Non Uniform Rational B-Spline Surface

/* Requirements:
   1. Should enable the user to modify the x, y, z and h coordinates (homogeneous coordinates) 
       of 49 control points constituting a NURBS Surface (7 x 7 grid of control points).
       The range for coordinates of the control points should be [-1,1]. The user should 
       be able to modify these through sliders.
   2. Should display the NURBS Surface on the screen, and this surface should 
      change dynamically as the user modifies any of the values using sliders. 
      Perspective View. 
   3. Should display the bounding box of dimension 2 units, centred at the origin.
   4. Should enable the user to modify the camera angle (degrees), from which 
      viewing is done.
   5. Should enable the user to modify the u, w values of a chosen point, and should 
      display a moving point on the curve as the user modifies these values 
      using the sliders.
   6. Should display the knot vectors used for either of u or w.
   7. All user input should be via sliders.
   8. Should use WebGL, in the form of three.js. 

   Note: Rather than write the NURBS code myself and reinvent the wheel, I have taken 
   relevant extracts from the examples provided by three.js. These are all contained 
   in the file nurbsHelper.js. This has the NurbsCurve and NurbsSurface definitions.
   We just pass the inputs and get these classes to generate points on the curve and 
   surface.

    Tested on Chrome, Firefox, on Windows.
    Uses WebGL as available in three.js
 */

"use strict";

let scene, camera, renderer;
let cameraAngle, camRadius;
let cameraAngleRange;
let halfCubeSide;
let arrowHelper1, arrowHelper2, arrowHelper3;
let arrowDirection1 = new THREE.Vector3();
let arrowDirection2 = new THREE.Vector3();
let arrowDirection3 = new THREE.Vector3();
let noPoints = 7;
let points = new Array(noPoints);
let degreeU, degreeW, selUdegree, selWdegree;
let knotVectorU = [],
  knotVectorW = [];
let nurbsSurface;
let surfacePoints = [];
let noDivisions = 30;
let step, width, tableData;
let surfaceMesh, lineWire, wireCheck;
let selectedRow, selectedi, selectedj;
let pointToShow, pointxRange, pointyRange, pointzRange, pointwRange;
let opx, opy, opz, opw;
let controlx, controly, controlz, controlw;
let pointUW, uRange, wRange, uValue, wValue;
let controlQuadrilateral = new Array(noPoints - 1);

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

  window.addEventListener("resize", onResize, false);

  for (let i = 0; i < points.length; i++) {
    points[i] = new Array(noPoints);
  }

  for (let j = 0; j < noPoints; ++j) {
    for (let i = 0; i < noPoints; ++i) {
      points[i][j] = new THREE.Vector4(0.0, 0.0, 0.0, 1.0);
    }
  }

  for (let i = 0; i < noPoints - 1; ++i) {
    controlQuadrilateral[i] = new Array(noPoints - 1);
  }

  initializeValues();

  // Camera Angle
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

  cameraAngle = 25;
  camRadius = 5;
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

  scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

  // White directional light at 0.65 intensity shining from the top.
  let directionalLight = new THREE.DirectionalLight(0xffffff, 0.65);
  scene.add(directionalLight);

  wireCheck = document.getElementById("wireframe");
  wireCheck.addEventListener("click", handleWireframe, false);

  // x, y, z, w sliders
  pointxRange = document.getElementById("pointx");
  pointyRange = document.getElementById("pointy");
  pointzRange = document.getElementById("pointz");
  pointwRange = document.getElementById("pointw");
  opx = document.getElementById("opPointx");
  opy = document.getElementById("opPointy");
  opz = document.getElementById("opPointz");
  opw = document.getElementById("opPointw");

  pointxRange.addEventListener(
    "input",
    function () {
      controlx = parseFloat(pointxRange.value);
      document.getElementById("opPointx").textContent = controlx.toFixed(3);
      points[selectedi][selectedj].x = controlx;
      updatePointsTable();
      plotControlQuadrilaterals();
      computeNurbsSurface();
      showCurrentPoint(
        points[selectedi][selectedj].x,
        points[selectedi][selectedj].y,
        points[selectedi][selectedj].z
      );
      handleUWValue();
      highlightSelectedRow();
    },
    false
  );

  pointyRange.addEventListener(
    "input",
    function () {
      controly = parseFloat(pointyRange.value);
      document.getElementById("opPointy").textContent = controly.toFixed(3);
      points[selectedi][selectedj].y = controly;
      updatePointsTable();
      plotControlQuadrilaterals();
      computeNurbsSurface();
      showCurrentPoint(
        points[selectedi][selectedj].x,
        points[selectedi][selectedj].y,
        points[selectedi][selectedj].z
      );
      handleUWValue();
      highlightSelectedRow();
    },
    false
  );

  pointzRange.addEventListener(
    "input",
    function () {
      controlz = parseFloat(pointzRange.value);
      document.getElementById("opPointz").textContent = controlz.toFixed(3);
      points[selectedi][selectedj].z = controlz;
      updatePointsTable();
      plotControlQuadrilaterals();
      computeNurbsSurface();
      showCurrentPoint(
        points[selectedi][selectedj].x,
        points[selectedi][selectedj].y,
        points[selectedi][selectedj].z
      );
      handleUWValue();
      highlightSelectedRow();
    },
    false
  );

  pointwRange.addEventListener(
    "input",
    function () {
      controlw = parseFloat(pointwRange.value);
      document.getElementById("opPointw").textContent = controlw.toFixed(3);
      points[selectedi][selectedj].w = controlw;
      updatePointsTable();
      plotControlQuadrilaterals();
      computeNurbsSurface();
      showCurrentPoint(
        points[selectedi][selectedj].x,
        points[selectedi][selectedj].y,
        points[selectedi][selectedj].z
      );
      handleUWValue();
      highlightSelectedRow();
    },
    false
  );

  // Degree U select box
  selUdegree = document.getElementById("udegree");
  selUdegree.addEventListener(
    "change",
    function () {
      degreeU = parseInt(selUdegree.value);
      updateKnotVectors();
      computeNurbsSurface();
      handleUWValue();
    },
    false
  );

  // Degree W select box
  selWdegree = document.getElementById("wdegree");
  selWdegree.addEventListener(
    "change",
    function () {
      degreeW = parseInt(selWdegree.value);
      updateKnotVectors();
      computeNurbsSurface();
      handleUWValue();
    },
    false
  );

  // Parameter U
  uRange = document.getElementById("uValue");
  uRange.addEventListener(
    "input",
    function () {
      uValue = parseFloat(uRange.value);
      document.getElementById("opUvalue").textContent = uValue.toFixed(3);
      handleUWValue();
    },
    false
  );

  // Parameter W
  wRange = document.getElementById("wValue");
  wRange.addEventListener(
    "input",
    function () {
      wValue = parseFloat(wRange.value);
      document.getElementById("opWvalue").textContent = wValue.toFixed(3);
      handleUWValue();
    },
    false
  );

  // Knot Vector U button
  document.getElementById("knotU").addEventListener(
    "click",
    function () {
      let knotString = knotVectorU[0].toFixed(3);
      for (let i = 1; i < knotVectorU.length; ++i) {
        knotString += ", " + knotVectorU[i].toFixed(3);
      }
      alert("The knot U vector is \n" + knotString);
    },
    false
  );

  // Knot Vector W button
  document.getElementById("knotW").addEventListener(
    "click",
    function () {
      let knotString = knotVectorW[0].toFixed(3);
      for (let i = 1; i < knotVectorW.length; ++i) {
        knotString += ", " + knotVectorW[i].toFixed(3);
      }
      alert("The knot W vector is \n" + knotString);
    },
    false
  );

  // Camera Angle
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

  setupWireframeBox();
  plotControlQuadrilaterals();
  computeNurbsSurface();
  handleCameraAngle();
  handleUWValue();
  selectedi = 0;
  selectedj = 0;
  editRow(selectedi, selectedj);
  highlightSelectedRow();

  document.getElementById("webglOp").appendChild(renderer.domElement);

  animate();
  render();
}

function initializeValues() {
  // For a 3 x 3 grid, we use this set of control points
  // points[0][0].x = 0.1; points[0][0].y = -1.0; points[0][0].z = -1.0;
  // points[0][1].x = -0.1; points[0][1].y = -1.0; points[0][1].z = 0.0;
  // points[0][2].x = 0.1; points[0][2].y = -1.0; points[0][2].z = 1.0;

  // points[1][0].x = -0.1; points[1][0].y = 0.0; points[1][0].z = -1.0;
  // points[1][1].x = 0.1; points[1][1].y = 0.0; points[1][1].z = 0.0;
  // points[1][2].x = -0.1; points[1][2].y = 0.0; points[1][2].z = 1.0;

  // points[2][0].x = 0.1; points[2][0].y = 1.0; points[2][0].z = -1.0;
  // points[2][1].x = -0.1; points[2][1].y = 1.0; points[2][1].z = 0.0;
  // points[2][2].x = 0.1; points[2][2].y = 1.0; points[2][2].z = 1.0;

  points[0][0].x = 0.1;
  points[0][0].y = -1.0;
  points[0][0].z = -1.0;
  points[0][1].x = -0.1;
  points[0][1].y = -1.0;
  points[0][1].z = -0.66;
  points[0][2].x = 0.1;
  points[0][2].y = -1.0;
  points[0][2].z = -0.33;
  points[0][3].x = -0.1;
  points[0][3].y = -1.0;
  points[0][3].z = -0.0;
  points[0][4].x = 0.1;
  points[0][4].y = -1.0;
  points[0][4].z = 0.33;
  points[0][5].x = -0.1;
  points[0][5].y = -1.0;
  points[0][5].z = 0.66;
  points[0][6].x = 0.1;
  points[0][6].y = -1.0;
  points[0][6].z = 1.0;

  points[1][0].x = -0.1;
  points[1][0].y = -0.66;
  points[1][0].z = -1.0;
  points[1][1].x = 0.1;
  points[1][1].y = -0.66;
  points[1][1].z = -0.66;
  points[1][2].x = -0.1;
  points[1][2].y = -0.66;
  points[1][2].z = -0.33;
  points[1][3].x = 0.1;
  points[1][3].y = -0.66;
  points[1][3].z = -0.0;
  points[1][4].x = -0.1;
  points[1][4].y = -0.66;
  points[1][4].z = 0.33;
  points[1][5].x = 0.1;
  points[1][5].y = -0.66;
  points[1][5].z = 0.66;
  points[1][6].x = -0.1;
  points[1][6].y = -0.66;
  points[1][6].z = 1.0;

  points[2][0].x = 0.1;
  points[2][0].y = -0.33;
  points[2][0].z = -1.0;
  points[2][1].x = -0.1;
  points[2][1].y = -0.33;
  points[2][1].z = -0.66;
  points[2][2].x = 0.1;
  points[2][2].y = -0.33;
  points[2][2].z = -0.33;
  points[2][3].x = -0.1;
  points[2][3].y = -0.33;
  points[2][3].z = -0.0;
  points[2][4].x = 0.1;
  points[2][4].y = -0.33;
  points[2][4].z = 0.33;
  points[2][5].x = -0.1;
  points[2][5].y = -0.33;
  points[2][5].z = 0.66;
  points[2][6].x = 0.1;
  points[2][6].y = -0.33;
  points[2][6].z = 1.0;

  points[3][0].x = -0.1;
  points[3][0].y = 0.0;
  points[3][0].z = -1.0;
  points[3][1].x = 0.1;
  points[3][1].y = 0.0;
  points[3][1].z = -0.66;
  points[3][2].x = -0.1;
  points[3][2].y = 0.0;
  points[3][2].z = -0.33;
  points[3][3].x = 0.1;
  points[3][3].y = 0.0;
  points[3][3].z = -0.0;
  points[3][4].x = -0.1;
  points[3][4].y = 0.0;
  points[3][4].z = 0.33;
  points[3][5].x = 0.1;
  points[3][5].y = 0.0;
  points[3][5].z = 0.66;
  points[3][6].x = -0.1;
  points[3][6].y = 0.0;
  points[3][6].z = 1.0;

  points[4][0].x = 0.1;
  points[4][0].y = 0.33;
  points[4][0].z = -1.0;
  points[4][1].x = -0.1;
  points[4][1].y = 0.33;
  points[4][1].z = -0.66;
  points[4][2].x = 0.1;
  points[4][2].y = 0.33;
  points[4][2].z = -0.33;
  points[4][3].x = -0.1;
  points[4][3].y = 0.33;
  points[4][3].z = -0.0;
  points[4][4].x = 0.1;
  points[4][4].y = 0.33;
  points[4][4].z = 0.33;
  points[4][5].x = -0.1;
  points[4][5].y = 0.33;
  points[4][5].z = 0.66;
  points[4][6].x = 0.1;
  points[4][6].y = 0.33;
  points[4][6].z = 1.0;

  points[5][0].x = -0.1;
  points[5][0].y = 0.66;
  points[5][0].z = -1.0;
  points[5][1].x = 0.1;
  points[5][1].y = 0.66;
  points[5][1].z = -0.66;
  points[5][2].x = -0.1;
  points[5][2].y = 0.66;
  points[5][2].z = -0.33;
  points[5][3].x = 0.1;
  points[5][3].y = 0.66;
  points[5][3].z = -0.0;
  points[5][4].x = -0.1;
  points[5][4].y = 0.66;
  points[5][4].z = 0.33;
  points[5][5].x = 0.1;
  points[5][5].y = 0.66;
  points[5][5].z = 0.66;
  points[5][6].x = -0.1;
  points[5][6].y = 0.66;
  points[5][6].z = 1.0;

  points[6][0].x = 0.1;
  points[6][0].y = 1.0;
  points[6][0].z = -1.0;
  points[6][1].x = -0.1;
  points[6][1].y = 1.0;
  points[6][1].z = -0.66;
  points[6][2].x = 0.1;
  points[6][2].y = 1.0;
  points[6][2].z = -0.33;
  points[6][3].x = -0.1;
  points[6][3].y = 1.0;
  points[6][3].z = -0.0;
  points[6][4].x = 0.1;
  points[6][4].y = 1.0;
  points[6][4].z = 0.33;
  points[6][5].x = -0.1;
  points[6][5].y = 1.0;
  points[6][5].z = 0.66;
  points[6][6].x = 0.1;
  points[6][6].y = 1.0;
  points[6][6].z = 1.0;

  degreeU = 2;
  degreeW = 2;

  step = 1.0 / noDivisions;

  updatePointsTable();
  updateKnotVectors();
}

function updatePointsTable() {
  document.getElementById("tablePointsBody").innerHTML = "";
  tableData = "";
  // Add Header to tableData
  tableData += "<tr>";
  tableData += "<th> Point </t>";
  tableData += "<th> x </th>";
  tableData += "<th> y </th>";
  tableData += "<th> z </th>";
  tableData += "<th> h </th>";
  tableData += "<th> Edit </th>";
  tableData += "</tr>";

  for (let j = 0; j < noPoints; ++j) {
    for (let i = 0; i < noPoints; ++i) {
      tableData += "<tr>";
      let i1 = "Point " + i;
      let i2 = i1 + j;

      tableData += "<td> " + i2 + "</td>";
      tableData += "<td> " + points[i][j].x.toFixed(3) + "</td>";
      tableData += "<td> " + points[i][j].y.toFixed(3) + "</td>";
      tableData += "<td> " + points[i][j].z.toFixed(3) + "</td>";
      tableData += "<td> " + points[i][j].w.toFixed(3) + "</td>";
      tableData +=
        '<td><button onclick="editRow(' + i + "," + j + ')">Edit</button></td>';
      tableData += "</tr>";
    }
  }
  document.getElementById("tablePointsBody").innerHTML = tableData;
}

function editRow(i, j) {
  selectedRow = i;
  selectedi = i;
  selectedj = j;
  let i1 = "Point " + i;
  let i2 = i1 + j;

  highlightSelectedRow();

  let legend = i2 + " Homogeneous Coordinates";
  document.getElementById("pointLegend").innerHTML = legend;

  pointxRange.value = points[i][j].x;
  opx.innerHTML = points[i][j].x.toFixed(3);

  pointyRange.value = points[i][j].y;
  opy.innerHTML = points[i][j].y.toFixed(3);

  pointzRange.value = points[i][j].z;
  opz.innerHTML = points[i][j].z.toFixed(3);

  pointwRange.value = points[i][j].w;
  opw.innerHTML = points[i][j].w.toFixed(3);

  showCurrentPoint(points[i][j].x, points[i][j].y, points[i][j].z);
}

function highlightSelectedRow() {
  for (let i = 0; i <= noPoints * noPoints; ++i) {
    document.getElementById("tablePointsBody").rows[i].className =
      "notselected";
  }
  selectedRow = selectedi + selectedj * noPoints;
  document.getElementById("tablePointsBody").rows[selectedRow + 1].className =
    "selected";
}

function showCurrentPoint(x, y, z) {
  scene.remove(pointToShow);

  let sphereGeometry = new THREE.SphereGeometry(0.015, 20, 20);

  let sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    wireframe: false,
  });

  pointToShow = new THREE.Mesh(sphereGeometry, sphereMaterial);
  pointToShow.position.x = x;
  pointToShow.position.y = y;
  pointToShow.position.z = z;

  scene.add(pointToShow);
}

function updateKnotVectors() {
  knotVectorU.length = 0;
  knotVectorW.length = 0;

  for (let i = 0; i <= degreeU; i++) {
    knotVectorU.push(0);
  }

  for (let i = 0, j = noPoints; i < j; i++) {
    let knot = (i + 1) / (j - degreeU);
    knotVectorU.push(THREE.Math.clamp(knot, 0, 1));
  }

  for (let i = 0; i <= degreeW; i++) {
    knotVectorW.push(0);
  }

  for (let i = 0, j = noPoints; i < j; i++) {
    let knot = (i + 1) / (j - degreeW);
    knotVectorW.push(THREE.Math.clamp(knot, 0, 1));
  }
}

function handleUWValue() {
  scene.remove(pointUW);
  let uVal, wVal;
  uVal = parseFloat(uRange.value);
  wVal = parseFloat(wRange.value);
  let pt = new Vector3();
  nurbsSurface.getPoint(uVal, wVal, pt);

  let sphereGeometry = new THREE.SphereGeometry(0.02, 20, 20);
  let sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: false,
  });
  pointUW = new THREE.Mesh(sphereGeometry, sphereMaterial);
  pointUW.position.x = pt.x;
  pointUW.position.y = pt.y;
  pointUW.position.z = pt.z;

  scene.add(pointUW);
}

function handleWireframe() {
  computeNurbsSurface();
}

function plotControlQuadrilaterals() {
  for (let j = 0; j < noPoints - 1; ++j) {
    for (let i = 0; i < noPoints - 1; ++i) {
      scene.remove(controlQuadrilateral[i][j]);
    }
  }

  let material = new THREE.LineBasicMaterial({
    color: 0xffff00,
    opacity: 0.25,
    transparent: true,
  });

  for (let j = 0; j < noPoints - 1; ++j) {
    for (let i = 0; i < noPoints - 1; ++i) {
      let poi1 = points[i][j];
      let poi2 = points[i][j + 1];
      let poi3 = points[i + 1][j + 1];
      let poi4 = points[i + 1][j];
      let geom = new THREE.BufferGeometry();
      let vertices = [];
      vertices.length = 0;
      vertices.push(poi1.x, poi1.y, poi1.z);
      vertices.push(poi2.x, poi2.x, poi2.z);
      vertices.push(poi3.x, poi3.y, poi3.z);
      vertices.push(poi4.x, poi4.y, poi4.z);
      vertices.push(poi1.x, poi1.y, poi1.z);
      geom.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3)
      );
      controlQuadrilateral[i][j] = new THREE.Line(geom, material);
      scene.add(controlQuadrilateral[i][j]);
    }
  }
}

function computeNurbsSurface() {
  nurbsSurface = new NURBSSurface(
    degreeU,
    degreeW,
    knotVectorU,
    knotVectorW,
    points
  );

  surfacePoints.length = 0;
  let uVal, wVal;

  for (let j = 0; j <= noDivisions; ++j) {
    wVal = j * step;
    for (let i = 0; i <= noDivisions; ++i) {
      uVal = i * step;
      let pt = new Vector3();
      nurbsSurface.getPoint(uVal, wVal, pt);
      //let poi = new THREE.Vector3();
      surfacePoints.push(pt.x, pt.y, pt.z);
    }
  }
  renderNurbsSurface();
}

function disposeArray() {
  this.array = null;
}

function renderNurbsSurface() {
  scene.remove(surfaceMesh);
  scene.remove(lineWire);

  let material = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    color: 0x00ffff,
    emissive: 0x111111,
    dithering: true,
    flatShading: false,
    roughness: 1,
    metalness: 0.15,
    skinning: true,
  });

  let materialLine = new THREE.LineBasicMaterial({
    color: 0x00ffff,
  });

  let geometry = new THREE.BufferGeometry();
  const indices = [];
  indices.length = 0;

  for (let i = 0; i < noDivisions; i++) {
    for (let j = 0; j < noDivisions; j++) {
      const a = i * (noDivisions + 1) + (j + 1);
      const b = i * (noDivisions + 1) + j;
      const c = (i + 1) * (noDivisions + 1) + j;
      const d = (i + 1) * (noDivisions + 1) + (j + 1);

      // generate two faces (triangles) per iteration

      indices.push(a, b, d); // face one
      indices.push(b, c, d); // face two
    }
  }

  geometry.setIndex(indices);
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(surfacePoints, 3).onUpload(disposeArray)
  );
  geometry.computeVertexNormals();

  if (document.getElementById("wireframe").checked === true) {
    let surfaceWire = new THREE.WireframeGeometry(geometry);
    lineWire = new THREE.LineSegments(surfaceWire, materialLine);
    scene.add(lineWire);
  } else {
    surfaceMesh = new THREE.Mesh(geometry, material);
    scene.add(surfaceMesh);
  }

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
  let cameraHeight = 3;
  camera.position.set(xCam, cameraHeight, zCam);
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
