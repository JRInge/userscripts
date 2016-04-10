
//
//  Works out the height of a geocache.
//
//  v0.0.1  First attempt!
//  v0.0.2  Updated for changes to geocaching.com layout.
//  v0.0.3  Updated for more changes to geocaching.com layout.
//  v1.0.4  Updated for changes to geocaching.com cache page URLS.
//  v1.1.0  Updated for changes to geocaching.com. Re-written to use Geonames rather than Google and remove dependency on Greasemonkey API.
//

/*jslint browser, devel */
/*global mapLatLng, window, GM_xmlhttpRequest */

(function () {
    "use strict";
