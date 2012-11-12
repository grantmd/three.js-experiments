////////////////////////////////////////////////////////////////////////////////////////////

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
var renderer, camera, scene, controls, stats;

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
		//renderer.shadowMapEnabled = true;
		//renderer.shadowMapSoft = true; // to antialias the shadow
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
	controls = new Controls( camera );
	controls.userZoomSpeed = 1.0;
	controls.maxPolarAngle = Math.PI/2; // don't let us below the ground plane
}

////////////////////////////////////////////////////////////////////////////////////////////

var ground;
function setupObjects(){
	// Ground
	var ground_material = Physijs.createMaterial(
		new THREE.MeshLambertMaterial({color: 0x249E24}),
		0.8, // high friction
		0.4 // low restitution
	);

	ground = new Physijs.BoxMesh(
		new THREE.CubeGeometry(1000, 1, 1000),
		//new THREE.PlaneGeometry(50, 50),
		ground_material,
		0 // mass
	);
	ground.position.y = -2;
	//ground.receiveShadow = true;
	scene.add( ground );
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
	/*light.castShadow = true;
	light.shadowCameraLeft = -60;
	light.shadowCameraTop = -60;
	light.shadowCameraRight = 60;
	light.shadowCameraBottom = 60;
	light.shadowCameraNear = 20;
	light.shadowCameraFar = 200;
	light.shadowBias = -0.0001;
	light.shadowMapWidth = light.shadowMapHeight = 2048;
	light.shadowDarkness = 0.7;*/

	light.target.position.copy( scene.position );

	// add to the scene
	scene.add(light);

	// create a directional light
	var light2 = new THREE.DirectionalLight(0x808080);

	// set its position
	light2.position.x = -100;
	light2.position.y = 100;
	light2.position.z = -100;

	//light2.position.normalize();

	// shadows
	// http://learningthreejs.com/blog/2012/01/20/casting-shadows/
	/*light2.castShadow = true;
	light2.shadowCameraLeft = -60;
	light2.shadowCameraTop = -60;
	light2.shadowCameraRight = 60;
	light2.shadowCameraBottom = 60;
	light2.shadowCameraNear = 20;
	light2.shadowCameraFar = 200;
	light2.shadowBias = -0.0001;
	light2.shadowMapWidth = light2.shadowMapHeight = 2048;
	light2.shadowDarkness = 0.7;*/

	light2.target.position.copy( scene.position );

	// add to the scene
	scene.add(light2);
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