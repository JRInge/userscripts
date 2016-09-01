// ==UserScript==
// @name        Geocache Circles
// @namespace   inge.org.uk/userscripts
// @description Allows you to display a 0.1 mile radius circle around a cache on the Geocaching.com map page
// @include     https://www.geocaching.com/map*
// @author      JRI
// @oujs:author JRI
// @license     MIT License; http://www.opensource.org/licenses/mit-license.php
// @copyright   2016, James Inge (http://geo.inge.org.uk/)
// @version     0.0.3
// @icon        https://raw.githubusercontent.com/JRInge/userscripts/master/GeocacheCircles/images/circle48.png
// @icon64      https://raw.githubusercontent.com/JRInge/userscripts/master/GeocacheCircles/images/circle64.png
// @grant       GM_xmlhttpRequest
// @connect     www.geocaching.com
// @updateURL   http://geo.inge.org.uk/userscripts/Geocache_Circles.meta.js
// @downloadURL https://openuserjs.org/install/JRI/Geocache_Circles.user.js
// ==/UserScript==

/*jslint browser*/
/*global CustomEvent, GM_xmlhttpRequest, L,  MapSettings, window, console */

(function () {
    "use strict";
    var loggedIn = document.getElementById('uxLoginStatus_divSignedIn');
    var template = document.getElementById('cacheDetailsTemplate');
    var script = document.createElement('script');
    var circleIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA6UlEQVQ4ja2TsY3DMAxFiUvvbOTaA0SVRhBEfooyBLjyON7FC3iVNNYVlwB3MQwH5/xW/A/8FEm0I+99E4K0IUjrvW/26jaKETeILZC0KqwqrELSCrElRtx2jaWUq0iaFFaBPKvawMwdM3eqNgB5VlgVSVMp5boBPMx3ibkfx/Hr9d05d5GYe4XdRdK0aVthVWLujyI+IPVPHIgtQJ6dc5cjgHPuAuQZYgsR/UwbklZVG47MT6naAEmr976hEKRVWGXm7l0AM3cKqyFIex5wOgLRySESfeAbiU4uEtEHVvl3nH8d06vePedvYUbM9ZMTrS4AAAAASUVORK5CYII=";

    function handleCircleRequest(e) {
        /* Fetch coordinates from cache page
         * Runs in userscript context to allow XHR call
         */
        setTimeout(function () {GM_xmlhttpRequest({
            method: "GET",
            url: "https://www.geocaching.com/geocache/" + e.detail,
            onload: function (data) {
                var coords;
                var r = data.responseText;

                // Look in the page source for the JSON string that holds the cache coords and other metadata.
                var k = r.indexOf("mapLatLng = {");
                if (k === -1) {
                    console.warn("Geocache Circles found cache page, but couldn't find coordinates. Maybe not logged in?");
                    return;
                }
                coords = r.substring(k + 12, r.indexOf("}", k) + 1);

                // Send JSON coordinate string from cache page to be processed in userscript context
                document.dispatchEvent(new CustomEvent('gme_circle_response', {'detail': coords}));
            },
            onerror: function (data) {
                console.error("Geocache Circles: request for " + e.detail + " cache coordinates failed: " + data.statusText);
            }
        });}, 0);
    }

    function handleCircleResponse(e) {
        /* Parse coordinates from cache page and position marker on map
         * Runs in content page context to allow access to map object.
         */

        var circle;
        var coords;
        var ll;

        try {
            coords = JSON.parse(e.detail);
        } catch (err1) {
            // Probably badly formatted or no JSON
            console.error("Geocache Circles couldn't retrieve coordinates: " + err1);
            return;
        }

        if (typeof coords.lat !== "number" || typeof coords.lng !== "number") {
            // Missing data in JSON string
            console.error("Geocache Circles: no cache coordinates retrieved.");
            return;
        }

        if (window.MapSettings && MapSettings.Map && window.L && window.L.Circle) {
            try {
                ll = new L.LatLng(coords.lat, coords.lng);
                circle = new L.Circle(ll, 161, {weight: 2});
                circle.addTo(MapSettings.Map);
                circle.bindPopup("<p><strong>" + coords.name + "</strong><br/>" + ll.toUrl());
            } catch (err2) {
                console.error("Geocache Circles couldn't add circle to ssmap: " + err2);
            }
        } else {
            console.error("Geocache Circles couldn't find map interface.");
        }
    }

    // Don't run on frames or iframes
    if (window.top !== window.self) {
        return false;
    }

    // Check feature support
    if (!window.CustomEvent || !window.JSON || !window.setTimeout) {
        console.warn("Geocache Circles requires a browser with support for JSON, custom events and the setTimeout() function");
        return false;
    }

    if (typeof GM_xmlhttpRequest !== "function") {
        console.warn("Geocache Circles requires a browser or userscript manager with support for the GM_xmlhttpRequest function");
        return false;
    }

    if (loggedIn === null) {
        // Warn if not logged in, as coords unavailable.  Don't quit, as user might log in later in a different window, or login detection might have failed.
        console.warn("Geocache Circles may not be able to locate caches as you don't seem to be logged in.");
    }

    if (template) {
        console.info("Geocache Circles v0.0.3");

        // Attach to cache info popup template
        template.textContent = template.textContent.replace(/<div\ class=\"links\ Clear\">/, '<div class="links Clear"> <a class="jri-circle-link" style="cursor: pointer; text-decoration: underline;" onclick="document.dispatchEvent(new CustomEvent(\'gme_circle_request\', {\'detail\':\'{{=gc}}\'}));"><img src="' + circleIcon + '" alt="O" style="vertical-align:middle; margin-right: 0.25em;" width="16" height="16" />Circle</a>&nbsp; ');

        // Add event listener to content script context
        script.type = 'text/javascript';
        script.text = '"use strict";' +
                handleCircleResponse.toString() +
                'document.addEventListener("gme_circle_response", handleCircleResponse, false);';
        document.documentElement.firstChild.appendChild(script);
        document.documentElement.firstChild.removeChild(script);

        // Add event listener to userscript context
        document.addEventListener("gme_circle_request", handleCircleRequest, false);
    } else {
        // Couldn't find popup template
        console.error("Geocache Circles v0.0.3 didn't understand page structure.");
    }
}());