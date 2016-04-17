// ==UserScript==
// @name        Geocache Height
// @namespace   http://inge.org.uk/userscripts
// @description Works out the height of a geocache in metres above sea level and adds it alongside the coordinates on the geocache listing.
// @include     https://www.geocaching.com/geocache/GC*
// @author      JRI
// @oujs:author JRI
// @copyright   2010-16, James Inge (http://geo.inge.org.uk/)
// @license     MIT License; http://www.opensource.org/licenses/mit-license.php
// @version     1.1.1
// @grant       GM_xmlhttpRequest
// @connect     maps.googleapis.com
// @icon        https://raw.githubusercontent.com/JRInge/userscripts/master/GeocacheHeight/images/height48.png
// @icon64      https://raw.githubusercontent.com/JRInge/userscripts/master/GeocacheHeight/images/height64.png
// @updateURL   http://geo.inge.org.uk/userscripts/Geocache_Height.meta.js
// @downloadURL https://openuserjs.org/install/JRI/Geocache_Height.user.js
// ==/UserScript==

//
//  Works out the height of a geocache.
//
//  v0.0.1  First attempt!
//  v0.0.2  Updated for changes to geocaching.com layout.
//  v0.0.3  Updated for more changes to geocaching.com layout.
//  v1.0.4  Updated for changes to geocaching.com cache page URLS.
//  v1.1.0  Update and re-write for changes to geocaching.com.
//  v1.1.1  Add @connect metadata to request permission to connect to Google, avoiding security pop-ups in Tampermonkey.
//

/*jslint browser, devel */
/*global mapLatLng, window, GM_xmlhttpRequest */

(function () {
    "use strict";
    function formatHeight(height) {
        var heightElement = document.createElement("span");
        heightElement.id = "jriCacheHeight";
        heightElement.innerHTML = (height >= 0) ? " +" : " ";
        heightElement.innerHTML += Math.round(height) + "m";
        return heightElement;
    }
    
    function getCoords(uriId) {
        /* Looks for coordinates in a URI and returns them as a URI string fragment. Returns null on failure */
        var target = document.getElementById(uriId);
        var pattern = /lat=([\-0-9\.]+)&lng=([\-0-9\.]+)/;
        var matched;
        
        if (target === null || target.href === undefined) {
            return null;
        }

        matched = target.href.match(pattern);
        if (matched.length === 3) {
            return [matched[1], matched[2]].join();
        }
        return null;
    }

    function isPMOnly() {
        var form = document.getElementById("aspnetForm");
        if (form && /cache_pmo\.aspx/.test(form.action)) {
            return true;
        }
        return false;
    }

    function parseHeight(jsonString) {
        var json;

        try {
            json = JSON.parse(jsonString);
        } catch(e) {
            console.error(e + "Geocache Height didn't get valid JSON data from Google");
            return false;
        }

        if (typeof json.results[0].elevation !== "number") {
            console.error("Geocache Height didn't get the data format it expected from Google");
            return false;
        }

        return json.results[0].elevation;
    }

    var coords = getCoords("ctl00_ContentBody_uxViewLargerMap");
    var target = document.getElementById("uxLatLon");
    var scriptId = "Geocache Height v1.1.0 ";

    //don't run on frames or iframes
    if (window.top !== window.self) {
        return;
    }

    if (isPMOnly()) {
        console.warn(scriptId + "run on Premium Member cache - coordinates not available");
        return;
    }

    if (target === null) {
        console.error(scriptId + "couldn't find where to display height on the cache page");
        return;
    }

    if (coords === null) {
        console.error(scriptId + "couldn't work out coordinates for cache");
        return;
    }

    console.info(scriptId);

    GM_xmlhttpRequest({
        method: 'GET',
        url: "https://maps.googleapis.com/maps/api/elevation/json?sensor=false&locations=" + coords,
        onload: function(responseDetails) {
            var height = parseHeight(responseDetails.responseText);
            if (height !== false) {
                target.parentElement.appendChild(formatHeight(height));
            }
        }
    });
}());