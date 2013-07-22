/**
 * This javascript file handles page rendering and events.
 * 
 * @author 		Tobin Bradley
 * @license 	MIT
 */


/**
 * Document Ready and Window Load events.
 */
$(document).ready(function() {
	
	// Accordions
	$("#accordion-map").accordion({header: "h3",  collapsible: true, autoHeight: false});
	$('#accordion-data').accordion({header: "h3", collapsible: true, autoHeight: false }).bind("accordionchange", function(event, ui) {
		if (ui.newHeader[0]) processAccordionDataChange(ui.newHeader[0].id);
	});
	
	// Tabs
	$('#left-tabs').tabs({
	   create: function(event, ui) { $(this).fadeIn("slow"); }
	});
    
	// Dialogs
	$("#search-dialog").dialog({ width: $("#searchdiv").width(), autoOpen: false, show: 'fade', hide: 'fade' });
	
	// Click events
	$("#searchdiv span").click(function(){ $('#search-dialog').dialog('open') });
	$("#searchinput").click(function() { $(this).select(); });
	
	// GPS   
	if (Modernizr.geolocation) {
		$(".gpslocation").show();
		$("#gogpslocation").click(function(){
			if (typeof gpsWatch != "number") {
				$("#gogpslocation").text("Parar de Seguir Mi Posición");
				gpsWatch = navigator.geolocation.watchPosition(
					function(position) {
						(typeof position.coords.altitude  == "undefined") ? altitude = position.coords.altitude + "m" : altitude = "Unknown";
						isNaN(position.coords.speed) ? speed = "Unknown" : speed = position.coords.speed + "m/sec";
						addMarker(position.coords.longitude, position.coords.latitude, 2, "<h5>Posición Estimada</h5><p>Precisión: " + position.coords.accuracy + "m<br />Timestamp: " + position.timestamp + "<br />Altitud: " + altitude + "<br />Velocidad: " + speed + "</p>");						
					},
					function() { /* error handler */ },
					{enableHighAccuracy:true, maximumAge:30000, timeout:27000}
				);
			}
			else {
				gpsWatch = navigator.geolocation.clearWatch(gpsWatch);
				$("#gogpslocation").text("Conocer Mi Ubicación");
			}
		});		
	}
	
	// Autocomplete
	$("#searchinput").autocomplete({
		 minLength: 4,
		 delay: 400,
		 source: function(request, response) {
		   
			  $.ajax({
				   url: wsbase + "v2/ws_geo_ubersearch.php",
				   dataType: "jsonp",
				   data: {
						searchtypes: "Address,Library,School,Park,GeoName,Road,CATS,Intersection,PID",
						query: request.term
				   },
				   success: function(data) {
						if (data.total_rows > 0) {
							 response($.map(data.rows, function(item) {
								  return {
									   label: urldecode(item.row.displaytext),
									   value: item.row.displaytext,
									   responsetype: item.row.responsetype,
									   responsetable: item.row.responsetable,
									   getfield: item.row.getfield,
									   getid: item.row.getid
								  }
							 }));
							
						}
						else if  (data.total_rows == 0) {
							 response($.map([{}], function(item) {
								  return {
									   // Message indicating nothing is found
									   label: "No records found."
								  }
							 }))
						}
						else if  (data.total_rows == -1) {
							 response($.map([{}], function(item) {
								  return {
									   // Message indicating no search performed
									   label: "More information needed for search."
								  }
							 }))
						}
				   }
			  })
		 },
		 select: function(event, ui) {
			  // Run function on selected record
			  if (ui.item.responsetype) {
				   locationFinder(ui.item.responsetype, ui.item.responsetable, ui.item.getfield, ui.item.getid, ui.item.label, ui.item.value);
			  }
		 }
	}).data("autocomplete")._renderMenu = function (ul, items) {
		 var self = this, currentCategory = "";
		 $.each( items, function( index, item ) {
			  if ( item.responsetype != currentCategory && item.responsetype != undefined) {
				   ul.append( "<li class='ui-autocomplete-category'>" + item.responsetype + "</li>" );
				   currentCategory = item.responsetype;
			  }
			  self._renderItem( ul, item );
		 });
	};
  
});

$(window).load(function() {
   
	// Initialize Map
	initializeMap();
  
	// Detect arguments or localstorage
	if (getUrlVars()["matid"]) {		
		locationFinder("API", 'master_address_table', 'objectid', getUrlVars()["matid"]);
		if (getUrlVars()["category"]) {
		   jQuery.each($('#accordion-data h3'), function(i, val) {
			   if (val.id == getUrlVars()["category"] ) $('#accordion-data').accordion("activate", i);
		   });
		}
	}
   
});






/******************************************************************************/

/**
 * Accordion switch handler
 * @author 		Tobin Bradley
 * @license 	MIT
 */
function processAccordionDataChange(accordionValue) {
	if (null != selectedAddress) { // Make sure an address is selected
		switch (accordionValue) {
		  
			case "SERVICES":
				if ($('#parks table tbody').html().length == 0) { // Make sure information isn't already popupated
					// Parks
					url = pointBuffer(selectedAddress.x_coordinate, selectedAddress.y_coordinate, 2264, 'parks', 'prkname as name,prkaddr as address,prktype,city, x(transform(the_geom, 4326)) as lon, y(transform(the_geom, 4326)) as lat', '', 50000, "", "5", 'json', '?');
					$.getJSON(url, function(data) {					  
						$("#parks table tbody").tableGenerator({'fields': ['item.row.name','item.row.address'], 'data': data});
					});
					// Get libraries
					url = pointBuffer(selectedAddress.x_coordinate, selectedAddress.y_coordinate, 2264, 'libraries', 'name,address,city, x(transform(the_geom, 4326)) as lon, y(transform(the_geom, 4326)) as lat', '', 100000, "", "5", 'json', '?');
					$.getJSON(url, function(data) {					  
						$("#libraries table tbody").tableGenerator({'fields': ['item.row.name','item.row.address'], 'data': data}); 
					});
					// Fire Stations
					url = pointBuffer(selectedAddress.x_coordinate, selectedAddress.y_coordinate, 2264, 'fire_stations', 'name,address,station_ty as type,x(transform(the_geom, 4326)) as lon, y(transform(the_geom, 4326)) as lat', '', 264000, "", "3", 'json', '?');
					$.getJSON(url, function(data) {					  						 
						$("#fire-stations table tbody").tableGenerator({'fields': ['item.row.name','item.row.type','item.row.address'], 'data': data}); 
					});
				}
			break;
		  
			case "TRANSPORTATION":
				if ($('#bus-stops table tbody').html().length == 0) { // Make sure information isn't already popupated
					// CATS Bus Stops
					url = pointBuffer(selectedAddress.x_coordinate, selectedAddress.y_coordinate, 2264, 'busstops_pt', "stopdesc as name, replace(routes, ',', ', ') as address,x(transform(the_geom, 4326)) as lon, y(transform(the_geom, 4326)) as lat", '', 10000, "", "10", 'json', '?');					
					$.getJSON(url, function(data) {					  
						$("#bus-stops table tbody").tableGenerator({'fields': ['item.row.name','item.row.address'], 'data': data}); 
					});
					// CATS Park and Ride Locations
					url = pointBuffer(selectedAddress.x_coordinate, selectedAddress.y_coordinate, 2264, 'cats_park_and_ride', 'name,routes,address,x(transform(the_geom, 4326)) as lon, y(transform(the_geom, 4326)) as lat', '', 100000, "", "3", 'json', '?');
					$.getJSON(url, function(data) {					  
						 //$("#locate_template").tmpl(data.rows, { rowCount: data.total_rows }).appendTo("#park-and-rides table tbody");
						 $("#park-and-rides table tbody").tableGenerator({'fields': ['item.row.name','item.row.address','item.row.routes'], 'data': data}); 
					});
					// CATS Light Rail Stops
					url = pointBuffer(selectedAddress.x_coordinate, selectedAddress.y_coordinate, 2264, 'cats_light_rail_stations', "name,'N/A' as address, x(transform(the_geom, 4326)) as lon, y(transform(the_geom, 4326)) as lat", '', 126400, "", "3", 'json', '?');
					$.getJSON(url, function(data) {					  
						//$("#locate_template").tmpl(data.rows, { rowCount: data.total_rows }).appendTo("#light-rail-stops table tbody");
						$("#light-rail-stops table tbody").tableGenerator({'fields': ['item.row.name'], 'data': data}); 
					});
				}
			break;
		}
	}
}






/******************************************************************************/

/**
 * Generic Functions
 * @author 		Tobin Bradley
 * @license 	MIT
 */

/**
 * Takes a string a URL encodes or decodes it
 * @param {string} str
 */
function urlencode(str) {
	str = escape(str);
	str = str.replace('+', '%2B');
	str = str.replace('%20', '+');
	str = str.replace('*', '%2A');
	str = str.replace('/', '%2F');
	str = str.replace('@', '%40');
	return str;
}
function urldecode(str) {
	str = str.replace('+', ' ');
	str = unescape(str);
	return str;
}


/**
 * Return whether a string is a number or not
 */
function isNumber (o) {
  return ! isNaN (o-0);
}


/**
 * Add commas to numeric values
 */
$.fn.digits = function(){ 
	return this.each(function(){ 
		$(this).text( $(this).text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") ); 
	})
}

/**
 * Read a page's GET URL variables and return them as an associative array.
 */
function getUrlVars() {
	var vars = [], hash;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for(var i = 0; i < hashes.length; i++) {
		hash = hashes[i].split('=');
		vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	}
	return vars;
}


/**
 * Find locations
 * @param {string} findType  The type of find to perform
 * @param {string} findTable  The table to search on
 * @param {string} findField  The field to search in
 * @param {string} findID  The value to search for
 */
function locationFinder(findType, findTable, findField, findID, findLabel, findValue) {
	switch (findType) {
		case "Address": case "PID": case "API":
			url = wsbase + 'v1/ws_mat_addressnum.php?format=json&callback=?&jsonp=?&addressnum=' + findID;
			$.getJSON(url, function(data) {					  
				if (data.total_rows > 0) {
					$.each(data.rows, function(i, item){
						// Create selectedLocation links
						selectedLocation = item.row.address;
						selectedLocation += '<br /><span class="smallfont">[ <a href="javascript:void(0)" onclick="zoomToLonLat(' + item.row.longitude +', ' + item.row.latitude + ', 16);">Zoom To</a>';
						selectedLocation += ' | <a href="?matid=' + item.row.objectid + '">Permalink</a> ]</span>';
						$('.selectedLocation').html(selectedLocation);
						$('.selected-data-clear, .datatable tbody').empty();
						$('.selected-data').show();
						addMarker(item.row.longitude, item.row.latitude, 0, "<h5>Selected Property</h5><p>" + item.row.address + "</p>");
						selectedAddress = {
							"objectid": item.row.objectid,
							"x_coordinate": item.row.x_coordinate,
							"y_coordinate": item.row.y_coordinate,
							"parcelid": item.row.parcel_id,
							"address": item.row.address,
							"postal_city": item.row.postal_city,
							"lon": item.row.longitude,
							"lat": item.row.latitude
						};
						// Call data accordion change function if open so results are refreshed
						if ($('#accordion-data').accordion('option', 'active') && findType != "API") {
							processAccordionDataChange($("#accordion-data h3").eq($('#accordion-data').accordion('option', 'active')).attr("id"));
						}
						// Set local storage
						if (window.localStorage) {
							localStorage.setItem('gp_lastSelected', item.row.objectid);
							localStorage.setItem('gp_lastSelected_longitude', item.row.longitude);
							localStorage.setItem('gp_lastSelected_latitude', item.row.latitude);
						}
					});
				}
			});
			break; 
		case "Library": case "Park": case "School": case "GeoName": case "CATS": 
			// Set list of fields to retrieve from POI Layers
			poiFields = {
				"libraries" : "x(transform(the_geom, 4326)) as lon, y(transform(the_geom, 4326)) as lat, '<h5>' || name || '</h5><p>' || address || '</p>' AS label",
				"schools_1011" : "x(transform(the_geom, 4326)) as lon, y(transform(the_geom, 4326)) as lat, '<h5>' || coalesce(schlname,'') || '</h5><p>' || coalesce(type,'') || ' School</p><p>' || coalesce(address,'') || '</p>' AS label",
				"parks" : "x(transform(the_geom, 4326)) as lon, y(transform(the_geom, 4326)) as lat, '<h5>' || prkname || '</h5><p>Type: ' || prktype || '</p><p>' || prkaddr || '</p>' AS label",
				"geonames" : "longitude as lon, latitude as lat, '<h5>' || name || '</h5>'  as label",
				"cats_light_rail_stations" : "x(transform(the_geom, 4326)) as lon, y(transform(the_geom, 4326)) as lat, '<h5>' || name || '</h5><p></p>' as label",
				"cats_park_and_ride" : "x(transform(the_geom, 4326)) as lon, y(transform(the_geom, 4326)) as lat, '<h5>' || name || '</h5><p>Routes ' || routes || '</p><p>' || address || '</p>' AS label"
			};
			url = wsbase + "v1/ws_geo_attributequery.php?format=json&geotable=" + findTable + "&parameters=" + urlencode(findField + " = " + findID) + "&fields=" + urlencode(poiFields[findTable]) + '&callback=?';
			$.getJSON(url, function(data) {					  
				$.each(data.rows, function(i, item){
					addMarker(item.row.lon, item.row.lat, 1, item.row.label);
				});
			});
			break;
		case "Road": 
			url = wsbase + "v1/ws_geo_getcentroid.php?format=json&geotable=" + findTable + "&parameters=streetname='" + findValue + "' order by ll_add limit 1&forceonsurface=true&srid=4326&callback=?";
			$.getJSON(url, function(data) {					  
				$.each(data.rows, function(i, item){
					addMarker(item.row.x, item.row.y, 1, "<h5>Road</h5><p>" + findValue + "</p>");
				});
			});
			
			break;
		case "Intersection": 
			url = wsbase + "v1/ws_geo_centerlineintersection.php?format=json&callback=?";
			streetnameArray = findID.split("&");
			args = "&srid=4326&streetname1=" + urlencode(jQuery.trim(streetnameArray[0])) + "&streetname2=" + urlencode(jQuery.trim(streetnameArray[1]));
			$.getJSON(url + args, function(data) {
				if (data.total_rows > 0 ) {						  
					$.each(data.rows, function(i, item){
						addMarker(item.row.xcoord, item.row.ycoord, 1, "<h5>Intersection</h5><p>" + findID + "</p>");
					});
				}
			});
			break;
	}
}



/**
 * Create URL to Google Maps for routing
 * @param {string} fromAddress
 * @param {string} toAddress
 */
function googleRoute (fromAddress, toAddress) {
	url = "http://maps.google.com/maps?hl=en";
	url += "&saddr=" + urlencode(fromAddress);
	url += "&daddr=" + urlencode(toAddress);
	return url;
}

/**
 * Web service handler for point buffer operation
 * @param {float} x
 * @param {float} y
 * @param {integer} srid
 * @param {string} geotable
 * @param {string} fields
 * @param {string} parameters
 * @param {float} distance
 * @param {string} format
 * @param {string} jsonp_callback
 */
function pointBuffer (x, y, srid, geotable, fields, parameters, distance, order, limit, format, jsonp_callback) {
	url = wsbase;
	url += "v2/ws_geo_bufferpoint.php";
	url += "?x=" + x;
	url += "&y=" + y;
	url += "&srid=" + srid;
	url += "&geotable=" + geotable;
	url += "&fields=" + urlencode(fields);
	url += "&parameters=" + urlencode(parameters);
	url += "&distance=" + distance;
	url += "&order=" + urlencode(order);
	url += "&limit=" + urlencode(limit);
	url += "&format=" + format;
	url += "&callback=" + jsonp_callback;
	return url;
}

/**
 * Web sevrice handler for point overlay operation
 * @param {float} x
 * @param {float} y
 * @param {integer} srid
 * @param {string} geotable
 * @param {string} fields
 * @param {string} parameters
 * @param {string} format
 * @param {string} jsonp_callback
 */
function pointOverlay (x, y, srid, geotable, fields, parameters, format, jsonp_callback) {
	url = wsbase;
	url += "v1/ws_geo_pointoverlay.php";
	url += "?x=" + x;
	url += "&y=" + y;
	url += "&srid=" + srid;
	url += "&geotable=" + geotable;
	url += "&fields=" + urlencode(fields);
	url += "&parameters=" + urlencode(parameters);
	url += "&format=" + format;
	url += "&callback=" + jsonp_callback;
	return url;
}
