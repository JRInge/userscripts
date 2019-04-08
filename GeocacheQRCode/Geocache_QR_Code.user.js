// ==UserScript==
// @name        Geocache QR Code
// @namespace   inge.org.uk/userscripts
// @description Allows you to display a QR code linking to a geocache or trackable listing on geocaching.com
// @include     https://www.geocaching.com/geocache/GC*
// @include     https://www.geocaching.com/map*
// @include     https://www.geocaching.com/track/details.aspx*
// @oujs:author JRI
// @license     MIT; http://www.opensource.org/licenses/mit-license.php
// @copyright   2011-19, James Inge (http://geo.inge.org.uk/)
// @version     1.2.3
// @icon        https://raw.githubusercontent.com/JRInge/userscripts/master/GeocacheQRCode/QRicon48.png
// @icon64      https://raw.githubusercontent.com/JRInge/userscripts/master/GeocacheQRCode/QRicon64.png
// @grant       none
// @updateURL   https://geo.inge.org.uk/userscripts/Geocache_QR_Code.meta.js
// @downloadURL https://openuserjs.org/install/JRI/Geocache_QR_Code.user.js
// ==/UserScript==

/*global window*/

(function () {
    "use strict";
    const scriptId = "Geocache QR Code v1.2.3 ";
    const targetId = "qtip-0";
    const source = document.getElementById('ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode');
    const template = document.getElementById('cacheDetailsTemplate');
    const icon16 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8%2F9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAp5JREFUOE9tU0tLalEU%2Fo5FL4gyyUn5KFIoIYzEcYgD59JA8AcYSKPSBuGjCG0iNQiCQhCCQIgCDQcVhGCkvWgQRIU5iRoUgviM4NyzFtmNy%2F1gc9Y%2Be%2B1vr7W%2BtQS%2F3y%2FiFwKBAHK5HJ6fn9HX14fW1lZ8fn6iXC7DbrcjGAyio6MDoiiis7MTMtrQJVq1Wo1JXl5ecHR0BIPBgJubGyYaHx%2Fns2q1Cq%2FXi4WFBfaXCYLAB0TQtB8fHzE9PY2rqyu0tbXh%2BvoaXV1dfNb0kSJnW1av1%2FkyfWkR5ubmIJfLkc%2Fn4Xa7mSAWi%2FEZ%2BdDrP%2F5SLv%2FFzs6OKBGwHY1GxeXlZbZ%2FI5vNijKm%2FQd7e3tQKpXY39%2FnNCwWCxeO8PHxwV%2BC2WyGQExLS0tcqKGhIYyOjjJBe3s7Zmdn4XK5sLm5icvLS2i1WkQiEa4LgVLhCHw%2BHx8%2BPDxgYGAAMzMzuLi4YCedToenpydMTk5ia2sLX19f6OnpQXd3N97f39GiUqkC0sLExATOzs5Yc6p4f38%2FDg8PYTQaUSgUMDY2xlEUi0U4nU6W9eDgAEI6nRZPTk4wPDzMzPf39yiVSlhZWYFUPJhMJtzd3cHhcCCZTEKtVqNSqeD19RV6vR7C7u6uSJcIJCeBcqOiLS4u4vT0FFarlf8TQqEQd%2Bf8%2FDzvuYhs%2FUImk%2BEu7O3t%2Ff7zl5xAthQ5K9QidVMglUqB0qAQbTYbh%2Fn29vZDQA11e3vLr1KdpqamoNFouMA8C6urqwiHwz9ax%2BNxJiOcn5%2BzxATqUAKplUgksLGxAVkzAwqraVOzUAtvb29zM9GFkZERVmJwcBDHx8csM9VIWFtbE2mqaDCot2lI1tfX0Wg04PF4mEyhUDCx5MszQg%2BRUhqNBn8AvEtuCmtVR6cAAAAASUVORK5CYII%3D";

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
            template.textContent = template.textContent.replace(/<div\ class=\"links\ Clear\">/, `<div class="links Clear"> <a class="lnk" id="jri-qr-link" onclick="$.fancybox(\'<img width=\\\\\\\'186px\\\\\\\' src=\\\\\\\'https://qrcode.kaywa.com/img.php?s=6&d=https://coord.info/{{=gc}}\\\\\\\'>\');"><img src="${icon16}" /><span>QR</span></a>`);
        } else {
            console.error(`${scriptId}didn't understand page structure.`);
            return;
        }
    }
    console.info(scriptId);
}());