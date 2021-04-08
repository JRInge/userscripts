// ==UserScript==
// @name     Runkeeper Fastest 5k
// @author      JRI
// @oujs:author JRI
// @namespace   inge.org.uk/userscripts
// @description Shows the fastest time you ran 5k (or other set distances) within a longer Runkeeper activity.
// @version     0.0.2
// @license     MIT; http://www.opensource.org/licenses/mit-license.php
// @copyright   2021, James Inge (http://geo.inge.org.uk/)
// @include     https://runkeeper.com/user/*
// @run-at      document-idle
// @grant       unsafeWindow
// @icon        https://geo.inge.org.uk/userscripts/fastest5k48.png
// @icon64      https://geo.inge.org.uk/userscripts/fastest5k64.png
// @updateURL   https://geo.inge.org.uk/userscripts/Runkeeper_Fastest_5k.meta.js
// @downloadURL https://openuserjs.org/install/JRI/Runkeeper_Fastest_5k.user.js
// ==/UserScript==

/* jshint esversion: 8 */
/* globals unsafeWindow, mapController */

async function main() {
  const distances = [
    {title: "1km", dist: 1000},
    {title: "5km", dist: 5000},
    {title: "10km", dist: 10000},
    {title: "10mi", dist: 16093.4},
    {title: "20km", dist: 20000},
    {title: "½ mar", dist: 21097.5},
    {title: "mar", dist: 42195}
  ];

  function processData() {
    const msToMins = (ms) => (
      (ms >= 3600000) ?
      Math.floor(ms/3600000) + ":" + String(Math.floor(ms % 3600000  / 60000)).padStart(2,"0") + ":" + String(Math.floor((ms % 60000)/1000)).padStart(2,"0") :
      Math.floor(ms / 60000) + ":" + String(Math.floor((ms % 60000)/1000)).padStart(2,"0")
    );

    function present(title, times, even) {
      const miles = (mapController.model.distanceUnits === "mi"); // Default to km.
      const units = (miles ? "mi" : "km");
      const metresPerUnit = (miles ? 1609.34 : 1000);
      const pace = msToMins(times.pace * metresPerUnit);
      const startPoint = Number(times.start_dist / metresPerUnit).toFixed(1);
      return `<div class="row-fluid ${even?"even":"odd"} distanceSplit">
        <div class="span4 number micro-text">${title}</div>
        <div class="span4 pace micro-text" title="Pace: ${pace}/${units}">${msToMins(times.fastest)}</div>
        <div class="span4 climb micro-text" title="${startPoint}${units}">${msToMins(times.start)}</div>
      </div>`;
    }

    function fastest(distance, points) {
      // Calculate fastest time to cover distance within the given points.
      // Times in ms, distances in m.

      function checkTime(pt, i, pts) {
        const d = pt.dist - pts[0].dist;
        if (d > distance) {
          const t = pt.time - pts[0].time;
          if (t < min_time) {
            min_time = t;
            start_time = pts[0].time;
            start_dist = pts[0].dist;
          }
          return true;
        } else {
          return false;
        }
      }

      const max_dist = points[points.length - 1].dist;
      let min_time = points[points.length - 1].time;
      let start_time = 0;
      let start_dist = 0;

      points.every(function(pt, i, pts) {
        if (max_dist - pt.dist < distance) {
          return false;
        }
        pts.slice(i).some(checkTime);
        return true;
      });
      return {
        fastest: min_time,
        start: start_time,
        pace: min_time / distance,
        "start_dist": start_dist
      };
    }

    const points = mapController.model.initialPoints;
    const points_cum = points.reduce((acc, val, i) => ((i === 0) ?
                                                       [{dist: 0, time: 0}] :
                                                       [...acc, {
                                                         dist: val.deltaDistance + acc[i - 1].dist,
                                                         time: val.deltaTime + acc[i -1].time
                                                       }]), []);
    const total = points_cum[points_cum.length - 1].dist;
    const html = distances.filter((x) => x.dist <= total)
      .map((x, i) => present(x.title, fastest(x.dist, points_cum), (i % 2 === 0)))
      .join("");

    const divider = document.createElement("div");
    divider.className = "colDivider";
    target.after(divider);
    const fastestBox = document.createElement("div");
    fastestBox.innerHTML = `<div class="mainColumnPadding clearfix"><h4>Fastest distances</h4></div>
      <div id="fastestDistances">
        <div class="row-fluid header">
          <div class="span4 labelHeader">distance</div>
          <div class="span4 labelHeader">time</div>
          <div class="span4 labelHeader">start</div>
        </div>
        ${html}
       </div>`;
    divider.after(fastestBox);
  }

  const target = document.getElementById("splitsBox");

  if (target === null) {
    console.warn("Couldn't add FastestTimes block");
    return;
  }

  const waitPoints = (resolve) => setTimeout(resolve, 500);
  while(!((mapController.model.initialPoints !== null) && (mapController.model.initialPoints.length > 0))) {
    await new Promise(waitPoints);
  }
  processData();
}

async function load(delayedFn, requiredVars = [], params = []) {
    // Wait for content variables to exist before running delayedFn with given params
    function varExists(v = "", root = unsafeWindow) {
      function check(vars, newroot) {
        if (vars.length === 0) {
          return true;
        }
        if (newroot.hasOwnProperty(vars[0])) {
          return check(vars.slice(1), newroot[vars[0]]);
        } else {
          return false;
        }
      }
      if (root === undefined) {
        return false;
      } else {
        return check(v.split("."), root);
      }
    }
    const waitPromise = (resolve) => setTimeout(resolve, 500);
    const varExistsTrue = (x) => varExists(x);
    while(!requiredVars.every(varExistsTrue)) {
        await new Promise(waitPromise);
    }
    delayedFn(params);
}

const css = `.activity #fastestDistances .row-fluid.even {
    background-color: #e9e9e9;
  }
  .activity #fastestDistances .row-fluid.header {
    border-bottom:1px solid #e9e9e9;
  }
  .activity #fastestDistances .row-fluid .span4 {
    color:#444;
    height:30px;
    line-height:30px;
    padding-left:25px;
  }
  .activity #fastestDistances .row-fluid.header .span4 {
    color:#888;
    text-transform: uppercase;
    height:auto;
    font-size:11px;
  }`;


function insertCSS(css) {
  if (typeof css !== "string") {
    console.warn("insertCSS not called with string: " + typeof css);
    return;
  }
  const styleLink = document.createElement("link");
  styleLink.setAttribute("rel", "stylesheet");
  styleLink.setAttribute("href", "data:text/css;charset=UTF-8," + encodeURIComponent(css));
  document.head.appendChild(styleLink);
}

function inject(fn) {
  const script = document.createElement("script");
  script.text = "(" + fn.toString() + ")();";
  document.body.appendChild(script);
}

if (document.location.pathname.includes("/activity/")) {
  load(inject, ["mapController.model.initialPoints"], [main]);
  insertCSS(css);
}
