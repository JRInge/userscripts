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

    function formatHeight(height) {
        var heightElement = document.createElement("span");
        heightElement.id = "jriCacheHeight";
        heightElement.innerHTML = (height >= 0) ? " +" : " ";
        heightElement.innerHTML += Math.round(height) + "m";
        return heightElement;
    }

    function parseHeight(jsonString) {
        var json;

        try {
            json = JSON.parse(jsonString);
        } catch(e) {
            console.error(e + "Geocache Height didn't get valid JSON data from Geonames");
            return false;
        }

        if (typeof json.results[0].elevation !== "number") {
            console.error("Geocache Height didn't get the data format it expected from Geonames");
            return false;
        }

        return json.results[0].elevation;
    }

    var coords = getCoords("ctl00_ContentBody_uxViewLargerMap");
    var target = document.getElementById("uxLatLon");

    //don't run on frames or iframes
    if (window.top !== window.self) {
        return;
    }

    if (target === null) {
        console.error("Geocache Height couldn't find where to display height on the cache page");
        return;
    }

    if (coords === null) {
        console.error("Geocache Height couldn't work out coordinates for cache");
        return;
    }

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
