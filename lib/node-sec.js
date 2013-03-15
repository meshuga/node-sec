'use strict';


function prepareOptions(options){
  options = options || {};
  options.csp = options.csp || {};
  options.hsts = options.hsts || {};
  options.csp.defaultRules = options.csp.defaultRules || [];
  options.csp.connect = options.csp.connect || ["'none'"];
  options.csp.font = options.csp.font || ["'none'"];
  options.csp.frame = options.csp.frame || ["'none'"];
  options.csp.img = options.csp.img || ["'none'"];
  options.csp.media = options.csp.media || ["'none'"];
  options.csp.script = options.csp.script || ["'none'"];
  options.csp.style = options.csp.style || ["'none'"];
  options.xframe = options.xframe || 'DENY';
  options.hsts.age = options.hsts.age || 14400;
  options.cors = options.cors || {};
  options.cors.origin = options.cors.origin || [];
  options.cors.methods = options.cors.methods || ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'];
  options.cors.headers = options.cors.headers || [];
  options.cors.maxAge = options.cors.headers || null;
  options.cors.credentials = options.cors.credentials || null;
  
  return options;
}

function configureCors(options){
  // https://developer.mozilla.org/en-US/docs/HTTP/Access_control_CORS
  return function(req, res, next){
    if(req.headers.origin || req.xhr){
      if(options.cors.origin.indexOf(req.headers.origin) == -1){
        return res.send("Possible CSRF attack", 403);
      }
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      res.header('Access-Control-Allow-Methods', options.cors.methods);
      
      if(options.cors.headers != false){
        res.header('Access-Control-Allow-Headers', options.cors.headers);
      }
      if(options.cors.maxAge != false){
        res.header('Access-Control-Allow-Max-Age', options.cors.maxAge);
      }
      if(options.cors.credentials != false){
        res.header('Access-Control-Allow-Credentials', options.cors.credentials);
      }
      
      if(req.method == 'OPTIONS') {
        return res.send(200);
      }
    }
    
    return next();
  }
}

module.exports = function(app,options){
  options = prepareOptions(options);

  app.configure(function(){ 
    
    app.use(configureCors(options));
    app.use(function(req, res, next){
      if(options.cacheControl != false) res.setHeader('Cache-Control', 'private, no-cache');
      if(options.XSSIE != false) res.setHeader('X-xss-protection', '1; mode=block');
      if(options.contentTypeIE != false) res.setHeader('X-content-type-options', 'nosniff');
      if(options.xFrame != false) res.setHeader('X-frame-options', options.xframe);

      // deal with XSS attacks
      var policy = ['connect-src ' + options.csp.connect.join(' '),
        'font-src ' + options.csp.font.join(' '),
        'frame-src ' + options.csp.frame.join(' '),
        'img-src ' + options.csp.img.join(' '),
        'media-src ' + options.csp.media.join(' '),
        'script-src ' + options.csp.script.join(' '),
        'style-src ' + options.csp.style.join(' ')
      ]
      
      if(options.csp.defaultRules != false){
        policy.push('default-src ' + options.csp.defaultRules.join(' '));
      }

      if(options.csp.report){
        policy.push('report-uri ' + options.csp.report);
      }

      var headers = [
        'Content-security-policy',
        'X-WebKit-CSP',
        'X-Content-Security-Policy'
      ]
      if(options.csp.reportOnly){
        var i = 0;
        for(; i<headers.length; i++){
          headers[i] += '-Report-Only';
        }
      }
      var i = 0;
      for(; i<headers.length; i++){
        res.setHeader(headers[i], policy.join('; '));
      }

      if(req.secure && options.hsts.on != false){
        var stsValue = options.hsts.age;
        if (options.hsts.subDomains) stsValue += '; includeSubdomains';
        res.setHeader('Strict-Transport-Security', stsValue);
      }
      return next();
    });
  });
}
