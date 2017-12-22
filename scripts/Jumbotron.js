
//  Copyright © 2017 Moar Technologies Corp. See LICENSE for details.


/*


	JUMBO-TRON

	Originally there were to be several Jumbotrons in space, but having one
	single Jumbo helps it serve better as a wayfinding beacon as you fly 
	through a modulo universe. Left it coded as a class anyhow incase I change
	my mind. The order of the faces corresponds to the order that an Array of
	materials is used by Three. The face names correspond to Rubik’s Cube
	notation. Because reasons. And http://iamthecu.be


	          ─────────────────┐
	        ╱        Up       ╱│
	       ╱         2       ╱ │     Back
	      ┌─────────────────┐  │       5
	      │                 │ Right
	      │                 │  0
	Left  │      Front      │  │
	 1    │        4        │  │
	      │                 │  /
	      │                 │ /
	      └─────────────────┘
	              Down
	               3


		0 RIGHT
		┌─────────────────────────────────┐
		│                                 │
		│                                 │
		│        PHOTON BOLTS FIRED       │
		│              #,###              │
		│                                 │
		│           GOOD SHOTS            │
		│              #,###              │
		│                                 │
		│            ACCURACY             │
		│              ### %              │
		│                                 │
		│                                 │
		└─────────────────────────────────┘

		1 LEFT
		┌─────────────────────────────────┐
		│                                 │
		│       Y O U R   S C O R E       │
		│              #####              │
		│                                 │
		│       H I G H   S C O R E       │
		│             #######             │
		│                                 │
		│       R O C K   W O R T H       │
		│           Large   #             │
		│          Medium  ##             │
		│           Small  ##             │
		│                                 │
		└─────────────────────────────────┘

		2 UP
		┌─────────────────────────────────┐
		│                                 │
		│                                 │
		│                                 │
		│               ╱_                │
		│                                 │
		│       M     O     A     R       │
		│                                 │
		│        TECHNOLOGIES CORP        │
		│                                 │
		│                                 │
		│                                 │
		│                                 │
		└─────────────────────────────────┘

		3 DOWN
		┌─────────────────────────────────┐
		│                                 │		
		│                                 │
		│       S P A C E                 │
		│                 R O C K S       │
		│       ───────────────────       │
		│                                 │
		│                                 │
		│    Happy Holidays 2017 from     │
		│     Moar Technologies Corp      │
		│   Made with VRController for 3  │
		│                                 │
		│                                 │
		└─────────────────────────────────┘

		4 FRONT
		┌─────────────────────────────────┐
		│                                 │
		│                                 │
		│                                 │
		│          L E V E L  #           │
		│                                 │
		│            00:00:00             │
		│                                 │
		│           Large   #             │
		│          Medium  ##             │
		│           Small  ##             │
		│                                 │
		│                                 │
		└─────────────────────────────────┘

		5 BACK
		┌─────────────────────────────────┐
		│                                 │
		│    Y O U R   P O S I T I O N    │
		│       IN METERS BECAUSE VR      │
		│            X  #.###             │
		│            Y  #.###             │
		│            Z  #.###             │		
		│    Y O U R   V E L O C I T Y    │
		│       IN METERS PER SECOND      │
		│            X  #.###             │
		│            Y  #.###             │
		│            Z  #.###             │
		│                                 │
		└─────────────────────────────────┘


*/




function Jumbotron( x, y, z ){

	THREE.Object3D.call( this )
	this.faceIndex = 0
	Jumbotron.all.push( this )
	

	//  Where should this Jumbotron be?

	if( x === undefined ) x = new THREE.Vector3( 0, -5, 0 )
	if( x instanceof THREE.Vector3 ) this.position.copy( x )
	else this.position.set( x, y, z )
	M.three.world.add( this )


	//  Jumbotrons are also light sources.
	//  They illuminate the galaxy.

	const light = new THREE.PointLight( 0xFFFFFF, 0.7, settings.radiusWrap * 2, 2 )
	light.castShadow = true
	this.add( light )


	//  Here we’ll consider “faces” to be a bundle of a Canvas,
	//  Canvas 2D Context, Texture, and Material we can write to.
	//  We’ll later add a build() function to this bundle that
	//  is unique to that face, so each of the 6 sides can show
	//  its own thing.

	function makeFace( i ){

		const canvas  = document.createElement( 'canvas' )
		canvas.width  = 512
		canvas.height = 512

		const 
		context  = canvas.getContext( '2d' ),
		texture  = new THREE.Texture( canvas ),
		material = new THREE.MeshBasicMaterial({

			map:         texture,
			transparent: true,
			opacity:     0.95,
			side:        THREE.DoubleSide,
			color:       0xFFFFFF
		})

		
		//  Base Layer.
		//  Unfortunately it seems we cannot (yet) use SVGs with fragment identifiers
		//  to draw onto a Canvas like this. And it also seems we cannot style the fill
		//  and stroke colors of the SVG on the fly. So no SVG sprites possible here.
		//  Must use one single-purpose file for each face :(

		context.fillStyle = 'white'
		context.fillRect( 0, 0, canvas.width, canvas.height )
		const image = new Image()
		image.addEventListener( 'load', function(){
		
			context.drawImage( image, 0, 0, 512, 512, 0, 0, canvas.width, canvas.height )
			texture.needsUpdate = true
		})
		if(      i === 0 ) image.src = 'media/jumbotron-bolts.svg'
		else if( i === 1 ) image.src = 'media/jumbotron-score.svg'
		else if( i === 2 ) image.src = 'media/jumbotron-moar.svg'
		else if( i === 3 ) image.src = 'media/jumbotron-spacerocks.svg'
		else if( i === 4 ) image.src = 'media/jumbotron-level.svg'
		else if( i === 5 ) image.src = 'media/jumbotron-position.svg'

		const 
		toRoundedLocale = function( n ){

			const
			decimals = 3,
			factor   = Math.pow( 10, decimals ),
			sign     = Math.sign( n ) < 0 ? '-' : '',
			fixed    = ( Math.round( Math.abs( n ) * factor ) + '' ).padStart( decimals, '0' ),
			integer  = fixed.substr( 0, fixed.length - decimals ),
			fraction = fixed.substr( integer.length )

			return sign + integer.padStart( 1, '0' ) +'.'+ fraction
		},
		makeLevelClock = function(){

			let seconds = Math.round(( window.performance.now() - level.startTime ) / 1000 )

			let minutes = Math.floor( seconds / 60 )
			seconds -= ( minutes * 60 )

			let hours = Math.floor( minutes / 60 )
			minutes -= ( hours * 60 ) 

			return (
			
				( ''+ hours   ).padStart( 2, '0' ) +':'+ 
				( ''+ minutes ).padStart( 2, '0' ) +':'+ 
				( ''+ seconds ).padStart( 2, '0' )
			)
		}

		let update = function(){}
		if( i === 0 ) update = function(){//  Bolts

			context.fillStyle = 'white'
			context.fillRect( 128, 104, 256, 48 )
			context.fillRect( 128, 248, 256, 48 )
			context.fillRect( 128, 392, 256, 48 )

			context.font      = '32px Roboto'
			context.fillStyle = 'rgba( 0, 0, 0, 0.5 )'
			context.textAlign = 'center'
			context.fillText( Math.round( player.boltsFired.toLocaleString() ), 256, 144 )
			context.fillText( Math.round( player.boltsGood.toLocaleString() ),  256, 288 )
			context.fillText( player.accuracy.toLocaleString() +'%', 256, 432 )

			texture.needsUpdate = true
		}
		else if( i === 1 ) update = function(){//  Score

			context.fillStyle = 'white'
			context.fillRect( 128, 120, 256, 48 )
			context.fillRect( 128, 232, 256, 48 )
			context.fillRect( 260, 344, 48, 72 )

			context.font      = '32px Roboto'
			context.fillStyle = 'rgba( 0, 0, 0, 0.5 )'
			context.textAlign = 'center'
			context.fillText( player.score.toLocaleString(), 256, 160 )
			context.fillText( settings.highScore.toLocaleString(), 256, 272 )

			context.font      = '500 16px Roboto'
			context.fillStyle = 'black'
			context.textAlign = 'right'
			context.fillText( Rock.getValue( Rock.LARGE  ), 296, 360 )
			context.fillText( Rock.getValue( Rock.MEDIUM ), 296, 384 )
			context.fillText( Rock.getValue( Rock.SMALL  ), 296, 408 )

			texture.needsUpdate = true
		}
		else if( i === 4 ) update = function(){//  Level

			context.fillStyle = 'white'
			context.fillRect( 64, 96, 384, 160 )
			context.fillRect( 264, 344, 40, 72 )

			context.font      = '88px BigNoodle'
			context.fillStyle = 'black'
			context.textAlign = 'center'
			context.fillText( 'LEVEL '+ level.number, 256, 192 )
			
			context.font      = '500 32px Roboto'
			context.fillStyle = 'rgba( 0, 0, 0, 0.3333 )'
			context.textAlign = 'center'
			//context.fillText( '1 2 : 3 4 : 5 6', 256, 240 )
			context.fillText( makeLevelClock(), 256, 240 )

			context.font      = '500 16px Roboto'
			context.fillStyle = 'black'
			context.textAlign = 'right'
			context.fillText( Rock.all.large.length,  296, 360 )
			context.fillText( Rock.all.medium.length, 296, 384 )
			context.fillText( Rock.all.small.length,  296, 408 )

			texture.needsUpdate = true
		}
		else if( i === 5 ) update = function(){//  Position

			context.fillStyle = 'white'
			context.fillRect( 224, 144, 80, 96 )
			context.fillRect( 224, 352, 80, 96 )

			context.font      = '500 16px Roboto'
			context.fillStyle = 'black'
			context.textAlign = 'right'
			context.fillText( toRoundedLocale( -world.position.x ), 300, 168 )
			context.fillText( toRoundedLocale( -world.position.y ), 300, 192 )
			context.fillText( toRoundedLocale( -world.position.z ), 300, 216 )
			context.fillText( toRoundedLocale( player.velocity.x ), 300, 376 )
			context.fillText( toRoundedLocale( player.velocity.y ), 300, 400 )
			context.fillText( toRoundedLocale( player.velocity.z ), 300, 424 )

			texture.needsUpdate = true
		}
		return { canvas, context, texture, material, update }
	}


	//  Now we can make 6 faces.

	this.faces = []
	for( let i = 0; i < 6; i ++ ){

		const face = makeFace( i )
		this.faces.push( face )
	}


	//  And we can add all those faces to this Object3D.

	const mesh = new THREE.Mesh(

		Jumbotron.geometry,
		this.faces.reduce( function( a, e ){

			a.push( e.material )
			return a
		
		}, [])
	)
	this.add( mesh )


	//  Let’s spin this around so when the player looks up they can 
	//  comfortably read “SPACE ROCKS” and the holiday 2017 greeting.

	//mesh.rotation.y = Math.PI / 2


	//  What about some nicely defined edges for our cube shape?

	const 
	edges = new THREE.EdgesGeometry( Jumbotron.geometry ),
	lines = new THREE.LineSegments( edges, new THREE.LineBasicMaterial({ color: 0xFFFFFF }))
	
	this.add( lines )
}
Jumbotron.prototype = Object.create( THREE.Object3D.prototype )
Jumbotron.prototype.constructor = Jumbotron
Jumbotron.prototype.wrap = wrap




Jumbotron.all = []
Jumbotron.geometry = new THREE.BoxBufferGeometry( 4, 4, 4 )
Jumbotron.update = function( timeDelta ){
	
	
	//  To save on render time per frame
	//  let’s just update 1 face at a time.
	//  No one will notice!

	Jumbotron.all.forEach( function( e ){ 
	
		e.faces[ e.faceIndex ].update()
		e.faceIndex ++
		if( e.faceIndex > 5 ) e.faceIndex = 0
		e.wrap()
	})
}




M.tasks.updates.add( Jumbotron.update )