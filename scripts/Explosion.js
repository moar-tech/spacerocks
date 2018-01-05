
//  Copyright © 2017, 2018 Moar Technologies Corp. See LICENSE for details.




function Explosion( origin, radius ){


	//  Is there a group of particles not currently in use?
	//  If not let’s bail by returning undefined.

	this.groupIndex = Explosion.groupsInUse.findIndex( function( inUse ){

		return !inUse
	})
	if( this.groupIndex < 0 ) return undefined


	//  Ok we found an open group that we can use!
	//  We can go ahead with building this object.

	if( origin === undefined ) origin = new THREE.Vector3()
	if( radius === undefined ) radius = 1
	this.bornAt = performance.now()

	Explosion.groupsInUse[ this.groupIndex ] = true
	Explosion.all[ this.groupIndex ] = this//  Will replace any previous Explosion instance in here! Recycling ;)	
	Explosion.material.uniforms.uRadii.value[ this.groupIndex ] = radius
	Explosion.material.uniforms.uOrigins.value[ this.groupIndex * 3     ] = origin.x
	Explosion.material.uniforms.uOrigins.value[ this.groupIndex * 3 + 1 ] = origin.y
	Explosion.material.uniforms.uOrigins.value[ this.groupIndex * 3 + 2 ] = origin.z
	Explosion.material.uniforms.uStartTimes.value[ this.groupIndex ] = this.bornAt
}




Explosion.prototype.update = function( timeDelta ){

	const
	now = performance.now(),
	elapsed = now - this.bornAt

	if( elapsed > Explosion.DURATION_MAX ){

		Explosion.groupsInUse[ this.groupIndex ] = false
		Explosion.all[ this.groupIndex ] = undefined
		return
	}
}




Explosion.DURATION_MIN   =  500
Explosion.DURATION_MAX   = 2000
Explosion.DURATION_RANGE = Explosion.DURATION_MAX - Explosion.DURATION_MIN


Explosion.all = []
Explosion.particlesPerGroup = 1000
Explosion.groupsInUse = [

	false,//  Sorrow
	false,//  Joy
	false,//  Girls
	false,//  Boys
	false //  Silver
]
Explosion.particlesTotal = Explosion.particlesPerGroup * Explosion.groupsInUse.length




Explosion.setup = function(){

	const
	uRadii      = new Float32Array( Explosion.groupsInUse.length ),
	uStartTimes = new Float32Array( Explosion.groupsInUse.length ),
	uOrigins    = new Float32Array( Explosion.groupsInUse.length * 3 ),
	group       = new Float32Array( Explosion.particlesTotal ),
	duration    = new Float32Array( Explosion.particlesTotal ),
	position    = new Float32Array( Explosion.particlesTotal * 3 )

	for( let i = 0; i < Explosion.particlesTotal; i ++ ){

		group[ i ] = ( Math.floor( i / Explosion.particlesPerGroup ))
		duration[ i ] = Explosion.DURATION_MIN + Explosion.DURATION_RANGE * Math.random()

		const 
		n = i * 3,
		radius = 0.8 + 0.4 * Math.random(),//  Yields average of 1.0. IMPORTANT!
		point  = M.utils.randomSphereSurfacePoint( M.utils.center, radius )

		position[ n     ] = point.x
		position[ n + 1 ] = point.y
		position[ n + 2 ] = point.z
	}

	const geometry = new THREE.BufferGeometry()
	geometry.addAttribute( 'group',    new THREE.BufferAttribute( group, 1 ))
	geometry.addAttribute( 'duration', new THREE.BufferAttribute( duration, 1 ))
	geometry.addAttribute( 'position', new THREE.BufferAttribute( position, 3 ))
	Explosion.geometry = geometry

	const material = new THREE.ShaderMaterial({
		
		uniforms: {
		
			uSize:       { type: 'f',   value: 2000 },
			uRadii:      { type: 'fv1', value: uRadii },
			uStartTimes: { type: 'fv1', value: uStartTimes },
			uOrigins:    { type: 'fv',  value: uOrigins },
			uTimeNow:    { type: 'f',   value: performance.now() }
		},
		vertexShader: M.utils.parseMultilineString( function(){/*

			uniform float uSize;
			uniform float uRadii[ 5 ];     //  length === Explosion.groupsInUse.length
			uniform float uStartTimes[ 5 ];//  length === Explosion.groupsInUse.length
			uniform vec3  uOrigins[ 5 ];   //  length === Explosion.groupsInUse.length
			uniform float uTimeNow;

			attribute float group;
			attribute float duration;

			varying float n;
			
			void main(){

				int g = int( group );
				float timeBegan = uStartTimes[ g ];
				if( timeBegan == 0.0 ) n = 1.0;
				else n = (uTimeNow - timeBegan) / duration;
				if( n < 0.0 ) n = 1.0;//  Reason I can’t just clamp() it.
				if( n > 1.0 ) n = 1.0;
				
				float radius = uRadii[ g ];
				vec3 currentPosition = uOrigins[ g ] + ( position * radius ) + ( position * n * 10.0 );
				vec4 mvPosition = modelViewMatrix * vec4( currentPosition, 1.0 );
				gl_Position     = projectionMatrix * mvPosition;

				float size   = uSize * ( 1.0 - n );
				gl_PointSize = size * ( 1.0 / length( mvPosition.xyz ));
			}
		*/}),
		fragmentShader: M.utils.parseMultilineString( function(){/*

			uniform sampler2D texture;
			varying float n;

			vec3 hsv2rgb( vec3 c ){
			
				vec4 K = vec4( 1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0 );
				vec3 p = abs( fract( c.xxx + K.xyz ) * 6.0 - K.www );
				return c.z * mix( K.xxx, clamp( p - K.xxx, 0.0, 1.0 ), c.y );
			}
			void main(){
				
				vec3 hsl = vec3( 1.0 - 0.6 * n, 1.0, 1.0 );
				vec3 rgb = hsv2rgb( hsl );
				gl_FragColor = vec4( rgb, 1.0 - n );
				gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );
			}
    	*/}),
		blending: THREE.AdditiveBlending,
		depthTest:   false,
		depthWrite:  true,
		transparent: true,
		alphaTest:   0.5
	})
	Explosion.material = material


	new THREE.TextureLoader().load( 'media/sprite.png', function( texture ){

		material.uniforms.texture = { type: 't', value: texture }
		material.needsUpdate = true
	})

	const points = new THREE.Points( geometry, material )
	points.frustumCulled = false
	M.three.world.add( points )
}
Explosion.update = function(){

	Explosion.material.uniforms.uTimeNow.value = performance.now()
	Explosion.groupsInUse.forEach( function( inUse, i ){ 

		if( inUse ) Explosion.all[ i ].update()
	})
}




M.tasks.updates.add( Explosion.update )