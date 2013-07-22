
// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function(){
  log.history = log.history || [];   // store logs to an array for reference
  log.history.push(arguments);
  arguments.callee = arguments.callee.caller;  
  if(this.console) console.log( Array.prototype.slice.call(arguments) );
};
// make it safe to use console.log always
(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();)b[a]=b[a]||c})(window.console=window.console||{});


// place any jQuery/helper plugins in here, instead of separate, slower script files.


/**
 * tableGenerator
 * @author	Tobin Bradley
 */
(function($) {
	$.fn.tableGenerator = function( options ) {
		
		// plugin's default options
		var settings = {
		    'rowClass': '',
		    'colClass': 'ui-widget-content',
		    'fields': [],
		    'nodataString': 'No records found.',
		    'data': {}
		}
		
		return this.each(function() {
			if ( options ) { 
				$.extend( settings, options );
			}
			writebuffer = "";
			// Write Title
			if (settings.data.total_rows > 0) {
				
				// Process JSON
				$.each(settings.data.rows, function(j, item){
					writebuffer += '<tr>';
					//Check to see if it's a table that includes locate/routing functions
					if (item.row.lon) {
						zoomClick = 'onclick="addMarker(' + item.row.lon + ',' + item.row.lat + ', 1, \'<p><b>' + item.row.name + '</b><br />' + item.row.address + '</p>\')"';
						routeurl = googleRoute(selectedAddress.address + ' NC', item.row.lat + ',' + item.row.lon );
						writebuffer += "<td class='" + settings.colClass + "'><a href='javascript:void(0);' title='Locate on the map.' " + zoomClick + "><img src='img/find.gif' style='margin: 0px' /></a></td><td class='" + settings.colClass + "'><a href='" + routeurl + "' target='_blank' title='Get driving directions.'><img src='img/car.png' style='margin: 0px' /></a></td>"
					}
					for (i = 0; i < settings.fields.length; i++) {
						writebuffer += '<td class="' + settings.colClass + '">' + eval(settings.fields[i]) + '</td>';		
					}
					writebuffer += '</tr>';
				});
				
				// Populate table
				$(this).append(writebuffer);

			}
			else {
				// No records found
				$(this).append('<tr><td class="' + settings.colClass + '" colspan="' + settings.fields.length + '>' + settings.nodataString + '</td></tr>');
			}
			
		});
	}	
		
})(jQuery);



