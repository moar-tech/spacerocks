
//  Copyright © 2017, 2018 Moar Technologies Corp. See LICENSE for details.




    //////////////////
   //              //
  //   Overhead   //
 //              //
//////////////////


const settings = {

	version: new Date( '2018-01-03 22:22' ),
	verbosity: 0,
	

	//  Radii in Meters.

	radiusSafe:        60,//  How far away should rocks be created from player?
	radiusFogBegins:  250,
	radiusFogEnds:    295,
	radiusWrap:       300,
	radiusStarsBegin: 300,
	radiusStarsEnd:   400,

	highScore: 10 * 1000
}
const level = {

	number: 0,
	startTime: 0,
	create: function(){

		level.number ++
		level.startTime = window.performance.now()
		let rocksToCreate = 3 + level.number * 3
		//console.log( '>> Creating level', level, 'with', rocksToCreate, 'rocks.' )
		for( let i = 0; i < rocksToCreate; i ++ ){

			M.three.world.add( new Rock({}))
		}
	}
}
function wrap(){

	const worldPosition = this.getWorldPosition()
	
	if( worldPosition.distanceTo( player.position ) >= settings.radiusWrap ){
	

		//  The amount of banging my head against the fucking wall
		//  because I didn’t realize I needed the PARENT object’s
		//  worldToLocal() function. Fuck’s sake man.

		this.position.copy( this.parent.worldToLocal(
			
			worldPosition
			.sub( player.position )
			.normalize()
			.multiplyScalar( settings.radiusWrap * -1 )
			.add( player.position )
		))
		return true
	}
	return false
}
// function update( timeDelta ){

// 	this.all.forEach( function( thing ){ thing.update( timeDelta ) })
// }
// function destroy( thing ){

// 	M.three.world.remove( thing )
// 	thing.children.forEach( function( child ){

// 		if( child.material ) child.material.dispose()
// 		if( child.geometry ) child.geometry.dispose()
// 	})
// 	this.all.splice( this.all.findIndex( function( e ){ return e === thing }), 1 )
// }
function setHighScore( n ){

	document.getElementById( 'high-score-number' ).innerText = n.toLocaleString()
}




function onVRDisplayPresentChange( event ){

	const vrToggle = document.getElementById( 'vr-toggle-container' )
	if( M.detect.vrDisplay.isPresenting ){

		M.stats.note({
		
			hitType:       'event',
			eventCategory: 'VR Session',
			eventAction:   'VR Entry',
			eventLabel:    'VR entry successful',
			nonInteraction: true
		})
		vrToggle.classList.add( 'ready' )
		if( Mode.current.name !== 'game play' ) Mode.switchTo( 'waiting for first controller' )
	}
	else {

		M.stats.note({
		
			hitType:       'event',
			eventCategory: 'VR Session',
			eventAction:   'VR Exit',
			eventLabel:    'VR exit successful',
			nonInteraction: true
		})
		vrToggle.classList.remove( 'engaged' )
		if( Mode.current.name !== 'game play' ) Mode.switchTo( 'attractor' )
	}
}
function onVRToggle(){

	const 
	d = M.detect.vrDisplay,
	vrToggle = document.getElementById( 'vr-toggle-container' )

	if( d.isPresenting ){
		
		M.stats.note({
		
			hitType:       'event',
			eventCategory: 'VR Session',
			eventAction:   'VR Exit',
			eventLabel:    'VR exit attempted'
		})
		vrToggle.classList.remove( 'ready' )
		d.exitPresent()
	}
	else {

		M.stats.note({
		
			hitType:       'event',
			eventCategory: 'VR Session',
			eventAction:   'VR Entry',
			eventLabel:    'VR entry attempted'
		})
		vrToggle.classList.add( 'engaged' )
		d.requestPresent([{ source: M.three.renderer.domElement }])
		three.classList.add( 'show' )
	}
}
function handleDetection(){

	const
	errorsList = document.getElementById( 'errors' ),
	vrToggle = document.getElementById( 'vr-toggle-container' )

	let hasErrors = false
	if( M.detect.hasWebGL === false ){

		if( document.getElementById( 'no-webgl' ).style.display !== 'block' ) document.getElementById( 'no-webgl' ).style.display = 'block'
		hasErrors = true
	}
	if( M.detect.hasWebVR === false ){

		if( document.getElementById( 'no-webvr' ).style.display !== 'block' ) document.getElementById( 'no-webvr' ).style.display = 'block'
		hasErrors = true
	}
	if( M.detect.hasWebGL === true && M.detect.hasWebVR === true ){

		if( M.detect.vrDisplay instanceof VRDisplay === false ){

			if( document.getElementById( 'no-hmd' ).style.display !== 'block' ) document.getElementById( 'no-hmd' ).style.display = 'block'
			hasErrors = true
		}
		if( M.detect.degreesOfFreedom < 6 ){

			if( document.getElementById( 'no-6dof' ).style.display !== 'block' ) document.getElementById( 'no-6dof' ).style.display = 'block'
			hasErrors = true
		}
	}


	//  Sorry, no can haz VRs.

	if( hasErrors === true ){

		if( vrToggle.classList.contains( 'show' )){

			vrToggle.classList.remove( 'show' )
			setTimeout( function(){ vrToggle.style.display = 'none' }, 1000 )
			vrToggle.removeEventListener( 'mousedown',  onVRToggle )
			vrToggle.removeEventListener( 'touchstart', onVRToggle )
			window.removeEventListener( 'vrdisplaypresentchange', onVRDisplayPresentChange )
		}
		if( errorsList.style.display !== 'block' ){

			errorsList.style.display = 'block'
			setTimeout( function(){ errorsList.classList.add( 'show' )}, 1 )
		}
	}


	//  OMG Let’s enable some VR!
	
	else {

		if( errorsList.classList.contains( 'show' )){

			errorsList.classList.remove( 'show' )
			setTimeout( function(){ errorsList.style.display = 'none' }, 1000 )
		}
		if( vrToggle.style.display !== 'block' ){

			vrToggle.style.display = 'block'
			setTimeout( function(){ vrToggle.classList.add( 'show' )}, 1 )
			window.addEventListener( 'vrdisplaypresentchange', onVRDisplayPresentChange )
			vrToggle.addEventListener( 'mousedown',  onVRToggle )
			vrToggle.addEventListener( 'touchstart', onVRToggle )
		}	
	}


	return hasErrors
}




    //////////////
   //          //
  //   Boot   //
 //          //
//////////////


new Mode({

	name: 'boot',
	setup: function(){

		setHighScore( settings.highScore )


		//  Enable hover interactions for the compatability table.

		const 
		els = Array.from( document.querySelectorAll( '#compatability-table td' )),
		highlight = function( event ){

			const 
			el = event.target,
			x  = el.cellIndex,
			y  = el.parentNode.rowIndex

			if( x === 0 && y === 0 ) return
			el.classList.add( 'highlighted' )
			els.forEach( function( other ){

				const
				otherX = other.cellIndex,
				otherY = other.parentNode.rowIndex

				if( ( x === 0 && y === otherY ) ||
					( y === 0 && x === otherX )){

					other.classList.add( 'highlighted' )
				}
				if( x > 0 && y > 0 && (
					( otherX === x && otherY === 0 ) || ( otherX === 0 && otherY === y ))){

					other.classList.add( 'highlighted' )
				}
			})
		},
		unhighlight = function(){

			els.forEach( function( el ){

				el.classList.remove( 'highlighted' )
			})
		}
		els.forEach( function( el ){

			el.addEventListener( 'mouseenter',  highlight )
			el.addEventListener( 'touchstart',  highlight )
			el.addEventListener( 'mouseleave',  unhighlight )
			el.addEventListener( 'touchend',    unhighlight )
		})


		//  Enable that sweet pass glow animation on button text!

		const
		toggleOff     = document.getElementById( 'vr-toggle-off' ),
		textLength    = toggleOff.textContent.trim().length,
		framesPerChar = 60

		let f = framesPerChar * textLength * -2		
		toggleOff.innerHTML = '<span>' + toggleOff.textContent.trim().split( '' ).join( '</span><span>' ) +'</span>'
		M.tasks.updates.add( function(){

			if( document.getElementById( 'vr-toggle-container' ).style.display === 'block' &&
				M.detect.vrDisplay.isPresenting === false ){

				Array.from( toggleOff.querySelectorAll( 'span' )).forEach( function( element, index ){

					f ++
					if( f > framesPerChar * textLength * 2 ) f = framesPerChar * textLength * -2
					
					let 
					n = 1 / ( Math.abs(( f / framesPerChar ) - index ) + 1 ),
					grey  = Math.round(( 0.5 + n * 0.5 ) * 255 ),
					alpha = n

					element.style.color = 'rgb('+ grey +','+ grey +','+ grey +')'
					element.style.textShadow = '0 0 12px rgba(255,255,255,'+ alpha +')'
				})
			}
		})


		//  We’re just running our detection once right here,
		//  but we’re going to run it on a constant loop
		//  if we make it to 'attractor' mode.

		handleDetection()
	},
	update: function(){

		if( M.detect.hasWebGL ) Mode.switchTo( 'three setup' )
	}
})




    ///////////////
   //           //
  //   Three   //
 //           //
///////////////


new Mode({

	name: 'three setup',
	setup: function(){


		//  Now that we have WebGL we can go ahead and setup our Three bits.

		M.three.setup()


		//  Create some fog to hide the edge of our universe wrapper,
		//  and give ourselves a wee bit of ambient light.

		M.three.scene.fog = new THREE.Fog( 0x000000, settings.radiusFogBegins, settings.radiusFogEnds )
		M.three.scene.add( new THREE.AmbientLight( 0x333333 ))


		//  Create a background star field out of particles.
		//  These will never get closer or further away. Permanently far.

		const
		particles = 5 * 1000,
		geometry  = new THREE.BufferGeometry(),
		positions = new Float32Array( particles * 3 ),
		colors    = new Float32Array( particles * 3 )

		for( let i = 0; i < positions.length; i += 3 ){
			
			const 
			range       = settings.radiusStarsEnd - settings.radiusStarsBegin,
			rangeIndex  = range * Math.random(),
			rangeNormal = rangeIndex / range,
			distance    = settings.radiusStarsBegin + rangeIndex,
			vector      = M.utils.randomSphereSurfacePoint( M.utils.center, distance )

			positions[ i     ] = vector.x
			positions[ i + 1 ] = vector.y
			positions[ i + 2 ] = vector.z

			const gray = ( 1 - rangeNormal ) * 0.5
			colors[ i     ] = gray
			colors[ i + 1 ] = gray
			colors[ i + 2 ] = gray
		}
		geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ))
		geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ))
		geometry.computeBoundingSphere()
		
		const points = new THREE.Points( geometry, new THREE.PointsMaterial({
			
			size:         0.5,
			vertexColors: THREE.VertexColors,
			blending:     THREE.AdditiveBlending,
			depthTest:    true,
			depthWrite:   true,
			transparent:  true,
			alphaTest:    0.3,
			fog:          false
		}))
		points.name = 'starfield'
		points.frustumCulled = false
		M.three.scene.add( points )


		let loader = new THREE.TextureLoader()
		loader.load( 'media/sprite.png', function( texture ){

			points.material.map = texture
		})


		//  Our Explosion class needs a little setup task executed
		//  so its point cloud can be fully ready to go when we are.

		Explosion.setup()


		//  Now’s a good time to build out our player object as well.

		player.setup()


		//  We’ve got WebGL and our scene should be ready(-ish)
		//  so we can reveal the Three DIV container.

		document.getElementById( 'three' ).classList.add( 'show' )


		//  Now that we’re all setup we can switch to attractor mode
		//  which is sort of a waiting room.

		Mode.switchTo( 'attractor' )
	}
})




    ///////////////////
   //               //
  //   Attractor   //
 //               //
///////////////////


new Mode({

	name: 'attractor',
	setup: function(){
		

		//  Jumbotrons light the scene so we need to be sure we have
		//  at least one turned on.

		if( Jumbotron.all.length === 0 ) new Jumbotron( 0, 2 + 5, -2 )


		//  We want some Rocks to orbit the camera
		//  while we wait for the user to enter VR.

		if( Rock.all.length === 0 ){

			for( let i = 0; i < 100; i ++ ){

				new Rock({

					style: Rock.STYLES[ Math.floor( Rock.STYLES.length * Math.random())],
					movement: 'orbit'
				})
			}
		}
	},


	//  Yes, we want to constantly check on our VR capabilities
	//  incase some hardware is late on reporting itself
	//  or perhaps the user plugs something in after page load, etc.

	update: handleDetection
})




    /////////////////////
   //                 //
  //   Controllers   //
 //                 //
/////////////////////


new Mode({

	name: 'waiting for first controller',
	setup: function(){
	
		player.hudText.print( 'Turn on your controllers\n& press some buttons.' )
	},
	update: function(){
	
		if( THREE.VRController.controllers.length > 0 ) Mode.switchTo( 'waiting for second controller' )
	},
	teardown: function(){
	
		player.hudText.print()
	}
})
new Mode({

	name: 'waiting for second controller',
	setup: function(){

		player.hudText.print( 'Now press buttons on\nyour second controller.' )
	},
	update: function(){
	
		if( THREE.VRController.controllers.length > 1 ) Mode.switchTo( 'menu' )
	},
	teardown: function(){
	
		player.hudText.print()
	}
})
new Mode({

	name: 'menu',
	setup: function(){
	
		const
		position = new THREE.Vector3( 0, 1.3, -2 ),
		button = new Button( 'Play Now', position, function(){

			new Explosion( position )
			Mode.switchTo( 'game play' )
			Button.destroy( button )
		})
	}
})




    ///////////////////
   //               //
  //   Game Play   //
 //               //
///////////////////


new Mode({

	name: 'game play',
	setup: function(){
	
		Rock.all.destroy()
		level.number = 0
		player.reset()
		player.enableEngines()
	},
	update: function(){
	
		if( Rock.all.length === 0 ){

			level.create()
		}
		if( player.lives < 1 ) Mode.switchTo( 'game over' )
	},
	teardown: function(){
	
		player.disableEngines()
	}
})




    ///////////////////
   //               //
  //   Game Over   //
 //               //
///////////////////


new Mode({

	name: 'game over',
	setup: function(){


		//  Now that the game has ended, let’s note the player’s
		//  final score and level achieved.

		M.stats.note({
					
			hitType:       'event',
			eventCategory: 'Gameplay',
			eventAction:   'Game ended',
			eventLabel:    'Score',
			value:          player.score
		
		}, {
					
			hitType:       'event',
			eventCategory: 'Gameplay',
			eventAction:   'Game ended',
			eventLabel:    'Level',
			value:          level.number
		})


		//  Update to include final score, asteroids destroyed, level number.

		player.hudText.print( 'Game over' )

		const
		position = new THREE.Vector3( 0, 1.3, -2 ),
		button = new Button( 'Play Again', position, function(){

			new Explosion( position )
			Mode.switchTo( 'game play' )
			Button.destroy( button )
		})
	},
	teardown: function(){

		Rock.all.destroy()
		player.hudText.print()
	}
})




    /////////////////////
   //                 //
  //   Debug Modes   //
 //                 //
/////////////////////


new Mode({

	name: 'explosion test',
	setup: function(){
	
		Rock.all.destroy()
		new Rock({

			position: new THREE.Vector3( -3, 1, -50 ),
			positionVelocity: new THREE.Vector3()
		})
		setTimeout( Rock.all.explode, 1000 )
		setTimeout( Rock.all.explode, 1000 + Explosion.DURATION_MAX )
		setTimeout( Rock.all.explode, 1100 + Explosion.DURATION_MAX * 2 )
	}
})
new Mode({

	name: 'wrap test',
	setup: function(){

		const wrapGrid = new THREE.Mesh(

			new THREE.SphereBufferGeometry( settings.radiusVisible, 32, 32 ),
			new THREE.MeshBasicMaterial({

				wireframe: true,
				color: 0xFF00FF
			})
		)
		M.three.scene.add( wrapGrid )
	}
})
new Mode({

	name: 'poster',
	setup: function(){


		//  Turn off the UI we don’t need.

		document.querySelector( 'h1' ).style.display = 'none'
		document.getElementById( 'three-ui' ).style.display = 'none'
		document.getElementById( 'scroller' ).style.display = 'none'


		Rock.all.destroy()
		for( let i = 0; i < 20; i ++ ){

			const
			x = -100 + 200 * Math.random(),
			y = -100 + 200 * Math.random(),
			z =  -50 - 200 * Math.random(),
			style = Rock.STYLES[ Math.floor( Rock.STYLES.length * Math.random() )]
			
			new Rock({

				style,
				position: new THREE.Vector3( x, y, z ),
				positionVelocity: new THREE.Vector3()
			})
		}


		//  Let’s use THX as the in-progress score.

		player.setScore( 1138 )


		//  Position and rotate the player’s arms.
		
		M.three.scene.add( player.arms.left )
		player.arms.left.position.set( -0.3, -0.2, -0.2 )

		M.three.scene.add( player.arms.right )
		player.arms.right.position.set( 0.3, -0.2, -0.2 )
		player.arms.right.rotation.x = Math.PI * -0.4


		//  Make shit happen.

		setTimeout( function(){

			//rock.explode()
			//Rock.all.destroy()
			new Explosion( new THREE.Vector3( 8, -6, -20 ), 10 )
		
		}, 1000 )


		//  Make those stars a little bigger!

		const starfield = M.three.scene.getObjectByName( 'starfield' )
		starfield.material.size = 3.0
		starfield.material.needsUpdate = true
	},
	teardown: function(){

		document.querySelector( 'h1' ).style.display = 'block'
		document.getElementById( 'three-ui' ).style.display = 'block'
		document.getElementById( 'scroller' ).style.display = 'block'
	}
})




M.tasks.setups.add( function(){ Mode.switchTo( 'boot' )})
M.tasks.updates.add( Mode.run )




const help = 
	'\nSPACE ROCKS'+
	'\n───────────'+
	'\nRevision '+ settings.version +'\n'+
	'\nHi! Here are some commands you might find interesting:\n'+
	'\n  Mode.current'+
	'\n  Mode.all'+
	'\n  M.tasks.setups.inspect()'+
	'\n  M.tasks.updates.inspect()'+
	'\n  THREE.VRController.inspect()'+
	'\n\n'
console.log( help )