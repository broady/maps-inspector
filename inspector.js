(function() {
  var root = google.maps._inspector = {};
  var globalId = 1;

  var propId = '__inspector_id';
  function notId(id, el) {
    return el[propId] !== id;
  }
  function setId(o) {
    return o[propId] = o[propId] || globalId++;
  }

  function hook(name) {
    var old = google.maps[name];

    google.maps[name] = function() {
      var that = Object.create(old.prototype);
      var id = setId(that);

      root[name] = root[name] || [];
      root[name].push(that);

      if (old.prototype.setMap) {
        var oldMap = null;
        google.maps.event.addListener(that, 'map_changed', function() {
          if (oldMap) {
            oldMap._overlays = oldMap._overlays.filter(notId.bind(null, id));
          }
          var newMap = that.getMap();
          if (newMap) {
            newMap._overlays = newMap._overlays || [];
            newMap._overlays.push(that);
          }
        });
      }
      old.apply(that, arguments);
      return that;
    };
  }

  function hookSetMap(name) {
    var proto = google.maps[name].prototype;
    var setMap = proto.setMap;
    var oldMap = null;

    proto.setMap = function() {
      var id = setId(this);
      if (oldMap) {
        oldMap._overlays = oldMap._overlays.filter(notId.bind(null, id));
      }
      setMap.apply(this, arguments);
      var newMap = this.getMap();
      if (newMap) {
        newMap._overlays = newMap._overlays || [];
        newMap._overlays.push(this);
      }
    };
  }

  var excludes = ['LatLng', 'LatLngBounds', 'OverlayView'];

  for (var c in google.maps) {
    if (typeof google.maps[c] != 'function') continue;
    if (~c.indexOf('_')) continue;
    if (~excludes.indexOf(c)) continue;

    hook(c);
  }

  // special
  hookSetMap('OverlayView');
})();
