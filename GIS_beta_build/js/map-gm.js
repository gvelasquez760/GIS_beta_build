/**
 * map.gm.js
 * This javascript file handles map initialization and events for the google maps control.
 * 
 * @author 		Tobin Bradley
 * @license 	MIT
 */

/**
 * Globals particular to GM
 */
var markers = [];

//variables============================
 var map, iw;
 var gmarkers = [];
 
 /*
 var icons = { 
  bar: ['img/lugares/bomberos.png'],
  cafe: ['img/lugares/bomberos.png'],
  hotel: ['img/lugares/bomberos.png'],
  disco: ['img/lugares/bomberos.png'],
  white: ['img/lugares/bomberos.png']
 };
 */
//=====================================

 var icons = { 
  bomberos: ['img/lugares/bomberos.png'],
  carabineros: ['img/lugares/carabineros.png'],
  colegios: ['img/lugares/colegio.png'],
  salud: ['img/lugares/salud.png'],
  servicios: ['img/lugares/servicios.png'],
  white: ['img/lugares/servicios.png']
 };





var markerIcons = [{icon: ''}, {icon: 'img/blue-marker.png'}, {icon: 'img/dd-start.png'}]; // selected address, other stuff
var shadow = new google.maps.MarkerImage('img/shadow50.png', new google.maps.Size(37, 34), new google.maps.Point(0,0), new google.maps.Point(10, 34));
var markerImageDefault = new google.maps.MarkerImage('img/measure-vertex.png',null, null, new google.maps.Point(5,5));
var markerImageHover = new google.maps.MarkerImage('img/measure-vertex-hover.png',null, null, new google.maps.Point(8,8));
var measure = {
    ll:new google.maps.MVCArray(),
    ll2:new google.maps.MVCArray(),
    markers:[],
    line:null,
    poly:null
};
var clickListener = null;
/* parameters for mecklenburg base layers and services */
var meckWMSParams = [
	 "REQUEST=GetMap",
	 "SERVICE=WMS",
	 "VERSION=1.1.1",
	 "BGCOLOR=0xFFFFFF",
	 "TRANSPARENT=TRUE",
	 "SRS=EPSG:900913", // 3395? 
	 "WIDTH=256",
	 "HEIGHT=256"
];

/**
 * Map Initialization
 * Note most of the varible items - map config, layers, initial extent, etc.,
 * are in geoportal-xx-settings.js
 */
function initializeMap(){
     /**
     * Map options
     */
	 var myLatlng = new google.maps.LatLng(defaultMapCenter[0], defaultMapCenter[1]);
     var myOptions = {
          zoom: 8,
          center: myLatlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          scaleControl: true,
          maxZoom: mapMaxZoom,
          minZoom: mapMinZoom,
		  backgroundColor: '#C0C0C0'
     };
	
     /**
	* If localstorage values present, set zoom accordingly
	*/
	if (window.localStorage) {
		if (localStorage.getItem('gp_lastSelected_longitude') && localStorage.getItem('gp_lastSelected_latitude') && !(getUrlVars()["matid"] && getUrlVars()["category"])) {
			myOptions.center = new google.maps.LatLng(localStorage.getItem('gp_lastSelected_latitude'), localStorage.getItem('gp_lastSelected_longitude'));
			myOptions.zoom = 16;
               locationFinder("Address", 'master_address_table', 'objectid', localStorage.getItem('gp_lastSelected'));
		}
	}
	 
	/*  Initialize map  */
	map = new google.maps.Map(document.getElementById("map"), myOptions);
	iw = new google.maps.InfoWindow({
	maxWidth: 200});
	
    readData();
	
	
	
	
	
	
	
	
  
  $('#search').live('click', function() {
    // Obtenemos la dirección y la asignamos a una variable
    var address = $('#address').val();
    // Creamos el Objeto Geocoder
    var geocoder = new google.maps.Geocoder();
    // Hacemos la petición indicando la dirección e invocamos la función
    // geocodeResult enviando todo el resultado obtenido
    geocoder.geocode({ 'address': address+ ', quilpue'}, geocodeResult);
});
 
function geocodeResult(results, status) {
    // Verificamos el estatus
    if (status == 'OK') {
        // Si hay resultados encontrados, centramos y repintamos el mapa
        // esto para eliminar cualquier pin antes puesto
        var myOptions = {
            center: results[0].geometry.location,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
   //  map = new google.maps.Map(document.getElementById("map"), myOptions);
        // fitBounds acercará el mapa con el zoom adecuado de acuerdo a lo buscado
        map.fitBounds(results[0].geometry.viewport);
        // Dibujamos un marcador con la ubicación del primer resultado obtenido
        var markerOptions = { position: results[0].geometry.location, animation: google.maps.Animation.DROP}
        var marker = new google.maps.Marker(markerOptions);
		marker.setAnimation(google.maps.Animation.BOUNCE);
        marker.setMap(map);
    } else {
        // En caso de no haber resultados o que haya ocurrido un error
        // lanzamos un mensaje con el error
        alert("No se encuentra el Lugar");
    }
}
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
	
     
	/*  Map toolbar  */
	$("#mapcontrols").buttonset();
	$("#mapcontrols input:radio").click( function() { toolbar($(this)) });
	$("#toolbar").fadeIn("slow");
	
     /*  Coordinate display  */
     google.maps.event.addListener(map, 'mousemove', function(event) {
          $("#toolbar-coords").text(event.latLng.lng().toFixed(3) + " " + event.latLng.lat().toFixed(3));
     });
     
     
     /*  Layer Switcher  */
     $("#layerswitcher").append("<ul></ul>");
     $.each(mapLayers, function(index) {
          if (!this.isBaseLayer) {
		  
               // Add layer to layer switcher
			   /*
               $("#layerswitcher ul").append('<li><input type="checkbox" id="' + index + '" class="layer" /><label for="' + index + '">' + this.name + '</label></li>');
               // Add layer to ddl
			   */
               $('#opacitydll').append('<option value="' + index + '">' + this.name + '</option>');
			   
          }
     });     
     $('.layer').click(function(){
          var layerID = parseInt($(this).attr('id'));
          if ($(this).attr('checked')){
               var overlayMap = new google.maps.ImageMapType(createImageLayer(mapLayers[layerID]));
               map.overlayMapTypes.setAt(layerID,overlayMap);
          } else{
               if (map.overlayMapTypes.getLength()>0){
                    map.overlayMapTypes.setAt(layerID,null);
               }
          }
     });
	 
	 
	 
	 
	 
	   // Layer switcher panoramio
     $("#layerswitcher ul").append('<li><input type="checkbox" id="panoramio" class="layer" /><label for="panoramio">Imagenes de Panoramio</label></li>');
     $('.layer').change(function(){
            if (isNumber($(this).attr('id'))) {
                  var layerID = parseInt($(this).attr('id'));
                  if ($(this).attr('checked')){
                       var overlayMap = new google.maps.ImageMapType(overlayMaps[layerID]);
                       map.overlayMapTypes.setAt(layerID,overlayMap);
                  } else{
                       if (map.overlayMapTypes.getLength()>0){
                            map.overlayMapTypes.setAt(layerID,null);
                       }
                  }
            }
            else {
                  if ($(this).attr('id') == "panoramio") {
                        if ($(this).attr('checked')) panoramioLayer.setMap(map);
                        else panoramioLayer.setMap(null);
                  } 
            }
     });

	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	layerSwitcherZoomCheck();
	// Make layer switch disabled when zoom past layer's display range
	google.maps.event.addListener(map, 'zoom_changed', function() {
		 layerSwitcherZoomCheck();
	});
     
	 
     /*  Opacity Slider  */
     $("#layerOpacity").html("Layer Opacity: " + parseInt(mapLayers[$('#opacitydll').val()].opacity * 100 ) + "%");
     $('#opacitySlider').slider({range: "min", min: .1, max: 1, step: .05, value: mapLayers[$('#opacitydll').val()].opacity, slide: function(event, ui) {
          opacityDLLValue = $('#opacitydll').val();       
          mapLayers[opacityDLLValue].opacity = ui.value;          
          if ( $("#" + opacityDLLValue).is(":checked") ) {
               map.overlayMapTypes.setAt(opacityDLLValue,null);  
               var overlayMap = new google.maps.ImageMapType(createImageLayer(mapLayers[opacityDLLValue]));
               map.overlayMapTypes.setAt(opacityDLLValue,overlayMap);
          }  
          $("#layerOpacity").html("Layer Opacity: " + parseInt(ui.value * 100 ) + "%");
	 }});
     $('#opacitydll').change(function() {
          $("#opacitySlider").slider( "option", "value", mapLayers[$('#opacitydll').val()].opacity );
          $("#layerOpacity").html("Layer Opacity: " + parseInt(mapLayers[$('#opacitydll').val()].opacity * 100 ) + "%");
     });
     
     
     
     // Add holders for overlay layers to map 
     for (i=0; i < mapLayers.length; i++){
          map.overlayMapTypes.push(null);
     }

    
     /*  Set base maps  */
     var baseHolder = []; 
     $.each(mapLayers, function() {
          if (this.isBaseLayer) {
               map.mapTypes.set(this.name, new google.maps.ImageMapType(createImageLayer(this)));
               baseHolder.push(this.name);
          }
     });
     map.setOptions({
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControlOptions: {
               mapTypeIds: [
                    google.maps.MapTypeId.ROADMAP,
                    google.maps.MapTypeId.TERRAIN,
                    google.maps.MapTypeId.SATELLITE,
                    google.maps.MapTypeId.HYBRID
               ].concat(baseHolder)
          }
     });

      var panoramioLayer = new google.maps.panoramio.PanoramioLayer();
}

/**
 * Create image layer from config values
 */
function createImageLayer(obj) {
     var layer =  {
          name: obj.name,
          alt: obj.alt,
          getTileUrl: obj.getTileUrl,
          tileSize: new google.maps.Size(256, 256),
          opacity: obj.opacity,
          isPng: obj.format == 'image/png' ? true: false,
          maxZoom: obj.maxZoom,
          minZoom: obj.minZoom
     };
     return layer;
}

/*  Check to see if layers in the layer control should be enabled/disabled based on zoom level  */
function layerSwitcherZoomCheck() {
	 $.each(mapLayers, function(index) {
          zoom = map.getZoom();
          if (zoom > this.maxZoom || zoom < this.minZoom) $("#" + index).attr("disabled", true).next().css("color", "#D1D0CC");
          else $("#" + index).removeAttr("disabled").next().css("color", "inherit");
	 });
} 
      

/*  Function to handle toolbar events  */
function toolbar(tool) {
     // Clear listeners
     if (clickListener) google.maps.event.removeListener(clickListener);
     
     // clear measure
     measureReset();
     
     // set tool
     if (tool.attr("id") == "identify") {
          clickListener = google.maps.event.addListener(map, 'click', function(event) {
               if (map.getZoom() >= 16) {
                    url = pointOverlay(event.latLng.lng(), event.latLng.lat(), 4326, 'tax_parcels', 'pid', "", 'json', '?');
                    $.getJSON(url, function(data){
                         if (data.total_rows > 0 ) { 
                              $.each(data.rows, function(i, item){
                                   url = wsbase + "v1/ws_mat_pidgeocode.php?format=json&callback=?";
                                   args = "&pid=" + urlencode(item.row.pid);
                                   url = url + args;
                                   $.getJSON(url, function(data) {
                                        if (data.total_rows > 0 ) {
                                             if (i == 0) locationFinder("Address", 'master_address_table', 'objectid', data.rows[0].row.objectid);
                                        }
                                   });
                              }); 
                         }
                    });
               }
          });
     }
     if (tool.attr("id") == "measure") {
          clickListener = google.maps.event.addListener(map,'click',function(evt){
               measureAdd(evt.latLng);
          });
     }
     
}

/**
 * Zoom to a latlong at a particular zoom level. Projects wgs84 to 900913
 * @param {float} long
 * @param {float} lat
 * @param {integer} zoom
 */
function zoomToLonLat (lon, lat, zoom) {
	map.setCenter(new google.maps.LatLng(lat, lon));
     map.setZoom(zoom);
}


/**
 * Add markers (vector) to the map.
 * Also removes popups and selects added feature.
 * @param {float} long
 * @param {float} lat
 * @param {featuretype} the type of feature/marker (0=address,1=facility,2=identify)
 * @param {label} the content to put in the popup
 */
function addMarker(lon, lat, featuretype, label) {
	// remove old marker
     if (markers[featuretype] != null) markers[featuretype].setMap(null);

     // add new marker
     markers[featuretype] = new google.maps.Marker({
          position: new google.maps.LatLng(lat, lon), 
          map: map, 
          //title:"Hello World!",
          animation: google.maps.Animation.DROP,
          icon: markerIcons[featuretype].icon,
          flat: false,
          shadow: shadow
     });
     
     // Create info window
     var mycontent = label; 
     var infowindow = new google.maps.InfoWindow({ content: mycontent });
     google.maps.event.addListener(markers[featuretype], 'click', function() {
          infowindow.open(map,markers[featuretype]);
     });
     
     // zoom to marker
     if (map.getBounds()) {
          if (map.getBounds().contains(new google.maps.LatLng(lat, lon)) == false || map.getZoom() < 16 ) zoomToLonLat(lon, lat, 16);
     }
     else zoomToLonLat(lon, lat, 16);
     
     // active window if the map is big enough - i.e. not mobile
     if ($("#map").width() > 500) infowindow.open(map,markers[featuretype]);
	
}


/**
 * Bunch of code for measuring. Big hat tip to Jason Sanford
 */
function measureAdd(ll){
	var marker = new google.maps.Marker({
		map:map,
		position:ll,
		draggable:true,
		raiseOnDrag: false,
		
		/* Let the user know they can drag the markers to change shape */
		title:'Drag me to change the polygon\'s shape',
		
		icon: markerImageDefault
	});
	var count = measure.ll.push(ll);
     measure.ll2.push(ll);
	var llIndex = count-1;
		
	/* when dragging stops, and there are more than 2 points in our MVCArray, recalculate length and area measurements */
	google.maps.event.addListener(marker,'dragend',function(evt){
		if (measure.ll.getLength() >= 2) measureLine();
		if (measure.ll.getLength() >= 3) measureArea();
	});
	
	/* when the user 'mouseover's a marker change the image so they know something is different (it's draggable) */
	google.maps.event.addListener(marker,'mouseover',function(evt){
		marker.setIcon(markerImageHover);
	});
	
	google.maps.event.addListener(marker,'mouseout',function(evt){
		marker.setIcon(markerImageDefault);
	});
	
	/* when we drag a marker it resets its respective LatLng value in an MVCArray. Since we're changing a value in an MVCArray, any lines or polygons on the map that reference this MVCArray also change shape ... Perfect! */
	google.maps.event.addListener(marker,'drag',function(evt){
		measure.ll.setAt(llIndex,evt.latLng);
          measure.ll2.setAt(llIndex,evt.latLng);
	});
	measure.markers.push(marker);
	if (measure.ll.getLength()>1){
		/* We've got 2 points, we can draw a line now */
		if (!measure.line){
			measure.line = new google.maps.Polyline({
				map:map,
				clickable:false,
				strokeColor:'#FF0000',
				strokeOpacity:0.5,
				strokeWeight:3,
				path:measure.ll
			});
		}
		if (measure.ll.getLength()>2){
			/* We've got 3 points, we can draw a polygon now */
			if (!measure.poly){
				measure.poly = new google.maps.Polygon({
					clickable:false,
					map:map,
					fillOpacity:0.25,
					strokeOpacity:0,
					paths:measure.ll2
				});
			}
		}
	}
	if (count >= 2) measureLine();
     if (count >= 3) measureArea();
}
function measureReset(){
	/* Remove Polygon */
	if (measure.poly) {
		measure.poly.setMap(null);
		measure.poly = null;
	}
	/* Remove Line */
	if (measure.line) {
		measure.line.setMap(null);
		measure.line = null;
	}
	/* remove all LatLngs from the MVCArray */
	while (measure.ll.getLength()>0) {
            measure.ll.pop();
            measure.ll2.pop();
     }
	/* remove all markers */
	for (i=0;i<measure.markers.length;i++){
		measure.markers[i].setMap(null);
	}
	$('#toolbar-length, #toolbar-area').text('');
}
function measureArea(){
	area_met = google.maps.geometry.spherical.computeArea(measure.poly.getPath());
	area_ft = area_met * 10.7639104;
	
     if (area_ft <= 10000) $("#toolbar-area").html("Area: " + area_ft.toFixed(1) + " sqft");
     else  $("#toolbar-area").html("Area: " + (area_ft/43560).toFixed(3) + " ac");
	
}
function measureLine() {
     length_met = google.maps.geometry.spherical.computeLength(measure.line.getPath());
     $("#toolbar-length").html("Length: " + (length_met * 3.2808399).toFixed(1) + " ft");
}





/**
 * Bunch 'o code for handling WMS layers
 */
function WMSBBOXUrl(WMSurl, coord, zoom, minZoom, maxZoom) {
     if (map.getZoom() >= minZoom && map.getZoom() <= maxZoom) {
          var lULP = new google.maps.Point(coord.x*256,(coord.y+1)*256);
          var lLRP = new google.maps.Point((coord.x+1)*256,coord.y*256);
     
          var projectionMap = new MercatorProjection();
          
          var lULg = projectionMap.fromDivPixelToSphericalMercator(lULP, zoom);
          var lLRg  = projectionMap.fromDivPixelToSphericalMercator(lLRP, zoom);
              
          var lUL_Latitude = lULg.y;
          var lUL_Longitude = lULg.x;
          var lLR_Latitude = lLRg.y;
          var lLR_Longitude = lLRg.x;
          
          return WMSurl + "&bbox=" + lUL_Longitude + "," + lUL_Latitude + "," + lLR_Longitude + "," + lLR_Latitude;
     }
     else return null;
}
var MERCATOR_RANGE = 256;
function bound(value, opt_min, opt_max) {
  if (opt_min != null) value = Math.max(value, opt_min);
  if (opt_max != null) value = Math.min(value, opt_max);
  return value;
}
function degreesToRadians(deg) {
  return deg * (Math.PI / 180);
}
function radiansToDegrees(rad) {
  return rad / (Math.PI / 180);
}
function MercatorProjection() {
  this.pixelOrigin_ = new google.maps.Point(
      MERCATOR_RANGE / 2, MERCATOR_RANGE / 2);
  this.pixelsPerLonDegree_ = MERCATOR_RANGE / 360;
  this.pixelsPerLonRadian_ = MERCATOR_RANGE / (2 * Math.PI);
};
MercatorProjection.prototype.fromLatLngToPoint = function(latLng, opt_point) {
  var me = this;
 
  var point = opt_point || new google.maps.Point(0, 0);
 
  var origin = me.pixelOrigin_;
  point.x = origin.x + latLng.lng() * me.pixelsPerLonDegree_;
  // NOTE(appleton): Truncating to 0.9999 effectively limits latitude to
  // 89.189.  This is about a third of a tile past the edge of the world tile.
  var siny = bound(Math.sin(degreesToRadians(latLng.lat())), -0.9999, 0.9999);
  point.y = origin.y + 0.5 * Math.log((1 + siny) / (1 - siny)) * -me.pixelsPerLonRadian_;
  return point;
};
MercatorProjection.prototype.fromDivPixelToLatLng = function(pixel, zoom) {
  var me = this;
  
  var origin = me.pixelOrigin_;
  var scale = Math.pow(2, zoom);
  var lng = (pixel.x / scale - origin.x) / me.pixelsPerLonDegree_;
  var latRadians = (pixel.y / scale - origin.y) / -me.pixelsPerLonRadian_;
  var lat = radiansToDegrees(2 * Math.atan(Math.exp(latRadians)) - Math.PI / 2);
  return new google.maps.LatLng(lat, lng);
};
MercatorProjection.prototype.fromDivPixelToSphericalMercator = function(pixel, zoom) {
  var me = this;
  var coord = me.fromDivPixelToLatLng(pixel, zoom);
  
  var r= 6378137.0;
  var x = r* degreesToRadians(coord.lng());
  var latRad = degreesToRadians(coord.lat());
  var y = (r/2) * Math.log((1+Math.sin(latRad))/ (1-Math.sin(latRad)));
 
  return new google.maps.Point(x,y);
};