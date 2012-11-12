var voxelGeometry = new THREE.CubeGeometry(1, 1, 1);

Voxel = function ( scene, position, color ) {
	var voxel = new Physijs.BoxMesh(voxelGeometry, new THREE.MeshLambertMaterial({color: color}), 0, { friction: 0.8, restitution: 0.2 });
	voxel.position.x = Math.round(position.x);
	voxel.position.y = Math.round(position.y);
	voxel.position.z = Math.round(position.z);

	voxel.castShadow = true;
	voxel.receiveShadow  = true;

	scene.add(voxel);
};

Voxel.prototype = {
	constructor : Voxel,

	// Other functions go here
};