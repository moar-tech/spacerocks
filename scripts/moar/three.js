
//  Copyright © 2017 Moar Technologies Corp. See LICENSE for details.




if( this.M === undefined ) this.M = {}
M.three = {}


M.three.setup = function(){

	const
	container = document.getElementById( 'three' ),
	angle     = 70,
	width     = container.offsetWidth  || window.innerWidth,
	height    = container.offsetHeight || window.innerHeight,
	aspect    = width / height,
	near      = 0.01,
	far       = 500
	
	const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
	renderer.setPixelRatio( window.devicePixelRatio )
	renderer.setSize( width, height )
	if( M.detect.hasWebVR === true ){
	
		renderer.vr.enabled  = true
		renderer.vr.standing = true
		renderer.vr.setDevice( M.detect.vrDisplay )
	}
	container.appendChild( renderer.domElement )

	const scene = new THREE.Scene()
	scene.name = 'scene'

	const camera = new THREE.PerspectiveCamera( angle, aspect, near, far )
	camera.name = 'camera'

	window.addEventListener( 'resize', function(){

		const
		width  = container.offsetWidth  || window.innerWidth,
		height = container.offsetHeight || window.innerHeight

		camera.aspect = width / height
		camera.updateProjectionMatrix()
		renderer.setSize( width, height )

	}, false )


	//  The “Scene” is our outer most container, right?
	//  It needs to handle real immutable things like displaying your controllers
	//  where they actually are and at their actual size. 
	//  But the world we create here (and attach to the scene) IS mutable.
	//  You can drag it, rotate it, pinch it, zoom it, etc. 

	world = new THREE.Object3D()
	world.name = 'world'
	scene.add( world )


	//  As of THREE r87 the renderer controls the animation loop
	//  so we’re no longer responsible for toggling between window.requestAnimationFrame (60fps)
	//  and vrDisplay.requestAnimationFrame (90fps). But this also means M.tasks.update() loses
	//  authority as the master loop. And we don’t like extra loops so... here’s THE ONE:

	let timePrevious
	const render = function( timeNow ){


		//  Determine the time since last frame in SECONDS (not milliseconds).
		//  Then perform all the animation updates based on that.

		if( timePrevious === undefined ) timePrevious = timeNow
		const timeDelta = ( timeNow - timePrevious ) / 1000
		timePrevious = timeNow
		M.tasks.update( timeDelta )

		renderer.render( scene, camera )
	}
	renderer.animate( render )




	//  Export for use!

	Object.assign( M.three, { renderer, scene, camera, world, render })
}



