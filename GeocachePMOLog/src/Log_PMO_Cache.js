    const scriptId = 'Log PMO Cache v0.0.2';
    const css = `div.CacheDetailNavigation {border-radius: 3px; background-color: #f0edeb;}
        .btn {margin: 1em 0;}`;

    // Takes the GCxxxxx code and constructs HTML text representing the "Log Visit" button
    const buildHTML = (code) => `<div class="CacheDetailNavigation NoPrint"><a href="/play/geocache/${code}/log" id="ctl00_ContentBody_GeoNav_logButton" class="btn btn-primary">Log a new visit</a></div>`;

    function getGCCode() {
        // Get the GCxxxxx code from the cache listing
        const codes = document.getElementsByClassName('li__gccode');
        var theCode;

        if (codes.length > 0) {
            // Remove any markup
            theCode = (codes[0].textContent || codes[0].innerText);
            // Remove whitespace padding
            return theCode.trim();
        }
    }

    function getSidebar() {
        const sbs = document.getElementsByClassName('sidebar');
        return (sbs ? sbs[0]: void 0);
    }

    function injectCSS(code) {
        const style = document.createElement('style');
        style.type = 'text/css';

        if (style.styleSheet) {
            // IE
            style.styleSheet.cssText = code;
        } else {
            // Other browsers
            style.innerHTML = code;
        }

        document.getElementsByTagName('head')[0].appendChild(style);
    }

      const pmoBanner = document.getElementsByClassName('premium-upgrade-widget');
    if (pmoBanner.length !== 1) {
        // Doesn't seem to be a PMO cache, so quit silently.
        return;
    }

    const gccode = getGCCode();
    if (!gccode) {
        console.error(`${scriptId}couldn't work out the GC code of the cache`);
        return;
    }

    const sidebar = getSidebar();
    if (!sidebar) {
        console.error(`${scriptId}couldn't find where to insert its link`);
        return;
    }

    console.info(scriptId);
    const logDiv = document.createElement('div');
    injectCSS(css);
    logDiv.id = 'pmo-log-div';
    logDiv.innerHTML = buildHTML(gccode);
    sidebar.insertBefore(logDiv, sidebar.firstChild);
