var voxelGeometry = new THREE.CubeGeometry(50, 50, 50);

Voxel = function ( scene, position, color ) {
	var voxel = new Physijs.BoxMesh(voxelGeometry, new THREE.MeshLambertMaterial({color: color}), 0, { friction: 0.8, restitution: 0.2 });
	voxel.position.x = Math.floor( position.x / 50 ) * 50 + 25;
	voxel.position.y = Math.floor( position.y / 50 ) * 50 + 25;
	voxel.position.z = Math.floor( position.z / 50 ) * 50 + 25;
	
	if (voxel.position.y < 25) voxel.position.y = 25;

	console.log("voxel spawned", voxel.position.x, voxel.position.y, voxel.position.z);

	//voxel.castShadow = true;
	//voxel.receiveShadow  = true;

	scene.add(voxel);
};

Voxel.prototype = {
	constructor : Voxel,

	// Other functions go here
};