// HTML Program to draw and manipulate a NURBS Curve
// Written by Amarnath S, amarnaths.codeproject@gmail.com, July 2019

// NURBS Curve = Non Uniform Rational B-Spline Curve

/* Requirements:
   1. Should enable the user to modify the x, y, z coordinates of the up to 20 control 
       points constituting a NURBS Curve.
       The range for coordinates of the control points should be [-1,1]. The user should 
       be able to modify these through sliders.
   2. Should display the NURBS Curve on the screen, and this curve should 
      change dynamically as the user modifies any of the values using sliders. 
      Perspective View. 
   3. Should display the bounding box of dimension 2 units, centred at the origin.
   4. Should enable the user to modify the camera angle (degrees), from which 
      viewing is done.
   5. Should enable the user to modify the u values of a chosen point, and should 
      display a moving point on the curve as the user modifies these values 
      using the sliders.
   6. All user input should be via sliders.
   7. Should use WebGL, in the form of three.js. 

   Note: Rather than write the NURBS code myself and reinvent the wheel, I have taken 
   relevant extracts from the examples provided by three.js. These are all contained 
   in the file nurbsHelper.js. 

    Tested on Chrome, Firefox, on Windows.
    Uses WebGL as available in three.js
 */

"option strict";

let scene, camera, renderer;
let cameraAngle, camRadius;
let cameraAngleRange;
let halfCubeSide;
let arrowHelper1, arrowHelper2, arrowHelper3;
let arrowDirection1 = new THREE.Vector3();
let arrowDirection2 = new THREE.Vector3();
let arrowDirection3 = new THREE.Vector3();
let nurbsControlPoints = [];
let maxNoNurbsControlPoints = 20;
let minNoNurbsControlPoints = 6;
let noNurbsControlPoints;
let lineControl, nurbsLine;
let nurbsDegree; // Degree of polynomial
let knotVector = [];
let buttonAdd;
let tablePts;
let max, min;
let tableData;
let selectedRow;
let pointxRange, pointyRange, pointzRange, pointwRange;
let opx, opy, opz, opw;
let controlx, controly, controlz, controlw;
let selDegree;
let pointToShow;
let nurbsCurve;
let uRange, uValue, pointU;

window.onload = init;

function init() {
  initializeValues();

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

  // Add button
  buttonAdd = document.getElementById("addRow");
  buttonAdd.addEventListener("click", handleRowAdd, false);

  // Degree select box
  selDegree = document.getElementById("degree");
  selDegree.addEventListener(
    "change",
    function () {
      nurbsDegree = parseInt(selDegree.value);
      updateKnotVector();
      renderLineAndNurbsCurve();
      handleUValue();
    },
    false
  );

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
      nurbsControlPoints[selectedRow].x = controlx;
      updatePointsTable();
      renderLineAndNurbsCurve();
      showCurrentPoint(
        nurbsControlPoints[selectedRow].x,
        nurbsControlPoints[selectedRow].y,
        nurbsControlPoints[selectedRow].z
      );
      handleUValue();
      highlightSelectedRow();
    },
    false
  );

  pointyRange.addEventListener(
    "input",
    function () {
      controly = parseFloat(pointyRange.value);
      document.getElementById("opPointy").textContent = controly.toFixed(3);
      nurbsControlPoints[selectedRow].y = controly;
      updatePointsTable();
      renderLineAndNurbsCurve();
      showCurrentPoint(
        nurbsControlPoints[selectedRow].x,
        nurbsControlPoints[selectedRow].y,
        nurbsControlPoints[selectedRow].z
      );
      handleUValue();
      highlightSelectedRow();
    },
    false
  );

  pointzRange.addEventListener(
    "input",
    function () {
      controlz = parseFloat(pointzRange.value);
      document.getElementById("opPointz").textContent = controlz.toFixed(3);
      nurbsControlPoints[selectedRow].z = controlz;
      updatePointsTable();
      renderLineAndNurbsCurve();
      showCurrentPoint(
        nurbsControlPoints[selectedRow].x,
        nurbsControlPoints[selectedRow].y,
        nurbsControlPoints[selectedRow].z
      );
      handleUValue();
      highlightSelectedRow();
    },
    false
  );

  pointwRange.addEventListener(
    "input",
    function () {
      controlw = parseFloat(pointwRange.value);
      document.getElementById("opPointw").textContent = controlw.toFixed(3);
      nurbsControlPoints[selectedRow].w = controlw;
      updatePointsTable();
      renderLineAndNurbsCurve();
      showCurrentPoint(
        nurbsControlPoints[selectedRow].x,
        nurbsControlPoints[selectedRow].y,
        nurbsControlPoints[selectedRow].z
      );
      handleUValue();
      highlightSelectedRow();
    },
    false
  );

  document.getElementById("knot").addEventListener(
    "click",
    function () {
      let knotString = knotVector[0].toFixed(3);
      for (let i = 1; i < knotVector.length; ++i) {
        knotString += ", " + knotVector[i].toFixed(3);
      }
      alert("The knot vector is \n" + knotString);
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

  // Parameter U
  uRange = document.getElementById("uValue");
  uRange.addEventListener(
    "input",
    function () {
      uValue = parseFloat(uRange.value);
      document.getElementById("opUvalue").textContent = uValue.toFixed(3);
      handleUValue();
    },
    false
  );

  setupWireframeBox();
  renderLineAndNurbsCurve();
  handleCameraAngle();
  handleUValue();
  selectedRow = 0;
  editRow(selectedRow);

  document.getElementById("webglOp").appendChild(renderer.domElement);

  animate();
  render();
}

function handleUValue() {
  let pt = nurbsCurve.getPointAt(uValue);
  scene.remove(pointU);

  let sphereGeometry = new THREE.SphereGeometry(0.015, 20, 20);
  let sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: false,
  });

  pointU = new THREE.Mesh(sphereGeometry, sphereMaterial);
  pointU.position.x = pt.x;
  pointU.position.y = pt.y;
  pointU.position.z = pt.z;

  scene.add(pointU);
}

function initializeValues() {
  tablePts = document.getElementById("tablePointsBody");
  noNurbsControlPoints = 6;
  nurbsDegree = 3;
  nurbsControlPoints.length = 0;
  max = 1.0;
  min = -1.0;
  uValue = 0.6;

  for (let i = 0; i < noNurbsControlPoints; ++i) {
    let x = Math.random() * (max - min) + min;
    let y = Math.random() * (max - min) + min;
    let z = Math.random() * (max - min) + min;

    let poi = new THREE.Vector4(x, y, z, 1.0);
    nurbsControlPoints.push(poi);
  }
  updatePointsTable();
  updateKnotVector();
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
  tableData += "<th> Delete </th>";
  tableData += "</tr>";

  for (let i = 0; i < nurbsControlPoints.length; ++i) {
    tableData += "<tr>";
    let i1 = i + 1;
    str1 = "Point " + i1;
    tableData += "<td> " + str1 + "</td>";
    tableData += "<td> " + nurbsControlPoints[i].x.toFixed(3) + "</td>";
    tableData += "<td> " + nurbsControlPoints[i].y.toFixed(3) + "</td>";
    tableData += "<td> " + nurbsControlPoints[i].z.toFixed(3) + "</td>";
    tableData += "<td> " + nurbsControlPoints[i].w.toFixed(3) + "</td>";
    tableData += '<td><button onclick="editRow(' + i + ')">Edit</button></td>';
    tableData +=
      '<td><button onclick="deleteRow(' + i + ')">Delete</button></td>';
    tableData += "</tr>";
  }
  document.getElementById("tablePointsBody").innerHTML = tableData;
}

// Note: This is not the best way to do this, but this is as per my current
// understanding and knowledge.
function highlightSelectedRow() {
  for (let i = 0; i <= nurbsControlPoints.length; ++i) {
    document.getElementById("tablePointsBody").rows[i].className =
      "notselected";
  }
  document.getElementById("tablePointsBody").rows[selectedRow + 1].className =
    "selected";
}

function editRow(i) {
  selectedRow = i;
  let i1 = i + 1;

  highlightSelectedRow();

  let legend = "Point " + i1 + " Homogeneous Coordinates";
  document.getElementById("pointLegend").innerHTML = legend;

  pointxRange.value = nurbsControlPoints[i].x;
  opx.innerHTML = nurbsControlPoints[i].x.toFixed(3);

  pointyRange.value = nurbsControlPoints[i].y;
  opy.innerHTML = nurbsControlPoints[i].y.toFixed(3);

  pointzRange.value = nurbsControlPoints[i].z;
  opz.innerHTML = nurbsControlPoints[i].z.toFixed(3);

  pointwRange.value = nurbsControlPoints[i].w;
  opw.innerHTML = nurbsControlPoints[i].w.toFixed(3);

  showCurrentPoint(
    nurbsControlPoints[i].x,
    nurbsControlPoints[i].y,
    nurbsControlPoints[i].z
  );
  handleUValue();
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

function deleteRow(i) {
  if (nurbsControlPoints.length > minNoNurbsControlPoints) {
    nurbsControlPoints.splice(i, 1);
    updatePointsTable();
    updateKnotVector();
    renderLineAndNurbsCurve();
    handleUValue();
    scene.remove(pointToShow);
    editRow(i - 1);
  } else {
    alert(
      "Cannot delete any further points; I need at least 6 Control Points to work."
    );
  }
}

function updateKnotVector() {
  knotVector.length = 0;

  for (let i = 0; i <= nurbsDegree; i++) {
    knotVector.push(0);
  }

  for (let i = 0, j = nurbsControlPoints.length; i < j; i++) {
    let knot = (i + 1) / (j - nurbsDegree);
    knotVector.push(THREE.Math.clamp(knot, 0, 1));
  }
}

function handleRowAdd() {
  if (nurbsControlPoints.length < maxNoNurbsControlPoints) {
    let x = Math.random() * (max - min) + min;
    let y = Math.random() * (max - min) + min;
    let z = Math.random() * (max - min) + min;
    let w = 1.0;
    let poi = new THREE.Vector4(x, y, z, w);
    nurbsControlPoints.push(poi);
    updatePointsTable();

    let elem = document.getElementById("tablePointsBody");
    elem.scrollBy({
      top: elem.offsetHeight, // Scroll to the end of the table's height
      behavior: "smooth",
    });

    updateKnotVector();
    renderLineAndNurbsCurve();
    handleUValue();
  } else {
    alert("I can only handle a maximum of 20 Control Points.");
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

function renderLineAndNurbsCurve() {
  scene.remove(lineControl);
  scene.remove(nurbsLine);

  let material = new THREE.LineBasicMaterial({
    color: 0xffff00,
    opacity: 0.25,
    transparent: true,
  });

  noNurbsControlPoints = nurbsControlPoints.length;
  let geometry = new THREE.BufferGeometry();
  let vertices = [];
  vertices.length = 0;
  for (let i = 0; i < nurbsControlPoints.length; ++i) {
    let poi = nurbsControlPoints[i];
    vertices.push(poi.x, poi.y, poi.z);
  }
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  lineControl = new THREE.Line(geometry, material);

  // Nurbs Curve
  nurbsCurve = new NURBSCurve(nurbsDegree, knotVector, nurbsControlPoints);
  let nurbsGeometry = new THREE.BufferGeometry();
  nurbsGeometry.setFromPoints(nurbsCurve.getPoints(200));
  let nurbsMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff });
  nurbsLine = new THREE.Line(nurbsGeometry, nurbsMaterial);
  scene.add(lineControl);
  scene.add(nurbsLine);
  handleUValue();
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
