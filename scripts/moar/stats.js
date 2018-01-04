
//  Copyright © 2017, 2018 Moar Technologies Corp. See LICENSE for details.




if( this.M === undefined ) this.M = {}
M.stats = (function(){

	let verbosity = 0
	

	//  GA limits: First 10 are accepted immediately,
	//  then limits to 1 event per second. 
	//  https://developers.google.com/analytics/devguides/collection/gtagjs/events
	//  https://support.google.com/analytics/answer/1033068#NonInteractionEvents

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

		Array.from( arguments ).forEach( function( obj ){
		
			notesBuffer.push([ 'send', obj ])
		})		
	},
	noteLinkHovered = function(){

		notesBuffer.push([ 

			'send',
			'event',
			'link',
			'hover', 
			 this.getAttribute( 'href' ), 
			 { transport: 'beacon', hitCallback: function(){} }
		])
	},
	noteLinkFollowed = function(){

		notesBuffer.push([

			'send',
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
		noteLinkHovered
	}
})()




M.tasks.setups.add( function(){


	//  We can track some abilities straight away.

	M.stats.note({
		
		hitType:       'event',
		eventCategory: 'APIs',
		eventAction:   'has WebGL',
		eventLabel:     M.detect.hasWebGL,
		nonInteraction: true
	
	}, {
		
		hitType:       'event',
		eventCategory: 'APIs',
		eventAction:   'has WebVR',
		eventLabel:     M.detect.hasWebVR,
		nonInteraction: true
	})


	//  But some things we need to wait for --
	//  and they may change!

	window.addEventListener( 'vr display changed', function(){

		if( M.detect.vrDisplay instanceof VRDisplay ){

			M.stats.note({
				
				hitType:       'event',
				eventCategory: 'VR Hardware',
				eventAction:   'HMD Connected?',
				eventLabel:     true,
				nonInteraction: true
			
			}, {
				
				hitType:       'event',
				eventCategory: 'VR Hardware',
				eventAction:   'HMD Name',
				eventLabel:     M.detect.vrDisplay.displayName,
				nonInteraction: true
			
			}, {
				
				hitType:       'event',
				eventCategory: 'VR Hardware',
				eventAction:   'HMD Degrees of Freedom',
				eventLabel:     M.detect.degreesOfFreedom,
				nonInteraction: true
			
			}, {
				
				hitType:       'event',
				eventCategory: 'VR Hardware',
				eventAction:   'HMD has External Display?',
				eventLabel:     M.detect.hasExternalDisplay,
				nonInteraction: true
			})
		}
		else {

			M.stats.note({
				
				hitType:       'event',
				eventCategory: 'VR Hardware',
				eventAction:   'HMD exists?',
				eventLabel:     false,
				nonInteraction: true
			})
		}
	})


	//  When the player finishes a game (by dying) we already note their
	//  score and the level they made it to.
	//  But if they bail early we want that info too!
	
	window.addEventListener( 'beforeunload', function(){

		if( Mode.current === 'game play' ){
		
			M.stats.note({
						
				hitType:       'event',
				eventCategory: 'Gameplay',
				eventAction:   'Game aborted',
				eventLabel:    'Score',
				value:          player.score
			
			}, {
						
				hitType:       'event',
				eventCategory: 'Gameplay',
				eventAction:   'Game aborted',
				eventLabel:    'Level',
				value:          level.number
			})
		}
	})
})



