// ==UserScript==
// @name        GC Flood Alerts
// @namespace   inge.org.uk/userscripts
// @description Show flood alerts on the Geocaching.com map
// @include     https://www.geocaching.com/map/*
// @exclude     https://www.geocaching.com/map/MapPreferences.aspx*
// @version     0.1.0
// @grant       none
// ==/UserScript==

/*jslint browser: true, devel: true, bitwise: true, nomen: true, plusplus: true, indent: 2 */
/*jshint multistr: true */
/*global L, MapSettings */

(function () {
  "use strict";

  function payload() {
    if (window.L === undefined) {
      console.error("GC Flood Alerts requires Leaflet Maps to be enabled.");
      return;
    }
    L.FloodLayer = L.TileLayer.extend({
      tile2quad: function (x, y, z) {
        var i, digit, mask, quad = "";
        for (i = z; i > 0; i--) {
          digit = 0;
          mask = 1 << (i - 1);
          if ((x & mask) !== 0) { digit += 1; }
          if ((y & mask) !== 0) { digit += 2; }
          quad = quad + digit;
        }
        return quad;
      },
      getTileUrl: function (tilePoint) {
        return L.Util.template(this._url, L.extend({
          q: this.tile2quad(tilePoint.x, tilePoint.y, this._getZoomForUrl()),
          z: this._getZoomForUrl()
        }, this.options));
      }
    });

    L.FloodControl = L.Control.extend({
      _enabled: false,
      _floodIcon: "",
      getUpdate: function () {
        var s = document.createElement("script");
        s.setAttribute("type", "text/javascript");
        s.src = "https://eafloodalertsblob.blob.core.windows.net/currentfloodalerts/floodalerts.js?callback=allFloodAlerts&_=" + new Date().getTime();
        s.id = "gc-floods-jsonp";
        document.getElementsByTagName("head")[0].appendChild(s);
      },
      onAdd: function (map) {
        this._container = L.DomUtil.create("div", "gc-flood-control leaflet-control");
        this._floodLayer = new L.FloodLayer("", {alt: "Flood Alerts", name: "floods", maxZoom: 13, minZoom: 3, opacity: 0.6, overlay: true});
        this._map = map;
        this._markers = L.layerGroup();
        this._container.innerHTML = "<a title='Flood Alerts' class='gc-flood-control-lnk'></a>";
        this._container.addEventListener("click", this.toggleFloodAlerts());
        window.allFloodAlerts = (function (context) {
          var that = context;
          return function (json) {
            var i, marker, severity,
              icons = [
                L.icon({iconUrl: that._floodIcon, iconSize: [32, 32], iconAnchor: [16, 16], className: "gc-flood-icon gc-flood-sev0"}),
                L.icon({iconUrl: that._floodIcon, iconSize: [32, 32], iconAnchor: [16, 16], className: "gc-flood-icon gc-flood-sev1"}),
                L.icon({iconUrl: that._floodIcon, iconSize: [32, 32], iconAnchor: [16, 16], className: "gc-flood-icon gc-flood-sev2"}),
                L.icon({iconUrl: that._floodIcon, iconSize: [32, 32], iconAnchor: [16, 16], className: "gc-flood-icon gc-flood-sev3"}),
                L.icon({iconUrl: that._floodIcon, iconSize: [32, 32], iconAnchor: [16, 16], className: "gc-flood-icon gc-flood-sev4"})
              ],
              severities = ["Unknown severity", "Severe Flood Warning", "Flood Warning", "Flood Alert", "Warning no longer in force"];
            if (json.tileSetData && json.tileSetData.TileHandlerURL) {
              if (that._map.hasLayer(that._floodLayer)) {
                that._map.removeLayer(that._floodLayer);
              }
              that._floodLayer.setUrl(json.tileSetData.TileHandlerURL.replace(/\{zoomdepth\}/, "{z}").replace(/\{quadkey\}/, "{q}"));
              that._floodLayer.options.attribution = "<a href='http://www.environment-agency.gov.uk/homeandleisure/floods/142151.aspx'>Environment Agency flood warnings feed</a> @ " + new Date(json.timestampUTC).toLocaleTimeString();
              that._map.addLayer(that._floodLayer);
              that._floodLayer.bringToFront();
            }
            if (json.floodAlerts) {
              if (that._map.hasLayer(that._markers)) {
                that._map.removeLayer(that._markers);
                that._markers.clearLayers();
              }
              for (i = 0; i < json.floodAlerts.length; i++) {
                severity = json.floodAlerts[i].Severity;
                if (severity > 5 || severity < 1) {
                  severity = 0;
                }
                marker = L.marker(L.latLng(json.floodAlerts[i].Center.Latitude, json.floodAlerts[i].Center.Longitude), {className: "gc-flood-icon gc-flood-sev" + severity, icon: icons[severity], title: json.floodAlerts[i].AreaDescription});
                marker.bindPopup("<div class='gc-flood-popup'><a href='http://www.environment-agency.gov.uk/homeandleisure/floods/34681.aspx?area=" + json.floodAlerts[i].AreaCode + "' target='_blank'><h4>" + severities[severity] + ": " + json.floodAlerts[i].AreaDescription + "</h4></a><div>" + json.floodAlerts[i].MessageEnglish + "</div><div class='gc-flood-updated'>Updated " + json.floodAlerts[i].FormattedTimePassed + ".</div></div>");
                that._markers.addLayer(marker);
              }
              that._markers.addTo(that._map);
            }
            document.getElementsByTagName("head")[0].removeChild(document.getElementById("gc-floods-jsonp"));
          };
        }(this));
        return this._container;
      },
      onRemove: function (map) {
        window.allFloodAlerts = function () {};
        if (map.hasLayer(that._floodLayer)) {
          map.removeLayer(that._floodLayer);
        }
        if (map.hasLayer(that._markers)) {
          map.removeLayer(that._markers);
        }
        this._container.removeEventListener("click", this.toggleFloodAlerts());
        window.clearInterval(this._timer);
      },
      options: {position: "topright"},
      toggleFloodAlerts: function () {
        var that = this, en_bounds = L.latLngBounds([[49.871159, -6.379880], [55.811741, 1.768960]]);
        return function () {
          if (that._map.hasLayer(that._floodLayer)) {
            that._map.removeLayer(that._floodLayer);
          }
          if (that._map.hasLayer(that._markers)) {
            that._map.removeLayer(that._markers);
          }
          if (that._enabled) {
            that._enabled = false;
            window.clearInterval(that._timer);
            L.DomUtil.removeClass(that._container, "gc-flood-active");
          } else {
            if (en_bounds.contains(that._map.getCenter())) {
              that._enabled = true;
              that.getUpdate();
              that._timer = window.setInterval(that.getUpdate, 600000);
              L.DomUtil.addClass(that._container, "gc-flood-active");
            } else {
              alert("Environment Agency Flood Warning information is only available in England and Wales");
            }
          }
          return false;
        };
      }
    });

    function loadControl() {
      if (window.MapSettings && MapSettings.Map) {
        MapSettings.Map.addControl(new L.FloodControl());
      } else {
        window.setTimeout(loadControl, 1000);
      }
    }

    loadControl();
  }

  var floodIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAOwSURBVFiFxZdriJVVFIbfc5zMnEonRctRusCY2AUMM%2FKHhVEoBEVIUOqUJGKlU0hYjHT5YQoVYSBCJFHRxSjI0vozEGmpRMgcmsLL2JRUDNrNRtBJj%2Bfpx3oPZ%2FflONOZObbgY%2B%2F17rX3er%2B11177%2B3IA%2Bh8lP4i53ZLWSOocFAOqk73ApYCA84G3q1yHagjsB8YAOWAW0ADkgQ%2FOBoHjwLXAOKBg7FfgJmAk8GWtCSwG6oGvMvhR4CqgEThSKwJv2X5jH%2BOdwGjggVoQ%2BBMYD9wIlM5g9wkwDGgbagIrvHChP0NgFXAZsS1DQmAPcA7w6EAWJBK1CVg2VARuAyYAPRn8M2AuMB3YlhlrI47m9sES2GybdzP4UeIoXuJ2NPBbxmY%2BEYlj1RLoBa4AbrX%2BDTAZ2AG0em4b8JH7zwAdwFNuDxFF6rFqCawGziUqH8RJaCJCK%2BB640VgqrE8UaJ%2F8tjLRPJm60a%2FBH4kCs6TGXwPsNT4HwneDbwIrHS%2FLCUTnflfCSwk9jWbeNXIp%2FazaaAE9hFhW2X9CHA3cDvwcWJXAO4iku3rBH8DuIWIRrkszyFqQ%2B9ACDQD5wGHrS%2Bmsr8jgO%2BJzJ5iXMQ9UALaiVuyzni5FhSMr%2B2PQCfx9sutt9vmBuA59%2B8EnnD%2FTaDF%2FVeB2Xa0i7g166gk5HzgAuJ09Engfk%2F6wfrjttlChO9y68McgZJJjyOqpYB5nrvV%2BmrrXcBwYElfBA7YeXOCtQIvJfpu4Gbb7EzwAjCDyJOuBF8HPJvoLSbfcToCi4jwfUvt5DCxDQuyBLqIt78jM6EHWAM8wr%2Fr%2FW6iyj3PP%2Fe1lyjdLcT1fCozr5nYikMpgSXu78oYz6GS6QI%2BN%2F4zcGGCz6LyndCSmbMhs%2BZ7JLkhopSOIep%2BKl94%2FGqiiOSJD5IicJ%2FH3qdyIl4HDhKRnE7s8yRgLHAC%2BIu4sHocgYnASSWO7rXjV%2BxolPEdxh%2B23uh2ofFu4s4YYYcCXvNY%2BdJqIE7JdcBJ4ooX8GFe0lb%2FIjS6HSnpd0njJW2UNNP4WkkrFD8z8yStM36xpC2SpkpCUqukBR57WtJDknKSpkjaLKlO0iiPHxTwoNlcA%2FxCbeUYUbDq7fOFHPCOpHvMqF7SIkkzJE2W1CTpovRHSlJJ0qnk6UsvSvpOUkFSu599HpOkaZI25QAkdUhaL2mnpP2STiROhyeLVvMj2yBpkqSJbq%2BUNNdbojKBVIqSDph9sQqHUkSy7LD%2BTIanI3BW5W90vu3kmpSPOgAAAABJRU5ErkJggg%3D%3D",
    css = ".gc-flood-active { border: 2px solid #63F; }\
      .gc-flood-control { background-color: #fff; width: 36px; height: 36px; border-radius: 7px; box-shadow: 0 1px 7px rgba(0, 0, 0, 0.4); }\
      .gc-flood-control a { display: block; width: 32px; height: 32px; margin: 2px; background: #777 no-repeat 50% 50% url(" + floodIcon + "); border-radius: 6px; }\
      .gc-flood-icon { border: 1px solid #999; border-radius: 6px; }\
      .gc-flood-sev1 { background-color: #f00; }\
      .gc-flood-sev2 { background-color: #fa0; }\
      .gc-flood-sev3 { background-color: #bc0; }\
      .gc-flood-sev4 { background-color: #888; }\
      .gc-flood-popup h4 { font-weight: bold; }\
      .gc-flood-updated { font-style: italic; }",
    s = document.createElement("script"),
    c = document.createElement("style");

  s.setAttribute("type", "text/javascript");
  s.innerHTML = "(" + payload.toString() + ")(); if (window.L && L.FloodControl) { L.FloodControl.prototype._floodIcon = '" + floodIcon + "';}";
  document.getElementsByTagName("head")[0].appendChild(s);

  c.setAttribute("type", "text/css");
  c.innerHTML = css;
  document.getElementsByTagName("head")[0].appendChild(c);
}());
