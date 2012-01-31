function createScript() {
  var script = document.createElement('script');
  script.src = chrome.extension.getURL('inspector.js');
  return script;
}

window.addEventListener('DOMContentLoaded', function() {
  console.log('Maps API Inspector enabled.');
  var scripts = document.getElementsByTagName('script');
  for (var i = 0, script; script = scripts[i]; i++) {
    if (/maps.google(apis)?.com/.test(script.src)) {
      script.nextSibling && script.parentNode.insertBefore(createScript(), script.nextSibling);
      break;
    }
  }
});
