// ==UserScript==
// @name        Geocache Height
// @namespace   http://inge.org.uk/userscripts
// @description Works out the height of a geocache in metres above sea level and adds it alongside the coordinates on the geocache listing.
// @include     https://www.geocaching.com/geocache/GC*
// @author      JRI
// @oujs:author JRI
// @copyright   2010-19, James Inge (http://geo.inge.org.uk/)
// @license     MIT; http://www.opensource.org/licenses/mit-license.php
// @version     1.1.3
// @grant       GM_xmlhttpRequest
// @grant       GM.xmlHttpRequest
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

    function getCoords(uriId) {
        /* Looks for coordinates in the href of an element with the given id, and returns them as at LatLng object
         * Returns undefined on failure
         */
        const target = document.getElementById(uriId);
        const pattern = /lat=([\-0-9.]+)&lng=([\-0-9.]+)/;
        let matched;

        return (target && target.href && (matched = target.href.match(pattern), matched.length === 3)
            ? {lat: matched[1], lng: matched[2]}
            : void 0
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

    const coords = getCoords("ctl00_ContentBody_uxViewLargerMap");
    const target = document.getElementById("uxLatLon");
    const scriptId = "Geocache Height v1.1.2 ";

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
        console.info(scriptId);
        xhr({
            method: "GET",
            url: `http://api.geonames.org/astergdemJSON?lat=${coords.lat}&lng=${coords.lng}&username=gme`,
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
}());