
//  Copyright © 2017, 2018 Moar Technologies Corp. See LICENSE for details.




function Button( text, position, action ){

	THREE.Object3D.call( this )
	Button.all.push( this )
	
	this.position.copy( position )
	this.action = action
	M.three.world.add( this )

	const
	canvas  = document.createElement( 'canvas' ),
	context = canvas.getContext( '2d' ),
	width   = 0.8,//  meters
	height  = 0.2 //  meters

	canvas.width  = 1024
	canvas.height =  256
	context.font  = '300 200px BigNoodle, "Roboto Light", Roboto'
	context.fillStyle = 'white'
	context.textAlign = 'center'
	context.fillText( text, canvas.width / 2, canvas.height * 0.9 )

	const texture = new THREE.Texture( canvas )
	texture.needsUpdate = true

	const mesh = new THREE.Mesh(
	
		new THREE.PlaneGeometry( width, height ),
		new THREE.MeshBasicMaterial({

			map: texture,
			transparent: true,
			blending: THREE.AdditiveBlending
		})
	)
	this.add( mesh )

	const bg = new THREE.Mesh(

		new THREE.BoxBufferGeometry( 1, 0.5, 0.1 ),
		new THREE.MeshBasicMaterial({

			transparent: true,
			blending: THREE.AdditiveBlending,
			side: THREE.DoubleSide,
			opacity: 0.3
		})
	)
	bg.position.set( 0, 0, -0.11 )
	this.add( bg )
}
Button.prototype = Object.create( THREE.Object3D.prototype )
Button.prototype.constructor = Button




Button.all = []
Button.destroy = function( o ){

	M.three.world.remove( o )
	o.children.forEach( function( child ){

		if( child.material ) child.material.dispose()
		if( child.geometry ) child.geometry.dispose()
	})
	this.all.splice( this.all.findIndex( function( e ){ return e === o }), 1 )
}
Button.all.destroy = function(){

	Button.all.forEach( function( o ){ Button.destroy( o ) })
}




M.tasks.updates.add( Button.update )