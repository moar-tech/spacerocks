
//  Copyright © 2017 Moar Technologies Corp. See LICENSE for details.




//  Our Player object will be an augmented Object3D.
//  So first thing’s first, let there be an Object3D:

const player = new THREE.Object3D()
player.velocity = new THREE.Vector3()


player.boltsFired = 0
player.boltsGood  = 0
player.accuracy   = 0


//  HUD text for major alerts -- like needing to turn on controllers,
//  or Game Over, etc.

player.hudText = new Quicktext({

	virtual: {

		width:  4,
		height: 1
	},
	canvas: {

		width: 2048,
		height: 512
	}
})


//  Wear your hearts on your sleeve! We’ll create a text node and
//  (eventually) attach it to the left controller.

player.lives = 3
player.livesText = new Quicktext()
player.showHearts = function(){

	let 
	hearts = '',
	n = player.lives

	while( n -- ){ hearts += ' ❤' }//♥
	player.livesText.print( hearts.substr( 1 ))
}
player.markDeath = function(){

	player.lives --
	player.showHearts()
}
player.showHearts()


//  Score text exists on the right controller.

player.score = 0
player.scoreText  = new Quicktext()
player.addToScore = function( n ){

	player.score += n
	player.scoreText.print( player.score.toLocaleString() )
	if( player.score > settings.highScore ){

		settings.highScore = player.score
		setHighScore( settings.highScore )
	}
}


player.reset = function(){

	player.lives = 3
	player.showHearts()
	player.score = 0
	player.scoreText.print()
}
player.returnToOrigin = function(){
	
	player.velocity.set( 0, 0, 0 )
	M.three.world.position.set( 0, 0, 0 )
}


//  Eventually when the user turns on their controllers we’ll have
//  arms. Sort of. Or at least ... hulls with cannons and engines!

player.arms = {

	radii: 0.06,
	glowDim:    0x333333,
	glowBright: 0xFFFFFF,
	intensityDim:    0.05,
	intensityBright: 0.10,	
	left:  {},
	right: {}
}




player.setup = function(){

	M.three.scene.add( player )	
	player.hudText.position.set( 0, 0, -4 )
	player.add( player.hudText )




	    //////////////////////
	   //                  //
	  //   Arm Template   //
	 //                  //
	//////////////////////

	/*

	      LEFT                              RIGHT

	      lives                             score
	      ♥ ♥ ♥                             12345
	    ╭───────╮          cannon         ╭───────╮
	    │   ▪   │    cannon pointlight    │   ▪   │
	    ├───────┤                         ├───────┤
	    │       │                         │       │
	    │       │           hull          │       │
	    │       │                         │       │
	    │       │                         │       │
	    ├───────┤          engine         ├───────┤
	    │       │                         │       │
	     ╲_____╱                           ╲_____╱
	        ↓          engine exhaust         ↓      


	*/
	const hull = new THREE.Mesh(
		
		new THREE.CylinderGeometry( player.arms.radii, player.arms.radii, 0.2, 7 ),
		new THREE.MeshPhongMaterial({

			color:     0x999999,
			specular:  0xCCCCCC,
			shininess: 70,
		})
	)
	hull.material.flatShading = true
	hull.castShadow = true
	hull.receiveShadow = true
	
	const cannon = new THREE.Mesh(
		
		new THREE.CylinderGeometry( player.arms.radii, player.arms.radii, 0.1, 7 ),
		new THREE.MeshPhongMaterial({

			color:       0xFFFFFF,
			emissive:    player.arms.glowDim,
			side:        THREE.BackSide,
			transparent: true,
			blending:    THREE.AdditiveBlending
		})
	)
	cannon.name = 'cannon'
	cannon.position.set( 0, 0.15 + 0.001, 0 )
	cannon.material.flatShading = true
	cannon.receiveShadow = true
	hull.add( cannon )

	const cannonLight = new THREE.PointLight( 0xFFFFFF, player.arms.intensityDim, 0, 2 )
	cannonLight.name = 'cannonLight'
	cannonLight.castShadow = true
	cannon.add( cannonLight )

	const engine = new THREE.Mesh(
		
		new THREE.CylinderGeometry( player.arms.radii, player.arms.radii * 2 / 3, 0.1, 7 ),
		new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
	)
	engine.name = 'engine'
	engine.position.set( 0, -0.15, 0 )
	engine.material.flatShading = true
	engine.receiveShadow = true
	hull.add( engine )




	    //////////////////////////
	   //                      //
	  //   Exhaust Template   //
	 //                      //
	//////////////////////////

	/*

		We need to build custom geometry for our exhaust trail.
		Can’t just create a CylinderGeometry with more heightSegemnts
		because we need the faces ordered as rings rather than strips
		that run the length of the trail!


	    BASE GEOMETRY      EXTENDED GEOMETRY

	    R0     R1          R2    R3     R4 …… R200
	       ─────────··········─────────────────────
	     ╱     ╱     ╲      ╱     ╱     ╱     ╱     ╲
	    │     │       │    │     │     │     │       │
 	     ╲     ╲     ╱      ╲     ╲     ╲     ╲     ╱
	       ─────────··········─────────────────────

	*/
	const
	ringsTotal     = 200,
	vectorsPerRing =   7,
	facesPerRing   = vectorsPerRing * 2,
	geometry       = new THREE.CylinderGeometry( 

		0.01,//  Radius top.
		0.01,//  Radius bottom.
		0.01,//  Height, 1cm
		vectorsPerRing,//  Radius segments.
		1,   //  Height segments.
		true //  Open ended?
	),
	material = new THREE.MeshBasicMaterial({

		color:        0xFFFFFF,
		flatShading:  true,
		vertexColors: THREE.VertexColors,
		side:         THREE.FrontSide,
		blending:     THREE.AdditiveBlending,
		transparent:  true
	})

	let exhaust = new THREE.Mesh( geometry, material )
	exhaust.frustumCulled = false	


	//  First, we need to add all the necessary vectors.
	//  That’s vectorsPerRing (7) multiplied by ringsTotal (200)
	//  for 7 * 200 = 1,400 vectors.

	while( geometry.vertices.length < vectorsPerRing * ringsTotal ){

		geometry.vertices.push( new THREE.Vector3() )
	}


	//  Second, we need to paint the existing face vertices.

	for( i = 0; i < geometry.faces.length; i ++ ){

		const 
		face  = geometry.faces[ i ],
		color = new THREE.Color( 0x000000 )
		
		face.vertexColors[ 0 ] = color
		face.vertexColors[ 1 ] = color
		face.vertexColors[ 2 ] = color
	}


	//  Now we can create those additional faces in our desired order.

	let ringCursor = 2
	for( let i = ringCursor * facesPerRing; i < ringsTotal * facesPerRing; i ++ ){

		if( i % facesPerRing === 0 ) ringCursor ++

		const
		f = i - facesPerRing * 2,
		faceOld = geometry.faces[ f ],
		faceNew = new THREE.Face3(

			faceOld.a + vectorsPerRing,
			faceOld.b + vectorsPerRing,
			faceOld.c + vectorsPerRing
		),
		gray  = ringCursor / ringsTotal,
		color = new THREE.Color( gray, gray, gray )

		faceNew.vertexColors[ 0 ] = color
		faceNew.vertexColors[ 1 ] = color
		faceNew.vertexColors[ 2 ] = color
		geometry.faces.push( faceNew )
		geometry.faceVertexUvs[ 0 ].push([
		
			new THREE.Vector2(),
			new THREE.Vector2(),
			new THREE.Vector2()
		])
	}


	function exhaustUpdate( side ){

		const 
		arm      = player.arms[ side ],
		engine   = arm.engine,
		enginePositionNow = engine.localToWorld( new THREE.Vector3() ).sub( M.three.world.position ),
		exhaust  = arm.exhaust,
		geometry = exhaust.geometry
		
		if( enginePositionNow.distanceTo( arm.exhaust.positionPrior ) > 0.005 ){

			exhaust.positionPrior.copy( enginePositionNow )


			//  We need to strip off some vertices from the beginning
			//  of this geometry.
			
			geometry.vertices = geometry.vertices.slice( vectorsPerRing )


			//  And now we need to add that same number of vertices to
			//  the ALMOST end of this geometry.

			for( let i = engine.geometry.vertices.length - vectorsPerRing - 2;
				i < engine.geometry.vertices.length - 2; i ++ ){

				geometry.vertices.push( 

					engine.localToWorld( 

						engine.geometry.vertices[ i ].clone()
						.multiplyScalar( 0.75 )
					)
					.sub( M.three.world.position )
				)
			}
			geometry.elementsNeedUpdate = true
		}
	}




	    ///////////////////////
	   //                   //
	  //   Clone for two   //
	 //                   //
	///////////////////////


	hull.position.set( 0, 0, 0.2 )
	hull.rotation.x = Math.PI / -2
	for( let i = 0; i < 2; i ++ ){

		const side = i ? 'left' : 'right'
		player.arms[ side ] = hull.clone()
		
		const arm = player.arms[ side ]
		arm.cannon = arm.getObjectByName( 'cannon' )
		arm.cannon.rotationVelocity = 0
		arm.cannonLight = arm.getObjectByName( 'cannonLight' )
		arm.engine = arm.getObjectByName( 'engine' )
		arm.engine.rotationVelocity = 0
		arm.engine.isEnabled = false
		arm.engineLight = arm.getObjectByName( 'engineLight' )
		
		arm.exhaust = exhaust.clone()
		arm.exhaust.geometry = exhaust.geometry.clone()
		arm.exhaust.positionPrior = arm.engine.localToWorld( new THREE.Vector3() ).sub( M.three.world.position )
		M.three.world.add( arm.exhaust )
	}
	M.tasks.updates.add( function(){

		exhaustUpdate( 'left' )
		exhaustUpdate( 'right' )
	})


	//  Now that we’re done with the original we can destroy it.
	//  Sure, sure. You’d rather just create either the left or the right
	//  and then clone that over, instead of having this 3rd hull
	//  but what is efficiency vs legibility?

	hull.traverse( function( obj ){

		if( obj.material ) obj.material.dispose()
		if( obj.geometry ) obj.geometry.dispose()
		obj = undefined
	})
	exhaust.material.dispose()
	exhaust.geometry.dispose()
	exhaust = undefined


	//  Left arm displays Lives Remaining above the cannon muzzle.

	player.livesText.position.set( 0, 0.23, player.arms.radii * 1.6 )
	player.livesText.rotation.x = Math.PI / 3
	player.arms.left.add( player.livesText )
	

	//  Right arm displays Score above the cannon muzzle.

	player.scoreText.position.set( 0, 0.23, player.arms.radii * 1.6 )
	player.scoreText.rotation.x = Math.PI / 3
	player.arms.right.add( player.scoreText )




	//  Disabling engines means we have no further control over where
	//  we are or where we’re going. So we should be kind and also kill
	//  the velocity. And while we’re at it if you can’t move then you
	//  might as well be dropped at 0, 0, 0.

	player.disableEngines = function(){

		player.returnToOrigin()
		for( let i = 0; i < 2; i ++ ){

			const arm = player.arms[( !i ? 'left' : 'right' )]

			arm.parent.setVibe( 'engine', 0 )
			arm.engine.isEnabled = false
			arm.engine.rotationVelocity = 0
			arm.engine.rotation.y = 0
			//arm.engine.material.emissive.setHex( 0x000000 )
		}
	}
	player.enableEngines = function(){

		for( let i = 0; i < 2; i ++ ){

			const arm = player.arms[( !i ? 'left' : 'right' )]

			arm.engine.isEnabled = true
			//arm.engine.material.emissive.setHex( player.arms.glowDim )
		}
	}




	    //////////////////////////////
	   //                          //
	  //   Controller Connected   //
	 //                          //
	//////////////////////////////


	//  Remember: this is PER CONTROLLER -- or really PER GAMEPAD --
	//  not for both controllers at once.

	window.addEventListener( 'vr controller connected', function( event ){


		//  First things first. (Blah blah Ken Garland blah blah 1964.)
		//  1. Get the controller instance.
		//  2. Hook up references to the standing matrix (for 6DOF)
		//  3. and the camera position (for 3DOF).
		//  4. Add the controller (an Object3D instance) to the scene.

		const controller = event.detail
		controller.standingMatrix = M.three.renderer.vr.getStandingMatrix()
		controller.head = M.three.camera
		M.three.scene.add( controller )


		//  Let’s setup some convenience variables, and also attach the correct
		//  collection of Meshes, etc to this controller.

		let
		side = controller.getHandedness(),
		arm,
		cannon, cannonLight,
		engine, engineLight

		const
		attachArm = function( side ){

			arm         = player.arms[ side ]
			cannon      = arm.cannon
			cannonLight = arm.cannonLight
			engine      = arm.engine
			engineLight = arm.engineLight
			engineTrail = arm.engineTrail


			//  Add the pre-built meshes to this controller. If it’s already 
			//  attached to another controller -- this function might be invoked
			//  on a 'hand changed' event -- the add() method automatically 
			//  removes the arm from its previous parent object!

			controller.add( arm )
		},
		detatchArm = function( side ){

			controller.remove( arm )
		}


		//  If our controller already knows what hand it’s attached to then
		//  we can use that info right away.

		if( side === 'left' || side === 'right' ) attachArm( side )


		//  But it might not have decided its handedness yet, or that handedness
		//  may even changer later on! So let’s handle that possiblity.

		controller.addEventListener( 'hand changed', function( event ){

			side = event.hand
			attachArm( side )
		})


		//  Sure, if you’re on a 6DOF rig you can walk around within your physical space
		//  but can you GLIDE? Can you blaze a trail of plasma fire behind you? Yea.

		const 
		engineThrust = function(){

			if( engine && engine.isEnabled ){

				player.velocity.add( controller.getWorldDirection().normalize().multiplyScalar( -0.001 ))
				controller.setVibe( 'engine', 0.15 )
			}
		},
		cannonFire = function(){

			if( cannon && cannonLight ){
			
				const bolt = new Bolt( controller, cannon.rotation.y )
				if( bolt ){
					
					if( Mode.current.name === 'game play' ) player.boltsFired ++
					cannon.material.emissive.setHex( player.arms.glowBright )
					cannonLight.intensity   = player.arms.intensityBright
					cannon.rotationVelocity = 0.15
					controller.setVibe( 'cannon fire' ).set( 0.8 ).wait( 20 ).set( 0.0 )
					controller.setVibe( 'cannon rotation' ).set( 0.15 )
					if( engine && engine.isEnabled ){

						player.velocity.add( controller.getWorldDirection().normalize().multiplyScalar( 0.0001 ))
					}
				}
			}
		}


		//  Time to hook up the above functions to controller button states.
		//  We can do that super easily by using our controller’s updateCallback.
		//  This will get called at the end of each update() for the controller.

		controller.updateCallback = function(){

			if( controller.getButton( 'primary' ).isPressed === true ) cannonFire()

			if( controller.getButton( 'grip' ).isTouched === true ) engineThrust()
			else if( engine ) engine.rotationVelocity *= 0.99

			if( cannon ){
			
				cannon.rotation.y += cannon.rotationVelocity
				cannon.rotationVelocity *= 0.99
			}
			if( engine ) engine.rotation.y += engine.rotationVelocity
		}


		controller.addEventListener( 'primary press ended', function(){

			if( cannon && cannonLight ){
				
				cannon.material.emissive.setHex( player.arms.glowDim )
				cannonLight.intensity = player.arms.intensityDim
				controller.setVibe( 'cannon rotation' )
					.wait( 1000 ).set( 0.1 )
					.wait( 1000 ).set( 0.0 )
			}
		})
		controller.addEventListener( 'grip touch began', function(){

			if( engine && engine.isEnabled ){
			
				// engine.material.color.setHex( player.arms.glowBright )
				engine.rotationVelocity = 0.15
				if( engineLight ) engineLight.intensity = player.arms.intensityBright			
			}
		})
		controller.addEventListener( 'grip touch ended', function(){

			if( engine && engine.isEnabled ){
			
				// engine.material.color.setHex( player.arms.glowDim )
				if( engineLight ) engineLight.intensity = player.arms.intensityDim
			}
			controller.setVibe( 'engine', 0 )
		})


		//  When it’s time to go, it’s time to go.

		controller.addEventListener( 'disconnected', function(){

			M.three.scene.remove( controller )
			detatchArm( side )
		})
	})






	M.tasks.updates.add( function(){


		//  Three’s new renderer.vr does not seem to give direct access
		//  to the sterescopic camera rig’s position. (WTF?!)
		//  So we’ll grab it ourselves right here.
		//  Also important to note: This has zero effect on what you see
		//  in the headset. The HMD is totally controlled by renderer.vr.
		//  This is purely for being able to attach text or whatever to
		//  the user’s face. IN YOUR FACE!

		if( M.detect.vrDisplay && M.detect.vrDisplay.stageParameters && M.detect.vrDisplay.getPose ){
		
			const hmdPosition = M.detect.vrDisplay.getPose().position
			if( hmdPosition ){
			
				player.position.fromArray( hmdPosition )			
				player.position.applyMatrix4( new THREE.Matrix4().fromArray( M.detect.vrDisplay.stageParameters.sittingToStandingTransform ))
				player.quaternion.fromArray( M.detect.vrDisplay.getPose().orientation )
			}
		}


		//  Don’t move the user, move the world!

		M.three.world.position.sub( player.velocity )
		

		//  Did we run smack into a Rock?
		//  **** this interaction is too quick for use to understand they moved. fix UX later!! ****

		if( Mode.current.name === 'game play' ){

			Rock.all.forEach( function( rock ){

				if( player.position.clone().sub( world.position ).distanceTo( rock.position ) <= rock.radius ){

					rock.explode()
					player.markDeath()
					player.returnToOrigin()
					new Explosion()
				}
			})
		}
	})
	M.tasks.updates.add( THREE.VRController.update.bind( THREE.VRController ))
}



