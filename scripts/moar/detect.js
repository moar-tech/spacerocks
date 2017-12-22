
//  Copyright © 2017 Moar Technologies Corp. See LICENSE for details.




if( this.M === undefined ) this.M = {}
M.detect = (function( $ ){

	if( $ === undefined ) $ = {}


	//  What sort of hardware are we running on?

	const userAgent = navigator.userAgent
	$.isAndroid = /android/i.test( userAgent ),
	$.isIOS     = /ipad|iphone/i.test( userAgent ),
	$.isMobile  = /android|ipad|iphone|iemobile/i.test( userAgent ),
	$.isTablet  = ( $.isAndroid && !/mobile/i.test( userAgent )) || /ipad/i.test( userAgent )


	//  Can haz WebGL and WebVR APIs?
	//  We can know this stuff immediately.

	$.hasWebGL = (function(){
		
		const 
		canvas = document.createElement( 'canvas' ),
		gl = canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' )
		
		return ( gl && gl instanceof WebGLRenderingContext )
	})(),
	$.hasWebVR = navigator.getVRDisplays !== undefined
	$.needsWebVRPolyfill = $.isMobile && !$.isTablet && !$.isAndroid && ( !$.hasWebVR )


	//  Eventually we will have a list of connected VR Displays.
	//  This allows us to select a single one as ‘active’.

	$.selectVRDisplay = function( i ){

		if( typeof i !== 'number' ) i = 0
		if( $.vrDisplays !== undefined && $.vrDisplays.length > 0 && i < $.vrDisplays.length ){

			$.vrDisplay = $.vrDisplays[ i ]
		}
		else return false
 		$.hasExternalDisplay = !!$.vrDisplay.capabilities && $.vrDisplay.capabilities.hasExternalDisplay
		$.dof = !$.vrDisplay.capabilities ? 0 : ( +$.vrDisplay.capabilities.hasOrientation + +$.vrDisplay.capabilities.hasPosition ) * 3
		let displayName = $.vrDisplay.displayName


		//  Expecting "HTC Vive DVT".

		$.isVive = /vive/i.test( displayName )
		

		//  Expecting "Oculus VR HMD (HMD)" or "Oculus VR HMD (Sensor)".
		//  Note that "Rift" is NOT part of the displayName.

		$.isOculus = /oculus/i.test( displayName )

		
		//  Expecting "Google, Inc. Daydream View".
		//  Unclear if stand-alone Daydream announced at I/O 2017
		//  will eventually require its own displayName check.

		$.isDaydream = /daydream/i.test( displayName )


		//  Would be nice to detect if this is a Samsung GearVR setup.

		$.isGearVR = undefined

		
		//  If it’s mobile but it’s not Daydream then we can consider
		//  it to be “Cardbaord” since we’re using the WebVR Polyfill
		//  to make any mobile device (with accelerometers) a potential
		//  3DOF virtual reality device.

		$.isCardboard = $.isMobile && !$.isDaydream


		//  One last bit here... Is this just an emulated HMD?
		//  ie. Chrome plug-in etc?

		$.isEmulatedHMD = /emulat/i.test( displayName )
	}


	//  Get a list of connected VR displays.
	//  For this we have to wait for a Promise to return.

	$.getVRDisplays = function( thenCallback ){

		new Promise( function( resolve ){
		

			//  Now WebVR API available? Bail with false.

			if( !$.hasWebVR ){
				
				resolve( false )
				return
			}


			//  Android Chrome has a bug that causes navigator.getVRDisplays to NEVER resolve:
			//  https://bugs.chromium.org/p/chromium/issues/detail?id=727969
			//  So check this out -- we’re going race vrDisplayPromise against one
			//  thet just resolves to an empty Array after half a second.
			
			const 
			vrDisplayPromise = navigator.getVRDisplays(),
			timeoutPromise = new Promise(( timeOutResolve ) => {
				
				setTimeout( function(){
					
					timeOutResolve( [] )//  Empty Array containing no vrDisplays.
				
				}, 500 )
			})

			Promise
			.race([ vrDisplayPromise, timeoutPromise ])
			.then(( displays ) => {
			
				$.vrDisplays = displays
				resolve( displays )
			})
			.catch(( error ) => {

				console.error( error )
				resolve( false )
			})
		})

		
		//  Perfectly fine for this to be undefined.
		//  Idea here is you can always call M.detect.getVRDisplays()
		//  if you expect that list to have changed.
		//  In the future we may scrap this entirely and instead
		//  rely on a connection event.

		.then( thenCallback )
	}


	//  Now that we have the dominoes in place it’s time to 
	//  get a list of the connected VR Displays
	//  and select one display from that list as ‘active’.

	$.getVRDisplays( function(){

		$.selectVRDisplay( 0 )
	})

	
	//  x

	$.getVRDisplay = new Promise( function( resolve ){

		if( window.VRDisplay !== undefined && $.vrDisplay instanceof VRDisplay ) resolve( $.vrDisplay )
		else if( $.vrDisplays !== undefined && $.vrDisplays.length > 0 ){

			$.selectVRDisplay( 0 )
			resolve( $.vrDisplay )
		}
		else {

			$.getVRDisplays( function(){

				$.selectVRDisplay( 0 )
				resolve( $.vrDisplay )
			})
		}
	})


	//  Package it up and send it out.

	return $
})()



