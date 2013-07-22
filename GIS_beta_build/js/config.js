/**
 * config.js
 * This file contains global settings in a generic (not library-dependent) way.
 * Map extents, map object, default extents and zoom levels, map layers, etc.
 * @license     MIT
 */


/**
 * Globals
 * General global variables should go here unless they're part of a module.  
 */
var wsbase = "http://maps.co.mecklenburg.nc.us/rest/";   // Base URL for REST web services
var map = null;   
var selectedAddress = null;
var gpsWatch;


// Default map extents
var defaultMapCenter = [-33.048, -71.430];
var defaultMapExtent = [-33.090, -71.481, -33016, -71.317];
var defaultMapZoom = 14;
var mapMinZoom = 13;
var mapMaxZoom = 30;

	
/**
 * Map Layers
 * Only required for OpenLayers: minScale, maxScale
 * Only required for Google Maps: getTileURL
 */
var mapLayers = [
	{
		id: "osm",
		name: "Calles",
		alt: "Open Street Map (OSM)",
		attribution: "Provided by Tiles@Home",
		wmsurl: "http://tah.openstreetmap.org/Tiles/tile/${z}/${x}/${y}.png",
		layers: '',
		format: 'image/png',
		transparent: false,
		opacity: 1,
		maxZoom: 18,
		minZoom: 0,
		isBaseLayer: true,
		isVisible: false,
		getTileUrl: function(ll, z) {
			var X = ll.x % (1 << z);  // wrap
			return "http://tile.openstreetmap.org/" + z + "/" + X + "/" + ll.y + ".png";
		}
	}/*,{
		id: "nexrad",
		name: "Test1",
		alt: "Nexrad Weather Radar",
		attribution: "Provided by Iowa State University",
		wmsurl: "http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi",
		layers: 'nexrad-n0r-900913',
		format: 'image/png',
		transparent: true,
		opacity: 0.5,
		maxZoom: 18,
		minZoom: 0,
		isBaseLayer: false,
		isVisible: false,
		getTileUrl: function(coord, zoom) {            
			return WMSBBOXUrl("http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi?REQUEST=GetMap&SERVICE=WMS&VERSION=1.1.1&BGCOLOR=0xFFFFFF&TRANSPARENT=TRUE&SRS=EPSG:900913&WIDTH=256&HEIGHT=256&FORMAT=image/png&LAYERS=nexrad-n0r", coord, zoom, 9, 18); 
		}
		
	},
	{
		id: "valparaiso_poi",
		name: "	valparaiso_poi",
		alt: "Nexrad Weather Radar",
		attribution: "Provided by Iowa State University",
		wmsurl: "http://localhost:8080/geoserver/wms",
		layers: 'valparaiso_poi',
		format: 'image/png',
		transparent: true,
		opacity: 0.5,
		maxZoom: 18,
		minZoom: 0,
		isBaseLayer: false,
		isVisible: false,
		getTileUrl: function(coord, zoom) {
			var layerParams = [
			    "FORMAT=image/png8",
			    "LAYERS=Quilpue:valparaiso_poi",
			    "STYLES="
			];
			return WMSBBOXUrl("http://localhost:8080/geoserver/wms?" + meckWMSParams.concat(layerParams).join("&"), coord, zoom, 15, 18); 
	     }
		
	},
	{
		id: "environment",
		name: "Test 2",
		alt: "Environmental Layers",
		attribution: "Provided by Mecklenburg County GIS",
		wmsurl: "http://maps.co.mecklenburg.nc.us/geoserver/wms",
		layers: 'postgis:view_regulated_floodplains,postgis:landfills,postgis:mpl_sites,postgis:water_quality_buffers,postgis:proposed_thoroughfares,postgis:soil,postgis:air_pollution_facilities',
		format: 'image/gif',
		transparent: true,
		opacity: 0.5,
		maxZoom: 18,
		minZoom: 15,
          minScale: 8000,
          maxScale: 100,
		isBaseLayer: false,
		isVisible: false,
		getTileUrl: function(coord, zoom) {
			var layerParams = [
			    "FORMAT=image/png8",
			    "LAYERS=postgis:view_regulated_floodplains,postgis:landfills,postgis:mpl_sites,postgis:water_quality_buffers,postgis:proposed_thoroughfares,postgis:soil,postgis:air_pollution_facilities",
			    "STYLES="
			];
			return WMSBBOXUrl("http://maps.co.mecklenburg.nc.us/geoserver/wms?" + meckWMSParams.concat(layerParams).join("&"), coord, zoom, 15, 18); 
	     }
	}*/,{
          id: "Test 3",
		name: "",
		alt: "Impervious Surface",
		attribution: "Mecklenburg County GIS",
		wmsurl: "http://mapserver.mecklenburgcountync.gov/arcgis/services/impervious_surface_sm/MapServer/WMSServer",
		layers: '0,1',
		format: 'image/png',
		transparent: true,
		opacity: 0.5,
		maxZoom: 18,
		minZoom: 17,
          minScale: 4000,
          maxScale: 100,
		isBaseLayer: false,
		isVisible: false,
          getTileUrl: function(coord, zoom) {
              return WMSBBOXUrl("http://mapserver.mecklenburgcountync.gov/arcgis/services/impervious_surface_sm/MapServer/WMSServer?REQUEST=GetMap&SERVICE=WMS&VERSION=1.1.1&BGCOLOR=0xFFFFFF&TRANSPARENT=TRUE&STYLES=&SRS=EPSG:102113&WIDTH=256&HEIGHT=256&FORMAT=image/png&LAYERS=0,1", coord, zoom, 17, 19); 
          }
	}
];