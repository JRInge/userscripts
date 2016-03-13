    var pmoBanner = document.getElementsByClassName('pmo-banner');
    var gccode;
    var logDiv;
    var sidebar;
    var css = '.CacheDetailNavigation .Button{ display:block; margin-bottom: 1em; text-align:left; padding:.4em 1em; border:1px solid #667343; border-radius:3px; background-color:#677547; background-image: -moz-linear-gradient(top, #778556, #4e5d30); background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#778556), to(#4e5d30)); background-image: -webkit-linear-gradient(top, #778556, #4e5d30); background-image: -o-linear-gradient(top, #778556, #4e5d30); background-image: linear-gradient(to bottom, #778556, #4e5d30); background-repeat:repeat-x; color:#fff !important; font-weight:bold; text-decoration:none; cursor:pointer; } .CacheDetailNavigation .Button:hover{ background-color: #fcaf3d; background: -moz-linear-gradient(top,  rgba(252,175,61,1) 0%, rgba(250,142,30,1) 100%); background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(252,175,61,1)), color-stop(100%,rgba(250,142,30,1))); background: -webkit-linear-gradient(top,  rgba(252,175,61,1) 0%,rgba(250,142,30,1) 100%); background: -o-linear-gradient(top,  rgba(252,175,61,1) 0%,rgba(250,142,30,1) 100%); background: -ms-linear-gradient(top,  rgba(252,175,61,1) 0%,rgba(250,142,30,1) 100%); background: linear-gradient(to bottom,  rgba(252,175,61,1) 0%,rgba(250,142,30,1) 100%); background-position:0 100%; border-color:#fd9201; } .Button.LogVisit:before{ content:url(/images/icons/16/write_log_white.png); vertical-align:middle; margin-right:8px; }';

    function buildHTML(code) {
        // Takes the GCxxxxx code and constructs HTML text representing the "Log Visit" button
        return ('<div class="CacheDetailNavigation NoPrint"><a href="/seek/log.aspx?WP=' +
                code +
                '" id="ctl00_ContentBody_GeoNav_logButton" class="Button LogVisit">Log your visit</a></div>');
    }

    function getGCCode() {
        // Get the GCxxxxx code from the cache listing
        var codes = document.getElementsByClassName('li__gccode');
        var theCode;

        if (codes.length > 0) {
            // Remove any markup
            theCode = (codes[0].textContent || codes[0].innerText);
            // Remove whitespace padding
            return theCode.trim();
        }
    }

    function getSidebar() {
        var sbs = document.getElementsByClassName('sidebar');
        if (sbs.length > 0) {
            return sbs[0];
        }
    }

    function injectCSS(code) {
        var style = document.createElement('style');
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

    if (pmoBanner.length !== 1) {
        // Doesn't seem to be a PMO cache, so quit silently.
        return;
    }

    gccode = getGCCode();
    if (!gccode) {
        console.error("Log PMO Cache v0.0.1 couldn't work out the GC code of the cache");
        return;
    }

    sidebar = getSidebar();
    if (!sidebar) {
        console.error("Log PMO Cache v0.0.1 couldn't find where to insert its link");
        return;
    }

    console.info('Log PMO Cache v0.0.1');
    injectCSS(css);
    logDiv = document.createElement('div');
    logDiv.id = 'pmo-log-div';
    logDiv.innerHTML = buildHTML(gccode);
    sidebar.insertBefore(logDiv, sidebar.firstChild);
