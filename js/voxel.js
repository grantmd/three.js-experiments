var voxelGeometry = new THREE.CubeGeometry(1, 1, 1);

Voxel = function ( scene, position, color ) {
	var voxel = new Physijs.BoxMesh(voxelGeometry, new THREE.MeshLambertMaterial({color: color}), 0, { friction: 0.8, restitution: 0.2 });
	voxel.position.x = parseInt(position.x, 10);
	voxel.position.y = parseInt(position.y, 10);
	voxel.position.z = parseInt(position.z, 10);

	voxel.castShadow = true;
	voxel.receiveShadow  = true;

	scene.add(voxel);
};

Voxel.prototype = {
	constructor : Voxel,

	// Other functions go here
};