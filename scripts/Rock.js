
//  Copyright © 2017, 2018 Moar Technologies Corp. See LICENSE for details.




function Rock({ style, movement, position, positionVelocity }){

	THREE.Object3D.call( this )


	//  What ‘style’ of Rock are we?

	if( style === undefined ) style = Rock.LARGE
	this.style    = style
	this.radius   = style.radius
	this.bornAt   = Date.now()
	this.movement = movement


	//  What does it look like?
	
	const geometry = style.geometries[ Math.floor( Math.random() * style.geometries.length )]
	this.mesh = new THREE.Mesh( geometry, Rock.MATERIAL )
	this.mesh.receiveShadow = true
	this.mesh.castShadow    = true
	this.add( this.mesh )


	//  Where is it?

	if( position !== undefined ){

		if( this.movement === 'orbit' ) this.mesh.position.copy( position )
		else this.position.copy( position )
	}
	else {

		const 
		distance = settings.radiusSafe + ( settings.radiusStarsBegin - settings.radiusSafe ) * Math.random(),
		randomPosition = M.utils.randomSphereSurfacePoint( player.position, distance )

		if( this.movement === 'orbit' ) this.mesh.position.copy( randomPosition )
		else this.position.copy( randomPosition )
	}


	//  Where’s it headed?

	if( positionVelocity !== undefined ) this.positionVelocity = positionVelocity.clone()
	else this.positionVelocity = M.utils.randomSphereSurfacePoint( 
			
		M.utils.center, 
		Rock.SPEED_INITIAL_SLOW + (( Rock.SPEED_INITIAL_FAST - Rock.SPEED_INITIAL_SLOW ) * Math.random() )
	)


	//  How’s it rotating?

	this.meshRotationSpeedX = 0.2
	this.meshRotationSpeedY = 0.3


	//  Add it to the system!

	Rock.all.push( this )
	Rock.all[ style.name.toLowerCase() ].push( this )
	M.three.world.add( this )
}
Rock.prototype = Object.create( THREE.Object3D.prototype )
Rock.prototype.constructor = Rock
Rock.prototype.wrap = wrap
Rock.prototype.update = function( timeDelta ){

	if( this.movement === 'orbit' ){

		const temp = this.positionVelocity.clone().multiplyScalar( timeDelta * 0.1 )
		//this.rotation.x += temp.x
		//this.rotation.y += temp.y
		this.rotation.z += temp.z
	}
	else {


		//  We have a steady meters-per-second speed.
		//  Based on the fraction of a second between the last render frame
		//  and this render frame how much do we need to move to match that
		//  speed? (A conversion of meters-per-second to meters-per-frame!)
		
		this.position.add(

			this.positionVelocity.clone().multiplyScalar( timeDelta )
		)

		//  Do we need to wrap space for this rock?
		//  This function does the check and applies as necessary.

		this.wrap()


		//  If we haven’t exceeded our galactic speed limit then we can increase
		//  our velocity ever so slightly.

		if( this.positionVelocity.length() < Rock.SPEED_LIMIT ){

			this.positionVelocity.multiplyScalar( 1.0001 )
		}
	}


	//  Keep that rock spinning...

	this.mesh.rotation.x += this.meshRotationSpeedX * timeDelta
	this.mesh.rotation.y += this.meshRotationSpeedY * timeDelta
}
Rock.prototype.explode = function( impactVelocity, impactPosition ){

	Rock.destroy( this )
	//const explosionPosition = impactPosition === undefined ? this.position : impactPosition
	//new Explosion( explosionPosition, this.radius )
	new Explosion( this.position, this.radius )
	if( this.style !== Rock.SMALL ){

		let nextStyle
		if( this.style === Rock.LARGE  ) nextStyle = Rock.MEDIUM
		if( this.style === Rock.MEDIUM ) nextStyle = Rock.SMALL

		for( let i = 0; i < 4; i ++ ){

			let velocity = this.positionVelocity.clone()
			if( impactVelocity !== undefined ) velocity.add( impactVelocity )

			new Rock({ style: nextStyle, position: this.position, velocity })
		}
	}
}
Rock.prototype.getValue = function(){

	return Rock.getValue( this.style )
}




//  Rock speed settings in meters per second.

Rock.SPEED_INITIAL_SLOW = 2.5
Rock.SPEED_INITIAL_FAST = 8.0
Rock.SPEED_LIMIT = 20


//  Rock styles: Small, Medium, Large!

Rock.makeGeometries = function( geometry, shrink, grow ){

	const
	smallest = 0.95,
	largest  = 1.08,
	range    = largest - smallest,
	newGeo   = geometry.clone(),
	distortGeometry = function( geometry ){

		for( let i = 0; i < geometry.vertices.length; i ++ ){

			geometry.vertices[ i ].multiplyScalar( smallest + range * Math.random() )
		}
		return new THREE.BufferGeometry().fromGeometry( geometry )
	}

	let geometries = []
	for( let i = 0; i < 3; i ++ ){

		const distorted = distortGeometry( geometry )
		distorted.computeBoundingSphere()
		geometries.push( distorted )
	}
	geometry = undefined
	return geometries
}
Rock.SMALL = {

	name: 'SMALL',
	value:  70,
	radius:  0.5,
	detail:  0,
	geometries: Rock.makeGeometries( new THREE.IcosahedronGeometry( 0.5, 0 ))
}
Rock.MEDIUM = {

	name: 'MEDIUM',
	value:  30,
	radius:  2,
	detail:  0,
	geometries: Rock.makeGeometries( new THREE.IcosahedronGeometry( 2, 1 ))
}
Rock.LARGE = {

	name: 'LARGE',
	value:  10,
	radius:  6,
	detail:  1,
	geometries: Rock.makeGeometries( new THREE.IcosahedronGeometry( 6, 2 ))
}
Rock.STYLES = [  Rock.SMALL, Rock.MEDIUM, Rock.LARGE ]
Rock.MATERIAL = new THREE.MeshPhongMaterial({

	shininess: 100
})
Rock.MATERIAL.flatShading = true




Rock.all = []
Rock.all.small  = []
Rock.all.medium = []
Rock.all.large  = []
Rock.all.destroy = function(){

	let i = Rock.all.length
	while( i -- ){
	
		Rock.destroy( Rock.all[ i ])
	}
}
Rock.all.explode = function(){

	let i = Rock.all.length
	while( i -- ){
	
		Rock.all[ i ].explode()
	}
}
Rock.update = function( timeDelta ){

	if( typeof timeDelta === 'number' ) Rock.all.forEach( function( rock ){ rock.update( timeDelta ) })
}
Rock.destroy = function( rock ){

	M.three.world.remove( rock )
	rock.children.forEach( function( child ){

		if( child.material ) child.material.dispose()
		if( child.geometry ) child.geometry.dispose()
	})
	this.all.splice( this.all.findIndex( function( e ){ return e === rock }), 1 )

	const style = rock.style.name.toLowerCase()
	this.all[ style ].splice( this.all[ style ].findIndex( function( e ){ return e === rock }), 1 )
}
Rock.getValue = function( style ){

	const
	elapsed = window.performance.now() - level.startTime,
	upperLimit = 1000 * 60 * 5//  Five minutes sound good to you?
	
	let value = style.value
	if( elapsed < upperLimit ){

		value += Math.round(( upperLimit - elapsed ) / 1000 )
	}

	return value
}




M.tasks.updates.add( Rock.update )