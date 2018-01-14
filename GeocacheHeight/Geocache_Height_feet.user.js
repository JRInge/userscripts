// ==UserScript==
// @name        Geocache Height (feet)
// @namespace   http://inge.org.uk/userscripts
// @description Works out the height of a geocache in feet above sea level and adds it alongside the coordinates on the geocache listing.
// @include     https://www.geocaching.com/geocache/GC*
// @author      JRI
// @oujs:author JRI
// @copyright   2010-18, James Inge (http://geo.inge.org.uk/)
// @license     MIT; http://www.opensource.org/licenses/mit-license.php
// @version     1.1.2
// @grant       GM_xmlhttpRequest
// @grant       GM.xmlHttpRequest
// @connect     maps.googleapis.com
// @icon        https://geo.inge.org.uk/userscripts/height48.png
// @icon64      https://geo.inge.org.uk/userscripts/height64.png
// @updateURL   https://geo.inge.org.uk/userscripts/Geocache_Height_feet.meta.js
// @downloadURL https://openuserjs.org/install/JRI/Geocache_Height_feet.user.js
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
//

/*jslint browser, devel */
/*global mapLatLng, window, GM, GM_xmlhttpRequest */

(function () {
    "use strict";
    function formatHeight(height) {
        var heightElement = document.createElement("span");
        heightElement.id = "jriCacheHeightFt";
        heightElement.innerHTML = (height >= 0) ? " +" : " ";
        heightElement.innerHTML += Math.round(height * 3.28084) + "ft";
        return heightElement;
    }

    function getCoords(uriId) {
        /* Looks for coordinates in a URI and returns them as a URI string fragment. Returns null on failure */
        const target = document.getElementById(uriId);
        const pattern = /lat=([\-0-9.]+)&lng=([\-0-9.]+)/;

        if (target === null || target.href === undefined) {
            return null;
        }

        const matched = target.href.match(pattern);
        if (matched.length === 3) {
            return `${matched[1]},${matched[2]}`;
        }
        return null;
    }

    function isPMOnly() {
        const form = document.getElementById("aspnetForm");
        return (form && (/cache_pmo\.aspx/).test(form.action));
    }

    function parseHeight(jsonString) {
        try {
            const json = JSON.parse(jsonString);
            if (typeof json.results[0].elevation !== "number") {
                console.error("Geocache Height didn't get the data format it expected from Google");
                return false;
            }
            return json.results[0].elevation;
        } catch (e) {
            console.error(e + ": Geocache Height didn't get valid JSON data from Google");
            return false;
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

    if (coords === null) {
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
            url: "https://maps.googleapis.com/maps/api/elevation/json?sensor=false&locations=" + coords,
            onload: function (responseDetails) {
                var height = parseHeight(responseDetails.responseText);
                if (height !== false) {
                    target.parentElement.appendChild(formatHeight(height));
                }
            }
        });
    } else {
        console.error(scriptId + "needs a userscript manager that supports cross-site XHR");
    }
}());