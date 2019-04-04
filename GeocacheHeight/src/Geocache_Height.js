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
