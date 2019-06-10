
//
//  Works out the height of a geocache.
//
//  v0.0.1  First attempt!
//  v0.0.2  Updated for changes to geocaching.com layout.
//  v0.0.3  Updated for more changes to geocaching.com layout.
//  v1.0.4  Updated for changes to geocaching.com cache page URLs.
//  v1.1.0  Update and re-write for changes to geocaching.com.
//  v1.1.1  Add @connect metadata to request permission to connect to Google, avoiding security pop-ups in Tampermonkey.
//  v1.1.2  Added compatibility with Greasemonkey 4
//  v1.1.3  Switched from Google Elevation API to Geonames
//  v1.1.4	Fixed for geocaching.com page change
//

/*jslint browser, devel */
/*global window, GM, GM_xmlhttpRequest */

(function () {
    "use strict";
