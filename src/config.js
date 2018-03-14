function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
  
  if (!getParameterByName('room')) {
    window.location.search = '?room=' + (new Date()).getTime();
  }
  
  const config = {
    appKey: '0ca7d627-24ad-4c67-9afc-6d379567c6ac',
    defaultRoom: getParameterByName('room'),
    enableDataChannel: true, // Disable this and sendBlobData(), sendP2PMessage() and sendURLData() will NOT work!
    enableIceTrickle: true,
    audioFallback: true,
    forceSSL: true,
    SRCIPT_CDN: '//cdn.temasys.io/skylink/skylinkjs/0.6.x/skylink.complete.min.js'
  };

  export default config;