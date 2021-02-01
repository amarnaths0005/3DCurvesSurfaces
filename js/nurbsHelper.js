/*
Extracted the relevant code portions from these files:
  - three.module.js - from the build folder
  - NURBSUtils.js - from the examples folder
  - NURBSCurve.js - from the examples folder
  - NURBSSurface.js - from the examples folder

  available at the three.js Github site.
 */

function Quaternion(x, y, z, w) {
	this._x = x || 0;
	this._y = y || 0;
	this._z = z || 0;
	this._w = (w !== undefined) ? w : 1;
}

Object.assign(Quaternion, {
	slerp: function (qa, qb, qm, t) {
		return qm.copy(qa).slerp(qb, t);
	},

	slerpFlat: function (dst, dstOffset, src0, srcOffset0, src1, srcOffset1, t) {
		// fuzz-free, array-based Quaternion SLERP operation
		var x0 = src0[srcOffset0 + 0],
			y0 = src0[srcOffset0 + 1],
			z0 = src0[srcOffset0 + 2],
			w0 = src0[srcOffset0 + 3],

			x1 = src1[srcOffset1 + 0],
			y1 = src1[srcOffset1 + 1],
			z1 = src1[srcOffset1 + 2],
			w1 = src1[srcOffset1 + 3];

		if (w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1) {
			var s = 1 - t,
				cos = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1,
				dir = (cos >= 0 ? 1 : - 1),
				sqrSin = 1 - cos * cos;

			// Skip the Slerp for tiny steps to avoid numeric problems:
			if (sqrSin > Number.EPSILON) {
				var sin = Math.sqrt(sqrSin),
					len = Math.atan2(sin, cos * dir);

				s = Math.sin(s * len) / sin;
				t = Math.sin(t * len) / sin;
			}
			var tDir = t * dir;

			x0 = x0 * s + x1 * tDir;
			y0 = y0 * s + y1 * tDir;
			z0 = z0 * s + z1 * tDir;
			w0 = w0 * s + w1 * tDir;

			// Normalize in case we just did a lerp:
			if (s === 1 - t) {
				var f = 1 / Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0);
				x0 *= f;
				y0 *= f;
				z0 *= f;
				w0 *= f;
			}
		}

		dst[dstOffset] = x0;
		dst[dstOffset + 1] = y0;
		dst[dstOffset + 2] = z0;
		dst[dstOffset + 3] = w0;
	}
});

Object.defineProperties(Quaternion.prototype, {
	x: {
		get: function () {
			return this._x;
		},

		set: function (value) {
			this._x = value;
			this._onChangeCallback();
		}
	},

	y: {
		get: function () {
			return this._y;
		},

		set: function (value) {
			this._y = value;
			this._onChangeCallback();
		}
	},

	z: {
		get: function () {
			return this._z;
		},

		set: function (value) {
			this._z = value;
			this._onChangeCallback();
		}
	},

	w: {
		get: function () {
			return this._w;
		},

		set: function (value) {
			this._w = value;
			this._onChangeCallback();
		}
	}
});

Object.assign(Quaternion.prototype, {
	isQuaternion: true,
	set: function (x, y, z, w) {
		this._x = x;
		this._y = y;
		this._z = z;
		this._w = w;
		this._onChangeCallback();
		return this;
	},

	clone: function () {
		return new this.constructor(this._x, this._y, this._z, this._w);
	},

	copy: function (quaternion) {
		this._x = quaternion.x;
		this._y = quaternion.y;
		this._z = quaternion.z;
		this._w = quaternion.w;
		this._onChangeCallback();
		return this;
	},

	setFromEuler: function (euler, update) {
		if (!(euler && euler.isEuler)) {
			throw new Error('THREE.Quaternion: .setFromEuler() now expects an Euler rotation rather than a Vector3 and order.');
		}

		var x = euler._x, y = euler._y, z = euler._z, order = euler.order;

		// http://www.mathworks.com/matlabcentral/fileexchange/
		// 	20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
		//	content/SpinCalc.m

		var cos = Math.cos;
		var sin = Math.sin;

		var c1 = cos(x / 2);
		var c2 = cos(y / 2);
		var c3 = cos(z / 2);

		var s1 = sin(x / 2);
		var s2 = sin(y / 2);
		var s3 = sin(z / 2);

		if (order === 'XYZ') {
			this._x = s1 * c2 * c3 + c1 * s2 * s3;
			this._y = c1 * s2 * c3 - s1 * c2 * s3;
			this._z = c1 * c2 * s3 + s1 * s2 * c3;
			this._w = c1 * c2 * c3 - s1 * s2 * s3;
		} else if (order === 'YXZ') {
			this._x = s1 * c2 * c3 + c1 * s2 * s3;
			this._y = c1 * s2 * c3 - s1 * c2 * s3;
			this._z = c1 * c2 * s3 - s1 * s2 * c3;
			this._w = c1 * c2 * c3 + s1 * s2 * s3;
		} else if (order === 'ZXY') {
			this._x = s1 * c2 * c3 - c1 * s2 * s3;
			this._y = c1 * s2 * c3 + s1 * c2 * s3;
			this._z = c1 * c2 * s3 + s1 * s2 * c3;
			this._w = c1 * c2 * c3 - s1 * s2 * s3;
		} else if (order === 'ZYX') {
			this._x = s1 * c2 * c3 - c1 * s2 * s3;
			this._y = c1 * s2 * c3 + s1 * c2 * s3;
			this._z = c1 * c2 * s3 - s1 * s2 * c3;
			this._w = c1 * c2 * c3 + s1 * s2 * s3;
		} else if (order === 'YZX') {
			this._x = s1 * c2 * c3 + c1 * s2 * s3;
			this._y = c1 * s2 * c3 + s1 * c2 * s3;
			this._z = c1 * c2 * s3 - s1 * s2 * c3;
			this._w = c1 * c2 * c3 - s1 * s2 * s3;
		} else if (order === 'XZY') {
			this._x = s1 * c2 * c3 - c1 * s2 * s3;
			this._y = c1 * s2 * c3 - s1 * c2 * s3;
			this._z = c1 * c2 * s3 + s1 * s2 * c3;
			this._w = c1 * c2 * c3 + s1 * s2 * s3;
		}
		if (update !== false) this._onChangeCallback();
		return this;
	},

	setFromAxisAngle: function (axis, angle) {
		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm
		// assumes axis is normalized

		var halfAngle = angle / 2, s = Math.sin(halfAngle);
		this._x = axis.x * s;
		this._y = axis.y * s;
		this._z = axis.z * s;
		this._w = Math.cos(halfAngle);
		this._onChangeCallback();
		return this;
	},

	setFromRotationMatrix: function (m) {
		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		var te = m.elements,
			m11 = te[0], m12 = te[4], m13 = te[8],
			m21 = te[1], m22 = te[5], m23 = te[9],
			m31 = te[2], m32 = te[6], m33 = te[10],
			trace = m11 + m22 + m33,
			s;

		if (trace > 0) {
			s = 0.5 / Math.sqrt(trace + 1.0);
			this._w = 0.25 / s;
			this._x = (m32 - m23) * s;
			this._y = (m13 - m31) * s;
			this._z = (m21 - m12) * s;
		} else if (m11 > m22 && m11 > m33) {
			s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);
			this._w = (m32 - m23) / s;
			this._x = 0.25 * s;
			this._y = (m12 + m21) / s;
			this._z = (m13 + m31) / s;
		} else if (m22 > m33) {
			s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);
			this._w = (m13 - m31) / s;
			this._x = (m12 + m21) / s;
			this._y = 0.25 * s;
			this._z = (m23 + m32) / s;
		} else {
			s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);
			this._w = (m21 - m12) / s;
			this._x = (m13 + m31) / s;
			this._y = (m23 + m32) / s;
			this._z = 0.25 * s;
		}
		this._onChangeCallback();
		return this;
	},

	setFromUnitVectors: function (vFrom, vTo) {
		// assumes direction vectors vFrom and vTo are normalized
		var EPS = 0.000001;
		var r = vFrom.dot(vTo) + 1;
		if (r < EPS) {
			r = 0;
			if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
				this._x = - vFrom.y;
				this._y = vFrom.x;
				this._z = 0;
				this._w = r;
			} else {
				this._x = 0;
				this._y = - vFrom.z;
				this._z = vFrom.y;
				this._w = r;
			}
		} else {
			// crossVectors( vFrom, vTo ); // inlined to avoid cyclic dependency on Vector3
			this._x = vFrom.y * vTo.z - vFrom.z * vTo.y;
			this._y = vFrom.z * vTo.x - vFrom.x * vTo.z;
			this._z = vFrom.x * vTo.y - vFrom.y * vTo.x;
			this._w = r;
		}
		return this.normalize();
	},

	angleTo: function (q) {
		return 2 * Math.acos(Math.abs(_Math.clamp(this.dot(q), - 1, 1)));
	},

	rotateTowards: function (q, step) {
		var angle = this.angleTo(q);
		if (angle === 0) return this;
		var t = Math.min(1, step / angle);
		this.slerp(q, t);
		return this;
	},

	inverse: function () {
		// quaternion is assumed to have unit length
		return this.conjugate();
	},

	conjugate: function () {
		this._x *= - 1;
		this._y *= - 1;
		this._z *= - 1;
		this._onChangeCallback();
		return this;
	},

	dot: function (v) {
		return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;
	},

	lengthSq: function () {
		return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
	},

	length: function () {
		return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
	},

	normalize: function () {
		var l = this.length();
		if (l === 0) {
			this._x = 0;
			this._y = 0;
			this._z = 0;
			this._w = 1;
		} else {
			l = 1 / l;
			this._x = this._x * l;
			this._y = this._y * l;
			this._z = this._z * l;
			this._w = this._w * l;
		}
		this._onChangeCallback();
		return this;
	},

	multiply: function (q, p) {
		if (p !== undefined) {
			console.warn('THREE.Quaternion: .multiply() now only accepts one argument. Use .multiplyQuaternions( a, b ) instead.');
			return this.multiplyQuaternions(q, p);
		}
		return this.multiplyQuaternions(this, q);
	},

	premultiply: function (q) {
		return this.multiplyQuaternions(q, this);
	},

	multiplyQuaternions: function (a, b) {
		// from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm
		var qax = a._x, qay = a._y, qaz = a._z, qaw = a._w;
		var qbx = b._x, qby = b._y, qbz = b._z, qbw = b._w;
		this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
		this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
		this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
		this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
		this._onChangeCallback();
		return this;
	},

	slerp: function (qb, t) {
		if (t === 0) return this;
		if (t === 1) return this.copy(qb);
		var x = this._x, y = this._y, z = this._z, w = this._w;
		// http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/
		var cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z;
		if (cosHalfTheta < 0) {
			this._w = - qb._w;
			this._x = - qb._x;
			this._y = - qb._y;
			this._z = - qb._z;
			cosHalfTheta = - cosHalfTheta;
		} else {
			this.copy(qb);
		}

		if (cosHalfTheta >= 1.0) {
			this._w = w;
			this._x = x;
			this._y = y;
			this._z = z;
			return this;
		}

		var sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta;
		if (sqrSinHalfTheta <= Number.EPSILON) {
			var s = 1 - t;
			this._w = s * w + t * this._w;
			this._x = s * x + t * this._x;
			this._y = s * y + t * this._y;
			this._z = s * z + t * this._z;
			this.normalize();
			this._onChangeCallback();
			return this;
		}

		var sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
		var halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
		var ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta,
			ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

		this._w = (w * ratioA + this._w * ratioB);
		this._x = (x * ratioA + this._x * ratioB);
		this._y = (y * ratioA + this._y * ratioB);
		this._z = (z * ratioA + this._z * ratioB);

		this._onChangeCallback();
		return this;
	},

	equals: function (quaternion) {
		return (quaternion._x === this._x) && (quaternion._y === this._y) && (quaternion._z === this._z) && (quaternion._w === this._w);
	},

	fromArray: function (array, offset) {
		if (offset === undefined) offset = 0;
		this._x = array[offset];
		this._y = array[offset + 1];
		this._z = array[offset + 2];
		this._w = array[offset + 3];
		this._onChangeCallback();
		return this;
	},

	toArray: function (array, offset) {
		if (array === undefined) array = [];
		if (offset === undefined) offset = 0;
		array[offset] = this._x;
		array[offset + 1] = this._y;
		array[offset + 2] = this._z;
		array[offset + 3] = this._w;
		return array;
	},

	_onChange: function (callback) {
		this._onChangeCallback = callback;
		return this;
	},

	_onChangeCallback: function () { }
});

function Vector3(x, y, z) {
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
}

Object.assign(Vector3.prototype, {
	isVector3: true,
	set: function (x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
		return this;
	},

	setScalar: function (scalar) {
		this.x = scalar;
		this.y = scalar;
		this.z = scalar;
		return this;
	},

	setX: function (x) {
		this.x = x;
		return this;
	},

	setY: function (y) {
		this.y = y;
		return this;
	},

	setZ: function (z) {
		this.z = z;
		return this;
	},

	setComponent: function (index, value) {
		switch (index) {
			case 0: this.x = value; break;
			case 1: this.y = value; break;
			case 2: this.z = value; break;
			default: throw new Error('index is out of range: ' + index);
		}
		return this;
	},

	getComponent: function (index) {
		switch (index) {
			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
			default: throw new Error('index is out of range: ' + index);
		}
	},

	clone: function () {
		return new this.constructor(this.x, this.y, this.z);
	},

	copy: function (v) {
		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
		return this;
	},

	add: function (v, w) {
		if (w !== undefined) {
			console.warn('THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead.');
			return this.addVectors(v, w);
		}
		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
		return this;
	},

	addScalar: function (s) {
		this.x += s;
		this.y += s;
		this.z += s;
		return this;
	},

	addVectors: function (a, b) {
		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;
		return this;
	},

	addScaledVector: function (v, s) {
		this.x += v.x * s;
		this.y += v.y * s;
		this.z += v.z * s;
		return this;
	},

	sub: function (v, w) {
		if (w !== undefined) {
			console.warn('THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.');
			return this.subVectors(v, w);
		}
		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
		return this;
	},

	subScalar: function (s) {
		this.x -= s;
		this.y -= s;
		this.z -= s;
		return this;
	},

	subVectors: function (a, b) {
		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;
		return this;
	},

	multiply: function (v, w) {
		if (w !== undefined) {
			console.warn('THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead.');
			return this.multiplyVectors(v, w);
		}
		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;
		return this;
	},

	multiplyScalar: function (scalar) {
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		return this;
	},

	multiplyVectors: function (a, b) {
		this.x = a.x * b.x;
		this.y = a.y * b.y;
		this.z = a.z * b.z;
		return this;
	},

	applyEuler: function () {
		var quaternion = new Quaternion();
		return function applyEuler(euler) {
			if (!(euler && euler.isEuler)) {
				console.error('THREE.Vector3: .applyEuler() now expects an Euler rotation rather than a Vector3 and order.');
			}
			return this.applyQuaternion(quaternion.setFromEuler(euler));
		};
	}(),

	applyAxisAngle: function () {
		var quaternion = new Quaternion();
		return function applyAxisAngle(axis, angle) {
			return this.applyQuaternion(quaternion.setFromAxisAngle(axis, angle));
		};
	}(),

	applyMatrix3: function (m) {
		var x = this.x, y = this.y, z = this.z;
		var e = m.elements;
		this.x = e[0] * x + e[3] * y + e[6] * z;
		this.y = e[1] * x + e[4] * y + e[7] * z;
		this.z = e[2] * x + e[5] * y + e[8] * z;
		return this;
	},

	applyMatrix4: function (m) {
		var x = this.x, y = this.y, z = this.z;
		var e = m.elements;
		var w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
		this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
		this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
		this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
		return this;
	},

	applyQuaternion: function (q) {
		var x = this.x, y = this.y, z = this.z;
		var qx = q.x, qy = q.y, qz = q.z, qw = q.w;
		// calculate quat * vector
		var ix = qw * x + qy * z - qz * y;
		var iy = qw * y + qz * x - qx * z;
		var iz = qw * z + qx * y - qy * x;
		var iw = - qx * x - qy * y - qz * z;
		// calculate result * inverse quat
		this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
		this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
		this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;
		return this;
	},

	project: function (camera) {
		return this.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
	},

	unproject: function (camera) {
		return this.applyMatrix4(camera.projectionMatrixInverse).applyMatrix4(camera.matrixWorld);
	},

	transformDirection: function (m) {
		// input: THREE.Matrix4 affine matrix
		// vector interpreted as a direction
		var x = this.x, y = this.y, z = this.z;
		var e = m.elements;
		this.x = e[0] * x + e[4] * y + e[8] * z;
		this.y = e[1] * x + e[5] * y + e[9] * z;
		this.z = e[2] * x + e[6] * y + e[10] * z;
		return this.normalize();
	},

	divide: function (v) {
		this.x /= v.x;
		this.y /= v.y;
		this.z /= v.z;
		return this;
	},

	divideScalar: function (scalar) {
		return this.multiplyScalar(1 / scalar);
	},

	min: function (v) {
		this.x = Math.min(this.x, v.x);
		this.y = Math.min(this.y, v.y);
		this.z = Math.min(this.z, v.z);
		return this;
	},

	max: function (v) {
		this.x = Math.max(this.x, v.x);
		this.y = Math.max(this.y, v.y);
		this.z = Math.max(this.z, v.z);
		return this;
	},

	clamp: function (min, max) {
		// assumes min < max, componentwise
		this.x = Math.max(min.x, Math.min(max.x, this.x));
		this.y = Math.max(min.y, Math.min(max.y, this.y));
		this.z = Math.max(min.z, Math.min(max.z, this.z));
		return this;
	},

	clampScalar: function (minVal, maxVal) {
		this.x = Math.max(minVal, Math.min(maxVal, this.x));
		this.y = Math.max(minVal, Math.min(maxVal, this.y));
		this.z = Math.max(minVal, Math.min(maxVal, this.z));
		return this;
	},

	clampLength: function (min, max) {
		var length = this.length();
		return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
	},

	floor: function () {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		this.z = Math.floor(this.z);
		return this;
	},

	ceil: function () {
		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);
		this.z = Math.ceil(this.z);
		return this;
	},

	round: function () {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		this.z = Math.round(this.z);
		return this;
	},

	roundToZero: function () {
		this.x = (this.x < 0) ? Math.ceil(this.x) : Math.floor(this.x);
		this.y = (this.y < 0) ? Math.ceil(this.y) : Math.floor(this.y);
		this.z = (this.z < 0) ? Math.ceil(this.z) : Math.floor(this.z);
		return this;
	},

	negate: function () {
		this.x = - this.x;
		this.y = - this.y;
		this.z = - this.z;
		return this;
	},

	dot: function (v) {
		return this.x * v.x + this.y * v.y + this.z * v.z;
	},

	// TODO lengthSquared?
	lengthSq: function () {
		return this.x * this.x + this.y * this.y + this.z * this.z;
	},

	length: function () {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	},

	manhattanLength: function () {
		return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
	},

	normalize: function () {
		return this.divideScalar(this.length() || 1);
	},

	setLength: function (length) {
		return this.normalize().multiplyScalar(length);
	},

	lerp: function (v, alpha) {
		this.x += (v.x - this.x) * alpha;
		this.y += (v.y - this.y) * alpha;
		this.z += (v.z - this.z) * alpha;
		return this;
	},

	lerpVectors: function (v1, v2, alpha) {
		return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
	},

	cross: function (v, w) {
		if (w !== undefined) {
			console.warn('THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead.');
			return this.crossVectors(v, w);
		}
		return this.crossVectors(this, v);
	},

	crossVectors: function (a, b) {
		var ax = a.x, ay = a.y, az = a.z;
		var bx = b.x, by = b.y, bz = b.z;
		this.x = ay * bz - az * by;
		this.y = az * bx - ax * bz;
		this.z = ax * by - ay * bx;
		return this;
	},

	projectOnVector: function (vector) {
		var scalar = vector.dot(this) / vector.lengthSq();
		return this.copy(vector).multiplyScalar(scalar);
	},

	projectOnPlane: function () {
		var v1 = new Vector3();
		return function projectOnPlane(planeNormal) {
			v1.copy(this).projectOnVector(planeNormal);
			return this.sub(v1);
		};
	}(),

	reflect: function () {
		// reflect incident vector off plane orthogonal to normal
		// normal is assumed to have unit length
		var v1 = new Vector3();
		return function reflect(normal) {
			return this.sub(v1.copy(normal).multiplyScalar(2 * this.dot(normal)));
		};
	}(),

	angleTo: function (v) {
		var theta = this.dot(v) / (Math.sqrt(this.lengthSq() * v.lengthSq()));
		// clamp, to handle numerical problems
		return Math.acos(_Math.clamp(theta, - 1, 1));
	},

	distanceTo: function (v) {
		return Math.sqrt(this.distanceToSquared(v));
	},

	distanceToSquared: function (v) {
		var dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
		return dx * dx + dy * dy + dz * dz;
	},

	manhattanDistanceTo: function (v) {
		return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
	},

	setFromSpherical: function (s) {
		return this.setFromSphericalCoords(s.radius, s.phi, s.theta);
	},

	setFromSphericalCoords: function (radius, phi, theta) {
		var sinPhiRadius = Math.sin(phi) * radius;
		this.x = sinPhiRadius * Math.sin(theta);
		this.y = Math.cos(phi) * radius;
		this.z = sinPhiRadius * Math.cos(theta);
		return this;
	},

	setFromCylindrical: function (c) {
		return this.setFromCylindricalCoords(c.radius, c.theta, c.y);
	},

	setFromCylindricalCoords: function (radius, theta, y) {
		this.x = radius * Math.sin(theta);
		this.y = y;
		this.z = radius * Math.cos(theta);
		return this;
	},

	setFromMatrixPosition: function (m) {
		var e = m.elements;
		this.x = e[12];
		this.y = e[13];
		this.z = e[14];
		return this;
	},

	setFromMatrixScale: function (m) {
		var sx = this.setFromMatrixColumn(m, 0).length();
		var sy = this.setFromMatrixColumn(m, 1).length();
		var sz = this.setFromMatrixColumn(m, 2).length();
		this.x = sx;
		this.y = sy;
		this.z = sz;
		return this;
	},

	setFromMatrixColumn: function (m, index) {
		return this.fromArray(m.elements, index * 4);
	},

	equals: function (v) {
		return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z));
	},

	fromArray: function (array, offset) {
		if (offset === undefined) offset = 0;
		this.x = array[offset];
		this.y = array[offset + 1];
		this.z = array[offset + 2];
		return this;
	},

	toArray: function (array, offset) {
		if (array === undefined) array = [];
		if (offset === undefined) offset = 0;
		array[offset] = this.x;
		array[offset + 1] = this.y;
		array[offset + 2] = this.z;
		return array;
	},

	fromBufferAttribute: function (attribute, index, offset) {
		if (offset !== undefined) {
			console.warn('THREE.Vector3: offset has been removed from .fromBufferAttribute().');
		}
		this.x = attribute.getX(index);
		this.y = attribute.getY(index);
		this.z = attribute.getZ(index);
		return this;
	}
});

function Vector4(x, y, z, w) {
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
	this.w = (w !== undefined) ? w : 1;
}

Object.defineProperties(Vector4.prototype, {
	"width": {
		get: function () {
			return this.z;
		},
		set: function (value) {
			this.z = value;
		}
	},

	"height": {
		get: function () {
			return this.w;
		},
		set: function (value) {
			this.w = value;
		}
	}
});

Object.assign(Vector4.prototype, {
	isVector4: true,
	set: function (x, y, z, w) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
		return this;
	},

	setScalar: function (scalar) {
		this.x = scalar;
		this.y = scalar;
		this.z = scalar;
		this.w = scalar;
		return this;
	},

	setX: function (x) {
		this.x = x;
		return this;
	},

	setY: function (y) {
		this.y = y;
		return this;
	},

	setZ: function (z) {
		this.z = z;
		return this;
	},

	setW: function (w) {
		this.w = w;
		return this;
	},

	setComponent: function (index, value) {
		switch (index) {
			case 0: this.x = value; break;
			case 1: this.y = value; break;
			case 2: this.z = value; break;
			case 3: this.w = value; break;
			default: throw new Error('index is out of range: ' + index);
		}
		return this;
	},

	getComponent: function (index) {
		switch (index) {
			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
			case 3: return this.w;
			default: throw new Error('index is out of range: ' + index);
		}
	},

	clone: function () {
		return new this.constructor(this.x, this.y, this.z, this.w);
	},

	copy: function (v) {
		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
		this.w = (v.w !== undefined) ? v.w : 1;
		return this;
	},

	add: function (v, w) {
		if (w !== undefined) {
			console.warn('THREE.Vector4: .add() now only accepts one argument. Use .addVectors( a, b ) instead.');
			return this.addVectors(v, w);
		}
		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
		this.w += v.w;
		return this;
	},

	addScalar: function (s) {
		this.x += s;
		this.y += s;
		this.z += s;
		this.w += s;
		return this;
	},

	addVectors: function (a, b) {
		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;
		this.w = a.w + b.w;
		return this;
	},

	addScaledVector: function (v, s) {
		this.x += v.x * s;
		this.y += v.y * s;
		this.z += v.z * s;
		this.w += v.w * s;
		return this;
	},

	sub: function (v, w) {
		if (w !== undefined) {
			console.warn('THREE.Vector4: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.');
			return this.subVectors(v, w);
		}
		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
		this.w -= v.w;
		return this;
	},

	subScalar: function (s) {
		this.x -= s;
		this.y -= s;
		this.z -= s;
		this.w -= s;
		return this;
	},

	subVectors: function (a, b) {
		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;
		this.w = a.w - b.w;
		return this;
	},

	multiplyScalar: function (scalar) {
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		this.w *= scalar;
		return this;
	},

	applyMatrix4: function (m) {
		var x = this.x, y = this.y, z = this.z, w = this.w;
		var e = m.elements;
		this.x = e[0] * x + e[4] * y + e[8] * z + e[12] * w;
		this.y = e[1] * x + e[5] * y + e[9] * z + e[13] * w;
		this.z = e[2] * x + e[6] * y + e[10] * z + e[14] * w;
		this.w = e[3] * x + e[7] * y + e[11] * z + e[15] * w;
		return this;
	},

	divideScalar: function (scalar) {
		return this.multiplyScalar(1 / scalar);
	},

	setAxisAngleFromQuaternion: function (q) {
		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToAngle/index.htm
		// q is assumed to be normalized
		this.w = 2 * Math.acos(q.w);
		var s = Math.sqrt(1 - q.w * q.w);
		if (s < 0.0001) {
			this.x = 1;
			this.y = 0;
			this.z = 0;
		} else {
			this.x = q.x / s;
			this.y = q.y / s;
			this.z = q.z / s;
		}
		return this;
	},

	setAxisAngleFromRotationMatrix: function (m) {
		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToAngle/index.htm
		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
		var angle, x, y, z,		// variables for result
			epsilon = 0.01,		// margin to allow for rounding errors
			epsilon2 = 0.1,		// margin to distinguish between 0 and 180 degrees
			te = m.elements,
			m11 = te[0], m12 = te[4], m13 = te[8],
			m21 = te[1], m22 = te[5], m23 = te[9],
			m31 = te[2], m32 = te[6], m33 = te[10];
		if ((Math.abs(m12 - m21) < epsilon) &&
			(Math.abs(m13 - m31) < epsilon) &&
			(Math.abs(m23 - m32) < epsilon)) {
			// singularity found
			// first check for identity matrix which must have +1 for all terms
			// in leading diagonal and zero in other terms
			if ((Math.abs(m12 + m21) < epsilon2) &&
				(Math.abs(m13 + m31) < epsilon2) &&
				(Math.abs(m23 + m32) < epsilon2) &&
				(Math.abs(m11 + m22 + m33 - 3) < epsilon2)) {

				// this singularity is identity matrix so angle = 0
				this.set(1, 0, 0, 0);
				return this; // zero angle, arbitrary axis
			}

			// otherwise this singularity is angle = 180
			angle = Math.PI;
			var xx = (m11 + 1) / 2;
			var yy = (m22 + 1) / 2;
			var zz = (m33 + 1) / 2;
			var xy = (m12 + m21) / 4;
			var xz = (m13 + m31) / 4;
			var yz = (m23 + m32) / 4;

			if ((xx > yy) && (xx > zz)) {
				// m11 is the largest diagonal term
				if (xx < epsilon) {
					x = 0;
					y = 0.707106781;
					z = 0.707106781;
				} else {
					x = Math.sqrt(xx);
					y = xy / x;
					z = xz / x;
				}
			} else if (yy > zz) {
				// m22 is the largest diagonal term
				if (yy < epsilon) {
					x = 0.707106781;
					y = 0;
					z = 0.707106781;
				} else {
					y = Math.sqrt(yy);
					x = xy / y;
					z = yz / y;
				}
			} else {
				// m33 is the largest diagonal term so base result on this
				if (zz < epsilon) {
					x = 0.707106781;
					y = 0.707106781;
					z = 0;
				} else {
					z = Math.sqrt(zz);
					x = xz / z;
					y = yz / z;
				}
			}

			this.set(x, y, z, angle);
			return this; // return 180 deg rotation
		}

		// as we have reached here there are no singularities so we can handle normally
		var s = Math.sqrt((m32 - m23) * (m32 - m23) +
			(m13 - m31) * (m13 - m31) +
			(m21 - m12) * (m21 - m12)); // used to normalize

		if (Math.abs(s) < 0.001) s = 1;
		// prevent divide by zero, should not happen if matrix is orthogonal and should be
		// caught by singularity test above, but I've left it in just in case

		this.x = (m32 - m23) / s;
		this.y = (m13 - m31) / s;
		this.z = (m21 - m12) / s;
		this.w = Math.acos((m11 + m22 + m33 - 1) / 2);
		return this;
	},

	min: function (v) {
		this.x = Math.min(this.x, v.x);
		this.y = Math.min(this.y, v.y);
		this.z = Math.min(this.z, v.z);
		this.w = Math.min(this.w, v.w);
		return this;
	},

	max: function (v) {
		this.x = Math.max(this.x, v.x);
		this.y = Math.max(this.y, v.y);
		this.z = Math.max(this.z, v.z);
		this.w = Math.max(this.w, v.w);
		return this;
	},

	clamp: function (min, max) {
		// assumes min < max, componentwise
		this.x = Math.max(min.x, Math.min(max.x, this.x));
		this.y = Math.max(min.y, Math.min(max.y, this.y));
		this.z = Math.max(min.z, Math.min(max.z, this.z));
		this.w = Math.max(min.w, Math.min(max.w, this.w));
		return this;
	},

	clampScalar: function () {
		var min, max;
		return function clampScalar(minVal, maxVal) {
			if (min === undefined) {
				min = new Vector4();
				max = new Vector4();
			}
			min.set(minVal, minVal, minVal, minVal);
			max.set(maxVal, maxVal, maxVal, maxVal);
			return this.clamp(min, max);
		};
	}(),

	clampLength: function (min, max) {
		var length = this.length();
		return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
	},

	floor: function () {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		this.z = Math.floor(this.z);
		this.w = Math.floor(this.w);
		return this;
	},

	ceil: function () {
		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);
		this.z = Math.ceil(this.z);
		this.w = Math.ceil(this.w);
		return this;
	},

	round: function () {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		this.z = Math.round(this.z);
		this.w = Math.round(this.w);
		return this;
	},

	roundToZero: function () {
		this.x = (this.x < 0) ? Math.ceil(this.x) : Math.floor(this.x);
		this.y = (this.y < 0) ? Math.ceil(this.y) : Math.floor(this.y);
		this.z = (this.z < 0) ? Math.ceil(this.z) : Math.floor(this.z);
		this.w = (this.w < 0) ? Math.ceil(this.w) : Math.floor(this.w);
		return this;
	},

	negate: function () {
		this.x = - this.x;
		this.y = - this.y;
		this.z = - this.z;
		this.w = - this.w;
		return this;
	},

	dot: function (v) {
		return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
	},

	lengthSq: function () {
		return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
	},

	length: function () {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
	},

	manhattanLength: function () {
		return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
	},

	normalize: function () {
		return this.divideScalar(this.length() || 1);
	},

	setLength: function (length) {

		return this.normalize().multiplyScalar(length);

	},

	lerp: function (v, alpha) {
		this.x += (v.x - this.x) * alpha;
		this.y += (v.y - this.y) * alpha;
		this.z += (v.z - this.z) * alpha;
		this.w += (v.w - this.w) * alpha;
		return this;
	},

	lerpVectors: function (v1, v2, alpha) {
		return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
	},

	equals: function (v) {
		return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z) && (v.w === this.w));
	},

	fromArray: function (array, offset) {
		if (offset === undefined) offset = 0;
		this.x = array[offset];
		this.y = array[offset + 1];
		this.z = array[offset + 2];
		this.w = array[offset + 3];
		return this;
	},

	toArray: function (array, offset) {
		if (array === undefined) array = [];
		if (offset === undefined) offset = 0;
		array[offset] = this.x;
		array[offset + 1] = this.y;
		array[offset + 2] = this.z;
		array[offset + 3] = this.w;
		return array;
	},

	fromBufferAttribute: function (attribute, index, offset) {
		if (offset !== undefined) {
			console.warn('THREE.Vector4: offset has been removed from .fromBufferAttribute().');
		}
		this.x = attribute.getX(index);
		this.y = attribute.getY(index);
		this.z = attribute.getZ(index);
		this.w = attribute.getW(index);
		return this;
	}
});

/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Extensible curve object
 *
 * Some common of curve methods:
 * .getPoint( t, optionalTarget ), .getTangent( t )
 * .getPointAt( u, optionalTarget ), .getTangentAt( u )
 * .getPoints(), .getSpacedPoints()
 * .getLength()
 * .updateArcLengths()
 *
 * This following curves inherit from THREE.Curve:
 *
 * -- 2D curves --
 * THREE.ArcCurve
 * THREE.CubicBezierCurve
 * THREE.EllipseCurve
 * THREE.LineCurve
 * THREE.QuadraticBezierCurve
 * THREE.SplineCurve
 *
 * -- 3D curves --
 * THREE.CatmullRomCurve3
 * THREE.CubicBezierCurve3
 * THREE.LineCurve3
 * THREE.QuadraticBezierCurve3
 *
 * A series of curves can be represented as a THREE.CurvePath.
 *
 **/

/**************************************************************
 *	Abstract Curve base class
 **************************************************************/

function Curve() {
	this.type = 'Curve';
	this.arcLengthDivisions = 200;
}

Object.assign(Curve.prototype, {
	// Virtual base class method to overwrite and implement in subclasses
	//	- t [0 .. 1]
	getPoint: function ( /* t, optionalTarget */) {
		console.warn('THREE.Curve: .getPoint() not implemented.');
		return null;
	},

	// Get point at relative position in curve according to arc length
	// - u [0 .. 1]
	getPointAt: function (u, optionalTarget) {
		var t = this.getUtoTmapping(u);
		return this.getPoint(t, optionalTarget);
	},

	// Get sequence of points using getPoint( t )
	getPoints: function (divisions) {
		if (divisions === undefined) divisions = 5;
		var points = [];
		for (var d = 0; d <= divisions; d++) {
			points.push(this.getPoint(d / divisions));
		}
		return points;
	},

	// Get sequence of points using getPointAt( u )
	getSpacedPoints: function (divisions) {
		if (divisions === undefined) divisions = 5;
		var points = [];
		for (var d = 0; d <= divisions; d++) {
			points.push(this.getPointAt(d / divisions));
		}
		return points;
	},

	// Get total curve arc length
	getLength: function () {
		var lengths = this.getLengths();
		return lengths[lengths.length - 1];
	},

	// Get list of cumulative segment lengths
	getLengths: function (divisions) {
		if (divisions === undefined) divisions = this.arcLengthDivisions;
		if (this.cacheArcLengths &&
			(this.cacheArcLengths.length === divisions + 1) &&
			!this.needsUpdate) {
			return this.cacheArcLengths;
		}

		this.needsUpdate = false;
		var cache = [];
		var current, last = this.getPoint(0);
		var p, sum = 0;
		cache.push(0);

		for (p = 1; p <= divisions; p++) {
			current = this.getPoint(p / divisions);
			sum += current.distanceTo(last);
			cache.push(sum);
			last = current;
		}

		this.cacheArcLengths = cache;
		return cache; // { sums: cache, sum: sum }; Sum is in the last element.
	},

	updateArcLengths: function () {
		this.needsUpdate = true;
		this.getLengths();
	},

	// Given u ( 0 .. 1 ), get a t to find p. This gives you points which are equidistant
	getUtoTmapping: function (u, distance) {
		var arcLengths = this.getLengths();
		var i = 0, il = arcLengths.length;
		var targetArcLength; // The targeted u distance value to get
		if (distance) {
			targetArcLength = distance;
		} else {
			targetArcLength = u * arcLengths[il - 1];
		}

		// binary search for the index with largest value smaller than target u distance
		var low = 0, high = il - 1, comparison;
		while (low <= high) {
			i = Math.floor(low + (high - low) / 2); // less likely to overflow, though probably not issue here, JS doesn't really have integers, all numbers are floats
			comparison = arcLengths[i] - targetArcLength;
			if (comparison < 0) {
				low = i + 1;
			} else if (comparison > 0) {
				high = i - 1;
			} else {
				high = i;
				break;
				// DONE
			}
		}

		i = high;
		if (arcLengths[i] === targetArcLength) {
			return i / (il - 1);
		}

		// we could get finer grain at lengths, or use simple interpolation between two points
		var lengthBefore = arcLengths[i];
		var lengthAfter = arcLengths[i + 1];
		var segmentLength = lengthAfter - lengthBefore;
		// determine where we are between the 'before' and 'after' points
		var segmentFraction = (targetArcLength - lengthBefore) / segmentLength;
		// add that fractional amount to t
		var t = (i + segmentFraction) / (il - 1);
		return t;
	},

	// Returns a unit vector tangent at t
	// In case any sub curve does not implement its tangent derivation,
	// 2 points a small delta apart will be used to find its gradient
	// which seems to give a reasonable approximation
	getTangent: function (t) {
		var delta = 0.0001;
		var t1 = t - delta;
		var t2 = t + delta;
		// Capping in case of danger

		if (t1 < 0) t1 = 0;
		if (t2 > 1) t2 = 1;
		var pt1 = this.getPoint(t1);
		var pt2 = this.getPoint(t2);
		var vec = pt2.clone().sub(pt1);
		return vec.normalize();
	},

	getTangentAt: function (u) {
		var t = this.getUtoTmapping(u);
		return this.getTangent(t);
	},

	computeFrenetFrames: function (segments, closed) {
		// see http://www.cs.indiana.edu/pub/techreports/TR425.pdf
		var normal = new Vector3();
		var tangents = [];
		var normals = [];
		var binormals = [];
		var vec = new Vector3();
		var mat = new Matrix4();
		var i, u, theta;
		// compute the tangent vectors for each segment on the curve
		for (i = 0; i <= segments; i++) {
			u = i / segments;
			tangents[i] = this.getTangentAt(u);
			tangents[i].normalize();
		}

		// select an initial normal vector perpendicular to the first tangent vector,
		// and in the direction of the minimum tangent xyz component
		normals[0] = new Vector3();
		binormals[0] = new Vector3();
		var min = Number.MAX_VALUE;
		var tx = Math.abs(tangents[0].x);
		var ty = Math.abs(tangents[0].y);
		var tz = Math.abs(tangents[0].z);

		if (tx <= min) {
			min = tx;
			normal.set(1, 0, 0);
		}

		if (ty <= min) {
			min = ty;
			normal.set(0, 1, 0);
		}

		if (tz <= min) {
			normal.set(0, 0, 1);
		}

		vec.crossVectors(tangents[0], normal).normalize();
		normals[0].crossVectors(tangents[0], vec);
		binormals[0].crossVectors(tangents[0], normals[0]);

		// compute the slowly-varying normal and binormal vectors for each segment on the curve
		for (i = 1; i <= segments; i++) {
			normals[i] = normals[i - 1].clone();
			binormals[i] = binormals[i - 1].clone();
			vec.crossVectors(tangents[i - 1], tangents[i]);
			if (vec.length() > Number.EPSILON) {
				vec.normalize();
				theta = Math.acos(_Math.clamp(tangents[i - 1].dot(tangents[i]), - 1, 1)); // clamp for floating pt errors
				normals[i].applyMatrix4(mat.makeRotationAxis(vec, theta));
			}
			binormals[i].crossVectors(tangents[i], normals[i]);
		}

		// if the curve is closed, postprocess the vectors so the first and last normal vectors are the same
		if (closed === true) {
			theta = Math.acos(_Math.clamp(normals[0].dot(normals[segments]), - 1, 1));
			theta /= segments;
			if (tangents[0].dot(vec.crossVectors(normals[0], normals[segments])) > 0) {
				theta = - theta;
			}

			for (i = 1; i <= segments; i++) {
				// twist a little...
				normals[i].applyMatrix4(mat.makeRotationAxis(tangents[i], theta * i));
				binormals[i].crossVectors(tangents[i], normals[i]);
			}
		}

		return {
			tangents: tangents,
			normals: normals,
			binormals: binormals
		};
	},

	clone: function () {
		return new this.constructor().copy(this);
	},

	copy: function (source) {
		this.arcLengthDivisions = source.arcLengthDivisions;
		return this;
	},

	toJSON: function () {
		var data = {
			metadata: {
				version: 4.5,
				type: 'Curve',
				generator: 'Curve.toJSON'
			}
		};

		data.arcLengthDivisions = this.arcLengthDivisions;
		data.type = this.type;
		return data;
	},

	fromJSON: function (json) {
		this.arcLengthDivisions = json.arcLengthDivisions;
		return this;
	}
});

var NURBSUtils = {
	/*
	Finds knot vector span.

	p : degree
	u : parametric value
	U : knot vector

	returns the span
	*/
	findSpan: function (p, u, U) {
		var n = U.length - p - 1;
		if (u >= U[n]) {
			return n - 1;
		}

		if (u <= U[p]) {
			return p;
		}

		var low = p;
		var high = n;
		var mid = Math.floor((low + high) / 2);

		while (u < U[mid] || u >= U[mid + 1]) {
			if (u < U[mid]) {
				high = mid;
			} else {
				low = mid;
			}
			mid = Math.floor((low + high) / 2);
		}
		return mid;
	},

	/*
	Calculate basis functions. See The NURBS Book, page 70, algorithm A2.2

	span : span in which u lies
	u    : parametric point
	p    : degree
	U    : knot vector

	returns array[p+1] with basis functions values.
	*/
	calcBasisFunctions: function (span, u, p, U) {
		var N = [];
		var left = [];
		var right = [];
		N[0] = 1.0;
		for (var j = 1; j <= p; ++j) {
			left[j] = u - U[span + 1 - j];
			right[j] = U[span + j] - u;
			var saved = 0.0;
			for (var r = 0; r < j; ++r) {
				var rv = right[r + 1];
				var lv = left[j - r];
				var temp = N[r] / (rv + lv);
				N[r] = saved + rv * temp;
				saved = lv * temp;
			}
			N[j] = saved;
		}
		return N;
	},

	/*
	Calculate B-Spline curve points. See The NURBS Book, page 82, algorithm A3.1.

	p : degree of B-Spline
	U : knot vector
	P : control points (x, y, z, w)
	u : parametric point

	returns point for given u
	*/
	calcBSplinePoint: function (p, U, P, u) {
		var span = this.findSpan(p, u, U);
		var N = this.calcBasisFunctions(span, u, p, U);
		var C = new Vector4(0, 0, 0, 0);
		for (var j = 0; j <= p; ++j) {
			var point = P[span - p + j];
			var Nj = N[j];
			var wNj = point.w * Nj;
			C.x += point.x * wNj;
			C.y += point.y * wNj;
			C.z += point.z * wNj;
			C.w += point.w * Nj;
		}
		return C;
	},

	/*
	Calculate basis functions derivatives. See The NURBS Book, page 72, algorithm A2.3.

	span : span in which u lies
	u    : parametric point
	p    : degree
	n    : number of derivatives to calculate
	U    : knot vector

	returns array[n+1][p+1] with basis functions derivatives
	*/
	calcBasisFunctionDerivatives: function (span, u, p, n, U) {
		var zeroArr = [];
		for (var i = 0; i <= p; ++i)
			zeroArr[i] = 0.0;

		var ders = [];
		for (var i = 0; i <= n; ++i)
			ders[i] = zeroArr.slice(0);

		var ndu = [];
		for (var i = 0; i <= p; ++i)
			ndu[i] = zeroArr.slice(0);

		ndu[0][0] = 1.0;

		var left = zeroArr.slice(0);
		var right = zeroArr.slice(0);

		for (var j = 1; j <= p; ++j) {
			left[j] = u - U[span + 1 - j];
			right[j] = U[span + j] - u;

			var saved = 0.0;

			for (var r = 0; r < j; ++r) {
				var rv = right[r + 1];
				var lv = left[j - r];
				ndu[j][r] = rv + lv;

				var temp = ndu[r][j - 1] / ndu[j][r];
				ndu[r][j] = saved + rv * temp;
				saved = lv * temp;
			}
			ndu[j][j] = saved;
		}

		for (var j = 0; j <= p; ++j) {
			ders[0][j] = ndu[j][p];
		}

		for (var r = 0; r <= p; ++r) {
			var s1 = 0;
			var s2 = 1;
			var a = [];
			for (var i = 0; i <= p; ++i) {
				a[i] = zeroArr.slice(0);
			}
			a[0][0] = 1.0;
			for (var k = 1; k <= n; ++k) {
				var d = 0.0;
				var rk = r - k;
				var pk = p - k;
				if (r >= k) {
					a[s2][0] = a[s1][0] / ndu[pk + 1][rk];
					d = a[s2][0] * ndu[rk][pk];
				}

				var j1 = (rk >= - 1) ? 1 : - rk;
				var j2 = (r - 1 <= pk) ? k - 1 : p - r;

				for (var j = j1; j <= j2; ++j) {
					a[s2][j] = (a[s1][j] - a[s1][j - 1]) / ndu[pk + 1][rk + j];
					d += a[s2][j] * ndu[rk + j][pk];
				}

				if (r <= pk) {
					a[s2][k] = - a[s1][k - 1] / ndu[pk + 1][r];
					d += a[s2][k] * ndu[r][pk];
				}

				ders[k][r] = d;
				var j = s1;
				s1 = s2;
				s2 = j;
			}
		}
		var r = p;
		for (var k = 1; k <= n; ++k) {
			for (var j = 0; j <= p; ++j) {
				ders[k][j] *= r;
			}
			r *= p - k;
		}
		return ders;
	},

	/*
		Calculate derivatives of a B-Spline. See The NURBS Book, page 93, algorithm A3.2.

		p  : degree
		U  : knot vector
		P  : control points
		u  : Parametric points
		nd : number of derivatives

		returns array[d+1] with derivatives
		*/
	calcBSplineDerivatives: function (p, U, P, u, nd) {
		var du = nd < p ? nd : p;
		var CK = [];
		var span = this.findSpan(p, u, U);
		var nders = this.calcBasisFunctionDerivatives(span, u, p, du, U);
		var Pw = [];
		for (var i = 0; i < P.length; ++i) {
			var point = P[i].clone();
			var w = point.w;
			point.x *= w;
			point.y *= w;
			point.z *= w;
			Pw[i] = point;
		}
		for (var k = 0; k <= du; ++k) {
			var point = Pw[span - p].clone().multiplyScalar(nders[k][0]);
			for (var j = 1; j <= p; ++j) {
				point.add(Pw[span - p + j].clone().multiplyScalar(nders[k][j]));
			}
			CK[k] = point;
		}

		for (var k = du + 1; k <= nd + 1; ++k) {
			CK[k] = new Vector4(0, 0, 0);
		}
		return CK;
	},

	/*
	Calculate "K over I"

	returns k!/(i!(k-i)!)
	*/
	calcKoverI: function (k, i) {
		var nom = 1;
		for (var j = 2; j <= k; ++j) {
			nom *= j;
		}
		var denom = 1;
		for (var j = 2; j <= i; ++j) {
			denom *= j;
		}
		for (var j = 2; j <= k - i; ++j) {
			denom *= j;
		}
		return nom / denom;
	},

	/*
	Calculate derivatives (0-nd) of rational curve. See The NURBS Book, page 127, algorithm A4.2.
	Pders : result of function calcBSplineDerivatives
	returns array with derivatives for rational curve.
	*/
	calcRationalCurveDerivatives: function (Pders) {
		var nd = Pders.length;
		var Aders = [];
		var wders = [];
		for (var i = 0; i < nd; ++i) {
			var point = Pders[i];
			Aders[i] = new Vector3(point.x, point.y, point.z);
			wders[i] = point.w;
		}
		var CK = [];
		for (var k = 0; k < nd; ++k) {
			var v = Aders[k].clone();
			for (var i = 1; i <= k; ++i) {
				v.sub(CK[k - i].clone().multiplyScalar(this.calcKoverI(k, i) * wders[i]));
			}
			CK[k] = v.divideScalar(wders[0]);
		}
		return CK;
	},

	/*
	Calculate NURBS curve derivatives. See The NURBS Book, page 127, algorithm A4.2.

	p  : degree
	U  : knot vector
	P  : control points in homogeneous space
	u  : parametric points
	nd : number of derivatives

	returns array with derivatives.
	*/
	calcNURBSDerivatives: function (p, U, P, u, nd) {
		var Pders = this.calcBSplineDerivatives(p, U, P, u, nd);
		return this.calcRationalCurveDerivatives(Pders);
	},

	/*
	Calculate rational B-Spline surface point. See The NURBS Book, page 134, algorithm A4.3.

	p1, p2 : degrees of B-Spline surface
	U1, U2 : knot vectors
	P      : control points (x, y, z, w)
	u, v   : parametric values

	returns point for given (u, v)
	*/
	calcSurfacePoint: function (p, q, U, V, P, u, v, target) {
		var uspan = this.findSpan(p, u, U);
		var vspan = this.findSpan(q, v, V);
		var Nu = this.calcBasisFunctions(uspan, u, p, U);
		var Nv = this.calcBasisFunctions(vspan, v, q, V);
		var temp = [];
		for (var l = 0; l <= q; ++l) {
			temp[l] = new Vector4(0, 0, 0, 0);
			for (var k = 0; k <= p; ++k) {
				var point = P[uspan - p + k][vspan - q + l].clone();
				var w = point.w;
				point.x *= w;
				point.y *= w;
				point.z *= w;
				temp[l].add(point.multiplyScalar(Nu[k]));
			}
		}
		var Sw = new Vector4(0, 0, 0, 0);
		for (var l = 0; l <= q; ++l) {
			Sw.add(temp[l].multiplyScalar(Nv[l]));
		}
		Sw.divideScalar(Sw.w);
		target.set(Sw.x, Sw.y, Sw.z);
	}
};

/**************************************************************
 *	NURBS curve
 **************************************************************/
var NURBSCurve = function (degree, knots /* array of reals */, controlPoints /* array of Vector(2|3|4) */, startKnot /* index in knots */, endKnot /* index in knots */) {
	Curve.call(this);
	this.degree = degree;
	this.knots = knots;
	this.controlPoints = [];
	// Used by periodic NURBS to remove hidden spans
	this.startKnot = startKnot || 0;
	this.endKnot = endKnot || (this.knots.length - 1);
	for (var i = 0; i < controlPoints.length; ++i) {
		// ensure Vector4 for control points
		var point = controlPoints[i];
		this.controlPoints[i] = new Vector4(point.x, point.y, point.z, point.w);
	}
};

NURBSCurve.prototype = Object.create(Curve.prototype);
NURBSCurve.prototype.constructor = NURBSCurve;

NURBSCurve.prototype.getPoint = function (t) {
	var u = this.knots[this.startKnot] + t * (this.knots[this.endKnot] - this.knots[this.startKnot]); // linear mapping t->u
	// following results in (wx, wy, wz, w) homogeneous point
	var hpoint = NURBSUtils.calcBSplinePoint(this.degree, this.knots, this.controlPoints, u);
	if (hpoint.w != 1.0) {
		// project to 3D space: (wx, wy, wz, w) -> (x, y, z, 1)
		hpoint.divideScalar(hpoint.w);
	}
	return new Vector3(hpoint.x, hpoint.y, hpoint.z);
};

NURBSCurve.prototype.getTangent = function (t) {
	var u = this.knots[0] + t * (this.knots[this.knots.length - 1] - this.knots[0]);
	var ders = NURBSUtils.calcNURBSDerivatives(this.degree, this.knots, this.controlPoints, u, 1);
	var tangent = ders[1].clone();
	tangent.normalize();
	return tangent;
};

/**************************************************************
 *	NURBS surface
 **************************************************************/
var NURBSSurface = function (degree1, degree2, knots1, knots2 /* arrays of reals */, controlPoints /* array^2 of Vector(2|3|4) */) {
	this.degree1 = degree1;
	this.degree2 = degree2;
	this.knots1 = knots1;
	this.knots2 = knots2;
	this.controlPoints = [];
	var len1 = knots1.length - degree1 - 1;
	var len2 = knots2.length - degree2 - 1;
	// ensure Vector4 for control points
	for (var i = 0; i < len1; ++i) {
		this.controlPoints[i] = [];
		for (var j = 0; j < len2; ++j) {
			var point = controlPoints[i][j];
			this.controlPoints[i][j] = new Vector4(point.x, point.y, point.z, point.w);
		}
	}
};

NURBSSurface.prototype = {
	constructor: NURBSSurface,
	getPoint: function (t1, t2, target) {
		var u = this.knots1[0] + t1 * (this.knots1[this.knots1.length - 1] - this.knots1[0]); // linear mapping t1->u
		var v = this.knots2[0] + t2 * (this.knots2[this.knots2.length - 1] - this.knots2[0]); // linear mapping t2->u
		NURBSUtils.calcSurfacePoint(this.degree1, this.degree2, this.knots1, this.knots2, this.controlPoints, u, v, target);
	}
};