// ==UserScript==
// @name        Geocache Height
// @namespace   http://inge.org.uk/userscripts
// @description Works out the height of a geocache in metres above sea level and adds it alongside the coordinates on the geocache listing.
// @include     https://www.geocaching.com/geocache/GC*
// @author      JRI
// @oujs:author JRI
// @copyright   2010-20, James Inge (http://geo.inge.org.uk/)
// @license     MIT; http://www.opensource.org/licenses/mit-license.php
// @version     1.2.0
// @grant       GM_xmlhttpRequest
// @grant       GM.xmlHttpRequest
// @grant       unsafeWindow
// @connect     api.geonames.org
// @icon        https://geo.inge.org.uk/userscripts/height48.png
// @icon64      https://geo.inge.org.uk/userscripts/height64.png
// @updateURL   https://geo.inge.org.uk/userscripts/Geocache_Height.meta.js
// @downloadURL https://openuserjs.org/install/JRI/Geocache_Height.user.js
// ==/UserScript==

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
//  v1.2.0  Fixed to wait for web page to load all variables before running.
//

/*jslint browser, devel */
/*global window, GM, GM_xmlhttpRequest */

(function () {
    "use strict";
    function formatHeight(height) {
        var heightElement = document.createElement("span");
        heightElement.id = "jriCacheHeight";
        heightElement.innerHTML = (height >= 0) ? " +" : " ";
        heightElement.innerHTML += Math.round(height) + "m";
        return heightElement;
    }

    const scriptId = "Geocache Height v1.2.0 ";
    const target = document.getElementById("uxLatLon");

    function getCoords() {
        /* Looks for coordinates in global content variables lat and lng, and returns them as a LatLng object
         * Returns undefined on failure
         */
        return (typeof unsafeWindow.lat === "number" && typeof unsafeWindow.lng === "number"
            ? {lat: unsafeWindow.lat, lng: unsafeWindow.lng}
            : undefined
        );
    }

    function isPMOnly() {
        const form = document.getElementById("aspnetForm");
        return (form && (/cache_pmo\.aspx/).test(form.action));
    }

    function parseHeight(jsonString) {
        /* Extracts height information from JSON response.  Returns a number
         * in metres on success, null for no data or undefined on failure.
         */
        try {
            const json = JSON.parse(jsonString);
            return (
                typeof json.astergdem === "number"
                ? (
                    json.astergdem > -9999
                    ? json.astergdem
                    : (console.debug(`${scriptId}received no height data for this location.`), null))
                : (console.error(`${scriptId}didn't get the data format it expected from Geonames`), null)
            );
        } catch (e) {
            console.error(`${e}: ${scriptId}didn't get valid JSON data from Geonames`);
        }
    }
  
    async function load(id, delayedFn, requiredVars = []) {
        //don't run on frames or iframes
        if (window.top !== window.self) {
            return;
        }

        if (isPMOnly()) {
            console.warn(id + "run on Premium Member cache - coordinates not available");
            return;
        }

        if (target === null) {
            console.error(id + "couldn't find where to display height on the cache page");
            return;
        }
      
        console.log(`${id}initializing: waiting for variables: ${requiredVars.join()}`);
        while(!requiredVars.every((v) => unsafeWindow.hasOwnProperty(v))) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        console.log(`${id}running`);
        delayedFn(id);
    }
  
    function main(id) {
        const coords = getCoords();

        if (!coords) {
            console.error(scriptId + "couldn't work out coordinates for cache");
            return;
        }

        const xhr = (typeof GM_xmlhttpRequest === "function")
            ? GM_xmlhttpRequest
            : ((typeof GM === "object" && typeof GM.xmlHttpRequest === "function")
                ? GM.xmlHttpRequest
                : undefined);

        if (xhr) {
            xhr({
                method: "GET",
                url: `http://api.geonames.org/astergdemJSON?lat=${coords.lat}&lng=${coords.lng}&username=gme_h`,
                onload: function (responseDetails) {
                    var height = parseHeight(responseDetails.responseText);
                    if (height != null) {
                        target.parentElement.appendChild(formatHeight(height));
                    }
                }
            });
        } else {
            console.error(scriptId + "needs a userscript manager that supports cross-site XHR");
        }
    }

    load(scriptId, main, ["lat", "lng"]);
}());