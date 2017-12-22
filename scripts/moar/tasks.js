
//  Copyright © 2017 Moar Technologies Corp. See LICENSE for details.




if( this.M === undefined ) this.M = {}
M.tasks = {

	setups: new TaskList(),
	setup: function(){

		M.tasks.setups.run().clear()
		M.tasks.update()
	},
	updates: new TaskList(),
	update: function( t ){

		M.tasks.updates.run( t )
	}
}
document.addEventListener( 'DOMContentLoaded', M.tasks.setup )

