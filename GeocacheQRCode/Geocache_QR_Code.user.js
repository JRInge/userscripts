// ==UserScript==
// @name        Geocache QR Code
// @namespace   inge.org.uk/userscripts
// @description Allows you to display a QR code linking to a geocache or trackable listing on geocaching.com
// @include     http://www.geocaching.com/geocache/GC*
// @include     https://www.geocaching.com/geocache/GC*
// @include     https://www.geocaching.com/map*
// @include     http://www.geocaching.com/track/details.aspx*
// @include     https://www.geocaching.com/track/details.aspx*
// @oujs:author JRI
// @license     MIT License; http://www.opensource.org/licenses/mit-license.php
// @copyright   2011-19, James Inge (http://geo.inge.org.uk/)
// @version     1.2.3
// @icon        https://raw.githubusercontent.com/JRInge/userscripts/master/GeocacheQRCode/QRicon48.png
// @icon64      https://raw.githubusercontent.com/JRInge/userscripts/master/GeocacheQRCode/QRicon64.png
// @grant       none
// @updateURL   http://geo.inge.org.uk/userscripts/Geocache_QR_Code.meta.js
// @downloadURL https://openuserjs.org/install/JRI/Geocache_QR_Code.user.js
// ==/UserScript==

/*global window*/

(function () {
    "use strict";
    const scriptId = "Geocache QR Code v1.2.3";
    const targetId = "qtip-0";
    const source = document.getElementById('ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode');
    const template = document.getElementById('cacheDetailsTemplate');

    // Don't run on frames or iframes
    if (window.top !== window.self) {
        return false;
    }
    
    const addQR = () => {
        const i = document.createElement("img");
        const target = document.getElementById(targetId);
        if (target) {
            i.src = "https://qrcode.kaywa.com/img.php?s=6&d=https://coord.info/" + (source.textContent || source.innerText);
            i.style.width = "186px";
            i.style.height = "186px";
            i.alt = "QR Code";
            target.appendChild(i);
            target.style.height = "205px";
            target.style.textAlign = "center";
        }
    };

    const observer = new MutationObserver((mutationsList, observer) => {
        for(const mutation of mutationsList) {
            for (const node of mutation.addedNodes) {
                if (node.id === targetId) {
                    observer.disconnect();
                    addQR();
                    return;
                }
            }
        }
    });

    if (source) {
        observer.observe(document.body, {childList: true, attributes: false, characterData: false});
    } else {
        if (template) {
            template.textContent = template.textContent.replace(/<div\ class=\"links\ Clear\">/, '<div class="links Clear"> <a style="text-decoration: underline; padding-left: 1em; margin-right: 0.5em; background: -436px -1px url(https://www.geocaching.com/map/css/themes/images/icons-18-black.png);" onclick="$.fancybox(\'<img width=\\\\\\\'186px\\\\\\\' src=\\\\\\\'https://qrcode.kaywa.com/img.php?s=6&d=https://coord.info/{{=gc}}\\\\\\\'>\');">QR</a> ');
        } else {
            console.error(`${scriptId}didn't understand page structure.`);
            return;
        }
    }
    console.info(scriptId);
}());