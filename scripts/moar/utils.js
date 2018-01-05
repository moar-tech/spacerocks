
//  Copyright © 2017, 2018 Moar Technologies Corp. See LICENSE for details.




if( this.M === undefined ) this.M = {}
M.utils = {
	
	center: new THREE.Vector3(),
	fuzz3: function( vector3, fuzzFactor ){

		if( fuzzFactor === undefined ) fuzzFactor = 0.2
		const fuzz = function( n ){

			return n - ( n * fuzzFactor / 2 ) + ( n * fuzzFactor * Math.random() )
		}
		return new THREE.Vector3(

			fuzz( vector3.x ),
			fuzz( vector3.y ),
			fuzz( vector3.z )
		)
	},
	wrapBounds: function( position ){

		if( M.utils.center.distanceTo( position ) <= settings.boundsRadius ) return false
		return position.clone().normalize().multiplyScalar( -settings.boundsRadius )
	},
	randomSphereSurfacePoint: function( position, radius ){

		if( position === undefined ) position = M.utils.center
		if( radius   === undefined ) radius = 1

		const
		u = Math.random(),
		v = Math.random(),
		theta = Math.PI * 2 * u,
		phi   = Math.acos( 2 * v - 1 ),
		x = position.x + ( radius * Math.sin( phi ) * Math.cos( theta )),
		y = position.y + ( radius * Math.sin( phi ) * Math.sin( theta )),
		z = position.z + ( radius * Math.cos( phi ))

		return new THREE.Vector3( x, y, z )
	},
	

	//  Expects a function containing a multiline comment.
	//  The commented section will be returned as a string.

	parseMultilineString: function( f ){

		f = f.toString()
		return f.substring( 

			f.indexOf( '/'+'*' ) + 2, 
			f.lastIndexOf( '*'+'/' )
		)
	}
}

