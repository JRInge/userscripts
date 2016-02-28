﻿// ==UserScript==
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
// @copyright   2011-14, James Inge (http://geo.inge.org.uk/)
// @version     1.2.2
// @icon        https://raw.githubusercontent.com/JRInge/userscripts/master/GeocacheQRCode/QRicon48.png
// @icon64      https://raw.githubusercontent.com/JRInge/userscripts/master/GeocacheQRCode/QRicon64.png
// @grant       none
// @updateURL   http://geo.inge.org.uk/userscripts/Geocache_QR_Code.meta.js
// @downloadURL https://openuserjs.org/install/JRI/Geocache_QR_Code.user.js
// ==/UserScript==

(function () {
  "use strict";
  var target = document.getElementById('dlgClipboard'),
    source = document.getElementById('ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode'),
    template = document.getElementById('cacheDetailsTemplate'),
    i = document.createElement("img");

  // Don't run on frames or iframes
  if (window.top !== window.self) { return false; }

  if (target && source) {
    i.src = "https://qrcode.kaywa.com/img.php?s=6&d=http://coord.info/" + (source.textContent || source.innerText);
    i.style.width = "186px";
    i.style.height = "186px";
    i.alt = "QR Code";
    target.appendChild(i);
    target.style.height = "205px";
    console.info("Geocache QR Code v1.2.2");
  } else {
    if (template) {
      template.textContent = template.textContent.replace(/<div class=\"links Clear\">/, '<div class="links Clear"> <a style="text-decoration: underline; padding-left: 1em; margin-right: 0.5em; background: -436px -1px url(https://www.geocaching.com/map/css/themes/images/icons-18-black.png);" onclick="$.fancybox(\'<img width=\\\\\\\'186px\\\\\\\' src=\\\\\\\'https://qrcode.kaywa.com/img.php?s=6&d=http://coord.info/{{=gc}}\\\\\\\'>\');">QR</a> ');
    } else {
      console.error("Geocache QR Code v1.2.2 didn't understand page structure.");
    }
  }
}());