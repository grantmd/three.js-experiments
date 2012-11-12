
'use strict';

Physijs.scripts.worker = '/js/physijs_worker.js';
Physijs.scripts.ammo = '/js/ammo.js';

// set the scene size
var WIDTH = window.innerWidth,
  HEIGHT = window.innerHeight;

// set some camera attributes
var VIEW_ANGLE = 45,
  ASPECT = WIDTH / HEIGHT,
  NEAR = 0.1,
  FAR = 10000;

// get the DOM element to attach to
var container = document.getElementById('container');
var renderer, camera, scene, controls, stats, projector, ray, plane, isShiftDown = false;

var mouse = new THREE.Vector3( 0, 0, 0.5 ); // Mouse position

////////////////////////////////////////////////////////////////////////////////////////////

// Can we start?
if (!Detector.webgl){
	Detector.addGetWebGLMessage();

	if (Detector.canvas){
		window.setTimeout(Detector.removeGetWebGLMessage, 5000);
		window.setTimeout(init, 5500);
	}
	return;
}
else{
	init();
}

////////////////////////////////////////////////////////////////////////////////////////////

// Init and start
function init(){
	// create a WebGL renderer, camera
	// and a scene
	if (Detector.webgl){
		renderer = new THREE.WebGLRenderer({
			antialias: true,
			preserveDrawingBuffer   : true  // required to support .toDataURL()
		});

		renderer.setFaceCulling("back");

		// shadowing
		renderer.shadowMapEnabled = true;
		renderer.shadowMapSoft = true; // to antialias the shadow
	}
	else if (Detector.canvas){
		renderer = new THREE.CanvasRenderer();
	}

	renderer.setClearColorHex(0x181818);
	window.addEventListener( 'resize', onWindowResize, false ); // handle resizing
	
	// stop the user getting a text cursor
	// http://www.aerotwist.com/tutorials/ten-things-i-learned/
	document.onselectstart = function(){ return false; };

	// Camera
	camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	projector = new THREE.Projector();

	scene = new Physijs.Scene;
	scene.setGravity(new THREE.Vector3(0, -5, 0));

	// add the camera to the scene
	scene.add(camera);

	// the camera starts at 0,0,0, so pull it back
	camera.position.z = 15;

	// start the renderer
	renderer.setSize(WIDTH, HEIGHT);

	// attach the render-supplied DOM element
	container.appendChild(renderer.domElement);

	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );

	stats.domElement.children[ 0 ].children[ 0 ].style.color = "#aaa";
	stats.domElement.children[ 0 ].style.background = "transparent";
	stats.domElement.children[ 0 ].children[ 1 ].style.display = "none";

	// Set everything else up
	setupControls();
	setupObjects();
	setupLights();

	// Start rendering!
	render();
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	render();

}

////////////////////////////////////////////////////////////////////////////////////////////

function setupControls(){
	// Camera controls
	controls = new THREE.OrbitControls( camera );
	controls.userZoomSpeed = 1.0;
	controls.maxPolarAngle = Math.PI/2; // don't let us below the ground plane

	// Other keyboard controls
	document.addEventListener('keydown', function(event){
		if (event.altKey){
			return;
		}

		//event.preventDefault();

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
	},
	false);

	document.addEventListener('keyup', function(event){
		if (event.altKey){
			return;
		}

		//event.preventDefault();

		switch (event.keyCode){

			case 16: /* shift */
				isShiftDown = false;
				break;
		}
	},
	false);

	// Other mouse controls
	document.addEventListener('mousedown', function(event){

		event.preventDefault();

		// Spawn a cube where we click
		if (event.button === 0 && isShiftDown){
			ray = projector.pickingRay(mouse.clone(), camera);

			var intersects = ray.intersectObjects(scene.children);
			console.log('intersects', intersects);
			for (var i = 0; i < intersects.length; i++){

				var intersector = intersects[i];

				if (intersector.object == plane){

					console.log("Cube spawned", intersector.point.x, intersector.point.y, intersector.point.z);
					new Voxel( scene, intersector.point, 0x0000ff );
				}

			}
		}
	},
	false);

	document.addEventListener('mousemove', function(event){

		event.preventDefault();

		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		mouse.z = 0;

		//console.log('Mouse move', mouse.x, mouse.y, mouse.z);
	},
	false);
}

////////////////////////////////////////////////////////////////////////////////////////////

var ground;
function setupObjects(){
	// Ground
	var ground_material = Physijs.createMaterial(
		new THREE.MeshLambertMaterial({color: 0x249E24}),
		.8, // high friction
		.4 // low restitution
	);

	ground = new Physijs.BoxMesh(
		new THREE.CubeGeometry(1000, 1, 1000),
		//new THREE.PlaneGeometry(50, 50),
		ground_material,
		0 // mass
	);
	ground.position.y = -2;
	ground.receiveShadow = true;
	scene.add( ground );

	plane = new THREE.Mesh( new THREE.CubeGeometry( 1000, 1000, 1, 1, 1, 1 ), new THREE.MeshBasicMaterial( { visible: false } ) );
	scene.add( plane );
}

////////////////////////////////////////////////////////////////////////////////////////////

function setupLights(){
	var ambientLight = new THREE.AmbientLight( 0x202020 );
	scene.add( ambientLight );

	// create a directional light
	var light = new THREE.DirectionalLight(0xffffff);

	// set its position
	light.position.x = 100;
	light.position.y = 100;
	light.position.z = 100;

	//light.position.normalize();

	// shadows
	// http://learningthreejs.com/blog/2012/01/20/casting-shadows/
	light.castShadow = true;
	light.shadowCameraLeft = -60;
	light.shadowCameraTop = -60;
	light.shadowCameraRight = 60;
	light.shadowCameraBottom = 60;
	light.shadowCameraNear = 20;
	light.shadowCameraFar = 200;
	light.shadowBias = -0.0001;
	light.shadowMapWidth = light.shadowMapHeight = 2048;
	light.shadowDarkness = 0.7;

	light.target.position.copy( scene.position );

	// add to the scene
	scene.add(light);
}

////////////////////////////////////////////////////////////////////////////////////////////

// draw!
function render(){
	requestAnimationFrame(render); // 60fps, but pauses if we tab away

	stats.update(); // update stats

	scene.simulate(); // run physics

	controls.update(); // controls

	// Spin the sphere
	//sphere.rotation.y += 0.01;
	//sphere.__dirtyRotation = true; // we moved the sphere manually, so let the simulation know

	renderer.render(scene, camera);
}

////////////////////////////////////////////////////////////////////////////////////////////