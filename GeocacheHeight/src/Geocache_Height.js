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
