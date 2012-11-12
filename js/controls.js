/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / https://github.com/WestLangley
 */

Controls = function ( object, domElement ) {

	THREE.EventTarget.call( this );

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// API

	this.center = new THREE.Vector3();

	this.userZoom = true;
	this.userZoomSpeed = 1.0;

	this.userRotate = true;
	this.userRotateSpeed = 1.0;

	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	this.minDistance = 0;
	this.maxDistance = Infinity;

	// internals

	var scope = this;

	var EPS = 0.000001;
	var PIXELS_PER_ROUND = 1800;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var zoomStart = new THREE.Vector2();
	var zoomEnd = new THREE.Vector2();
	var zoomDelta = new THREE.Vector2();

	var phiDelta = 0;
	var thetaDelta = 0;
	var scale = 1;

	var lastPosition = new THREE.Vector3();

	var STATE = { NONE : -1, ROTATE : 0, ZOOM : 1 };
	var state = STATE.NONE;

	var mouse = new THREE.Vector3( 0, 0, 0 ); // Mouse position
	var ray, isShiftDown = false;
	var projector = new THREE.Projector();

	var cursor = new THREE.Mesh(new THREE.CubeGeometry(50, 50, 50), new THREE.MeshLambertMaterial({color: 0x880000, opacity: 0.4, transparent: true}));
	cursor.position.y = 25;
	scene.add(cursor);

	// events

	var changeEvent = { type: 'change' };


	this.rotateLeft = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		thetaDelta -= angle;

	};

	this.rotateRight = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		thetaDelta += angle;

	};

	this.rotateUp = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		phiDelta -= angle;

	};

	this.rotateDown = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		phiDelta += angle;

	};

	this.zoomIn = function ( zoomScale ) {

		if ( zoomScale === undefined ) {

			zoomScale = getZoomScale();

		}

		scale /= zoomScale;

	};

	this.zoomOut = function ( zoomScale ) {

		if ( zoomScale === undefined ) {

			zoomScale = getZoomScale();

		}

		scale *= zoomScale;

	};

	this.update = function () {

		var position = this.object.position;
		var offset = position.clone().subSelf( this.center );

		// angle from z-axis around y-axis

		var theta = Math.atan2( offset.x, offset.z );

		// angle from y-axis

		var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

		if ( this.autoRotate ) {

			this.rotateLeft( getAutoRotationAngle() );

		}

		theta += thetaDelta;
		phi += phiDelta;

		// restrict phi to be between desired limits
		phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

		// restrict phi to be betwee EPS and PI-EPS
		phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

		var radius = offset.length() * scale;

		// restrict radius to be between desired limits
		radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );

		offset.x = radius * Math.sin( phi ) * Math.sin( theta );
		offset.y = radius * Math.cos( phi );
		offset.z = radius * Math.sin( phi ) * Math.cos( theta );

		position.copy( this.center ).addSelf( offset );

		this.object.lookAt( this.center );

		thetaDelta = 0;
		phiDelta = 0;
		scale = 1;

		if ( lastPosition.distanceTo( this.object.position ) > 0 ) {

			this.dispatchEvent( changeEvent );

			lastPosition.copy( this.object.position );

		}

	};


	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function getZoomScale() {

		return Math.pow( 0.95, scope.userZoomSpeed );

	}

	function onMouseDown( event ) {

		if ( !scope.userRotate ) return;

		event.preventDefault();

		if ( event.button === 0 || event.button === 2 ) {

			if (isShiftDown){
				ray = projector.pickingRay(mouse.clone(), object);

				var intersects = ray.intersectObjects(object.parent.children);
				console.log('intersects', intersects);
				if (intersects.length){

					var position = intersects[0].object == cursor ? intersects[1].point : intersects[0].point;
					new Voxel( scene, position, 0x0000ff );

				}
			}
			else{
				state = STATE.ROTATE;

				rotateStart.set( event.clientX, event.clientY );
			}

		} else if ( event.button === 1 ) {

			state = STATE.ZOOM;

			zoomStart.set( event.clientX, event.clientY );

		}

		document.addEventListener( 'mouseup', onMouseUp, false );

	}

	function onMouseMove( event ) {

		event.preventDefault();

		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		mouse.z = 0;

		ray = projector.pickingRay(mouse.clone(), object);

		var intersects = ray.intersectObjects(object.parent.children);
		if (intersects.length){

			var position = intersects[0].object == cursor ? intersects[1].point : intersects[0].point;

			cursor.position.x = Math.floor( position.x / 50 ) * 50 + 25;
			cursor.position.y = Math.floor( position.y / 50 ) * 50 + 25;
			cursor.position.z = Math.floor( position.z / 50 ) * 50 + 25;

			if (cursor.position.y < 25) cursor.position.y = 25;

		}

		if ( state === STATE.ROTATE ) {

			rotateEnd.set( event.clientX, event.clientY );
			rotateDelta.sub( rotateEnd, rotateStart );

			scope.rotateLeft( 2 * Math.PI * rotateDelta.x / PIXELS_PER_ROUND * scope.userRotateSpeed );
			scope.rotateUp( 2 * Math.PI * rotateDelta.y / PIXELS_PER_ROUND * scope.userRotateSpeed );

			rotateStart.copy( rotateEnd );

		} else if ( state === STATE.ZOOM ) {

			zoomEnd.set( event.clientX, event.clientY );
			zoomDelta.sub( zoomEnd, zoomStart );

			if ( zoomDelta.y > 0 ) {

				scope.zoomIn();

			} else {

				scope.zoomOut();

			}

			zoomStart.copy( zoomEnd );

		}

	}

	function onMouseUp( event ) {

		if ( ! scope.userRotate ) return;

		document.removeEventListener( 'mouseup', onMouseUp, false );

		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		if ( ! scope.userZoom ) return;

		if ( event.wheelDelta > 0 ) {

			scope.zoomOut();

		} else {

			scope.zoomIn();

		}

	}

	function onKeyDown( event ) {

		if (event.altKey){
			return;
		}

		event.preventDefault();

		switch (event.keyCode){

			case 80: /* P */
				// http://learningthreejs.com/blog/2011/09/03/screenshot-in-javascript/
				var dataUrl = renderer.domElement.toDataURL("image/png");
				window.open(dataUrl, '_screenshot');
				break;
			case 16: /* shift */
				isShiftDown = true;
				break;
		}
	}

	function onKeyUp( event ) {
		if (event.altKey){
			return;
		}

		event.preventDefault();

		switch (event.keyCode){

			case 16: /* shift */
				isShiftDown = false;
				break;
		}
	}

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	this.domElement.addEventListener( 'mousemove', onMouseMove, false );
	this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );

	this.domElement.addEventListener( 'keydown', onKeyDown, false );
	this.domElement.addEventListener( 'keyup', onKeyUp, false );

};
