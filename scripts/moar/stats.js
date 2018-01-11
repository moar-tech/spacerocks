
//  Copyright © 2017, 2018 Moar Technologies Corp. See LICENSE for details.




if( this.M === undefined ) this.M = {}
M.stats = (function(){

	let verbosity = 0
	

	//  GA limits: First 10 are accepted immediately,
	//  then limits to 1 event per second. 
	//  https://developers.google.com/analytics/devguides/collection/gtagjs/events
	//  https://support.google.com/analytics/answer/1033068#NonInteractionEvents
	//  https://developers.google.com/analytics/devguides/collection/gtagjs/sending-data

	let
	noteLastSentTime = 0,
	notesSent = 0

	const
	notesBuffer = [],
	noteSend = function( args ){
		
		if( verbosity >= 0.5 ) console.log( 'Note:', args )
		if( window.gtag !== undefined && typeof window.gtag === 'function' ){

			notesSent ++
			noteLastSentTime = window.performance.now()
			gtag( ...args )
			if( verbosity >= 0.7 ) console.log( 'Noted:', args )
		}
	},
	note = function(){

		notesBuffer.push([ 'event', ...arguments ])
	},
	noteLinkHovered = function(){

		notesBuffer.push([ 

			'event',
			'link',
			'hover', 
			 this.getAttribute( 'href' ), 
			 { transport: 'beacon', hitCallback: function(){} }
		])
	},
	noteLinkFollowed = function(){

		notesBuffer.push([

			'event',
			'link',
			'followed',
			 this.getAttribute( 'href' ),
			 { transport: 'beacon', hitCallback: function(){} }
		])
		return true
	}
	

	//  Add automatic tracking for anchor tags.
	//  Note this won’t cover custom non-anchor buttons like ENTER VR, etc.

	M.tasks.setups.add( function(){

		Array.from( document.querySelectorAll( 'a' )).forEach( function( a ){


			//  Events. So many events.
			//  https://developer.mozilla.org/en-US/docs/Web/Events

			//a.addEventListener( 'mouseenter', noteLinkHovered  )
			a.addEventListener( 'click',      noteLinkFollowed )
			a.addEventListener( 'touchstart', noteLinkFollowed )
		})
	})


	//  We need to handle our buffer that minds GA limits.

	M.tasks.updates.add( function(){

		while( notesBuffer.length > 0 &&
			( notesSent < 10 || window.performance.now() - noteLastSentTime > 1000 )){

			noteSend( notesBuffer.shift() )
		}
	})


	//  Package for output.

	return {

		note,
		noteLinkHovered,
		noteLinkFollowed
	}
})()




M.tasks.setups.add( function(){


	//  We can track some abilities straight away.

	M.stats.note( 'has WebGL?', {
		
		event_category: 'APIs',
		event_label:     M.detect.hasWebGL,
		non_interaction: true
	})
	M.stats.note( 'has WebVR?', {
		
		event_category: 'APIs',
		event_label:     M.detect.hasWebVR,
		non_interaction: true
	})


	//  But some things we need to wait for --
	//  and they may change!

	window.addEventListener( 'vr display changed', function(){

		if( M.detect.hasWebVR && M.detect.vrDisplay instanceof VRDisplay ){

			M.stats.note( 'HMD is Connected?', {
				
				event_category: 'VR Hardware',
				event_label:     true,
				non_interaction: true
			})
			M.stats.note( 'HMD Name', {
				
				event_category: 'VR Hardware',
				event_label:     M.detect.vrDisplay.displayName,
				non_interaction: true
			})
			M.stats.note( 'HMD Degrees of Freedom', {
				
				event_category: 'VR Hardware',
				event_label:     M.detect.degreesOfFreedom,
				non_interaction: true
			})
			M.stats.note( 'HMD has External Display?', {

				event_category: 'VR Hardware',
				event_label:     M.detect.hasExternalDisplay,
				non_interaction: true
			})
		}
		else {

			M.stats.note( 'HMD is Connected?', {
				
				event_category: 'VR Hardware',
				event_label:     false,
				non_interaction: true
			})
		}
	})


	//  When the player finishes a game (by dying) we already note their
	//  score and the level they made it to.
	//  But if they bail early we want that info too!
	
	window.addEventListener( 'beforeunload', function(){

		if( Mode.current === 'game play' ){
		
			M.stats.note( 'Game aborted', {
						
				event_category: 'Gameplay',
				event_label:    'Score',
				value:           player.score
			})
			M.stats.note( 'Game aborted', {
						
				event_category: 'Gameplay',
				event_label:    'Level',
				value:           level.number
			})
		}
	})
})



