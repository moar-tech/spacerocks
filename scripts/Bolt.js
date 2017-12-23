
//  Copyright © 2017 Moar Technologies Corp. See LICENSE for details.




function Bolt( controller, rotation ){


	//  You can only shoot so many bolts per second.
	//  If you’re trying to fire too much we just return
	//  undefined and nothing happens!

	const now = Date.now()
	if( controller.lastBoltFiredAt === undefined ) controller.lastBoltFiredAt = 0
	if( now - controller.lastBoltFiredAt < 130 ) return undefined
	controller.lastBoltFiredAt = now


	//  But it’s been long enough apparently, so let’s fire.

	THREE.Object3D.call( this )
	Bolt.all.push( this )


	//  Let’s make something to look at.

	const mesh = new THREE.Mesh( Bolt.geometry, Bolt.material )
	mesh.rotation.x = Math.PI / -2
	mesh.rotation.y = rotation
	this.add( mesh )
	

	//  Ideally I’d like to use a PointLight here but that causes a 
	//  severe drop in FPS!

	// const light = new THREE.SpotLight( 0xFFFFFF )
	// light.castShadow = true
	// this.add( light )


	//	First, apply our hand controller’s matrix to this bolt
	//  so we have the correct rotation and correct-ish position.
	//  Then, we have to subtract the position of the universe!
	//  This is because when we fly, the universe moves, not us!
	//  Finally, bump the bolt out of the gun just enough so it’s
	//  entirely exited the barrel in its first frame. This way
	//  we don’t have to grow its length from 0 or use a mask or
	//  any of that extra overhead.
	//  Add that thing to the universe!

	this.applyMatrix( controller.matrixWorld )
	this.position.sub( M.three.world.getWorldPosition() )
	this.position.add( player.velocity )//  Quick fix.
	this.position.add( this.getWorldDirection().normalize().multiplyScalar( Bolt.length / -2 ))
	M.three.world.add( this )


	//  Probably a good idea if our bolt shoots in the correct
	//  direction relative to the hand controller.

	this.positionVelocity = this.getWorldDirection().normalize().multiplyScalar( -Bolt.speed )


	//  Oh, but what about our player’s velocity?!

	this.positionVelocity.add( player.velocity )
}
Bolt.prototype = Object.create( THREE.Object3D.prototype )
Bolt.prototype.constructor = Bolt
Bolt.prototype.wrap = wrap
Bolt.prototype.update = function( timeDelta ){


	//  We gotta move!

	const positionDelta = this.positionVelocity.clone().multiplyScalar( timeDelta )

	Bolt.raycaster.set( this.getWorldPosition(), this.getWorldDirection().negate() )
	Bolt.raycaster.far = this.position.distanceTo( positionDelta )
	const intersections = Bolt.raycaster.intersectObjects( Bolt.possibleTargets, true )
	if( intersections.length > 0 ){

		const
		hit = intersections[ 0 ],
		obj = hit.object.parent
		
		Bolt.destroy( this )
		if( obj instanceof Rock ){
			
			obj.explode( this.positionVelocity.clone().multiplyScalar( 0.3 ), obj.parent.worldToLocal( hit.point ))


			//  NOTE: If we add Alien Shooters we will need to know if this bolt
			//  was fired by the player or an alien before we adjust score!

			player.boltsGood ++
			player.accuracy = Math.round( player.boltsGood / player.boltsFired * 100 )
			player.addToScore( obj.getValue() )
		}
		else if( obj instanceof Button ){

			obj.action()
		}
		else if( obj === player ){

			new Explosion( new THREE.Vector3())
			player.markDeath()
		}
		return
	}


	//  We’re not going to destroy a rock so we might as well make
	//  our move forward in space official.

	this.position.add( positionDelta )
	this.children[ 0 ].rotation.y -= 0.15


	//  Bolts can only travel to the edge of the universe,
	//  then they vanish.
	//  Otherwise they keep on truckin’.

	if( this.wrap() === true ){

		Bolt.destroy( this )
		return
	}
}




Bolt.all       =  []
Bolt.speed     = 400//  Meters per second
Bolt.length    =  20
Bolt.geometry  = new THREE.CylinderGeometry( 0.06, 0.06, Bolt.length, 7 )
Bolt.material  = new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
Bolt.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3(), 0, settings.radiusWrap )


Bolt.update = function( timeDelta ){

	//if( Mode.current.name === 'game play' ) Bolt.possibleTargets = Rock.all.concat( player )
	if( Mode.current.name === 'game play' ) Bolt.possibleTargets = Rock.all
	else Bolt.possibleTargets = Button.all
	Bolt.all.forEach( function( bolt ){ bolt.update( timeDelta ) })
}
Bolt.destroy = function( bolt ){

	M.three.world.remove( bolt )
	bolt.children.forEach( function( child ){

		if( child.material ) child.material.dispose()
		if( child.geometry ) child.geometry.dispose()
	})
	this.all.splice( this.all.findIndex( function( e ){ return e === bolt }), 1 )
}




M.tasks.updates.add( Bolt.update )