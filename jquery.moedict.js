/**
 * moedict for jQuery plugin
 *
 * 將您的網站萌化
 */
(function(){
  (function($){
    var moedictConfig;
    moedictConfig = {
      initialized_a: false,
      regex_a: null,
      initialized_t: false,
      regex_t: null,
      initialized_h: false,
      regex_h: null
    };
    window._moedictDataCallback = function(data){
      var lang, lenToRegex, keys, words;
      lang = 'a';
      if (data.lenToRegex != null) {
        lang = 'a';
        lenToRegex = data.lenToRegex;
      } else if (data.lenToRegex_t != null) {
        lang = 't';
        lenToRegex = data.lenToRegex_t;
      } else if (data.lenToRegex_h != null) {
        lang = 'h';
        lenToRegex = data.lenToRegex_h;
      }
      keys = Object.keys(lenToRegex).sort(function(a, b){
        return b - a;
      });
      words = [];
      keys.forEach(function(k){
        return words.push(lenToRegex[k]);
      });
      moedictConfig["regex_" + lang] = new RegExp(words.join('|'), 'g');
      return moedictConfig["initialized_" + lang] = true;
    };
    /**
     * moedict plugin function
     *
     * @param config options Object
     *               class: 'someClass' css class for word link
     *               spaced: true - add space for words
     *               draw: true - using moedict draw mode
     *               analyze: true - return words analyzation
     *               dryrun: true - return replaced html
     *               callback: function - receive analyze or dryrun data
     *               lang:[a|t] - a 國 / t 閩南 / h 客家
     *
     * $('#content').moedict();
     */
    $.fn.moedict = function(config){
      var replaceContent, initRegexp, this$ = this;
      config = $.extend({
        lang: 'a',
        'class': 'moedict-word',
        spaced: false,
        draw: false,
        analyze: false,
        dryrun: false,
        callback: null
      }, config);
      if (['a', 't', 'h'].indexOf(config.lang) === -1) {
        config.lang = 'a';
      }
      replaceContent = function(){
        this$.each(function(){
          var $elem, regex, ref$, langPrefix, text, wordUsage, html, newHtml;
          $elem = $(this);
          regex = (ref$ = moedictConfig["regex_" + config.lang]) != null
            ? ref$
            : moedictConfig["regex_a"];
          langPrefix = (function(){
            switch (config.lang) {
            case 't':
              return '!';
            case 'h':
              return ':';
            default:
              return '';
            }
          }());
          if (config.analyze) {
            text = $elem.text();
            wordUsage = {};
            text.replace(regex, function(w){
              if (wordUsage[w]) {
                return wordUsage[w]++;
              } else {
                return wordUsage[w] = 1;
              }
            });
            if (config.callback) {
              return config.callback.call($elem, wordUsage);
            }
          } else {
            html = $elem.html();
            newHtml = html.replace(regex, function(w){
              var buf;
              if (config.draw) {
                buf = "<a href='https://www.moedict.tw/?draw#" + langPrefix + w + "' class='" + config['class'] + "'>" + w + "</a>";
              } else {
                buf = "<a href='https://www.moedict.tw/#" + langPrefix + w + "' class='" + config['class'] + "'>" + w + "</a>";
              }
              if (config.spaced) {
                buf += " ";
              }
              return buf;
            });
            if (config.dryrun) {
              if (config.callback) {
                return config.callback.call($elem, newHtml);
              }
            } else {
              $elem.html(newHtml);
              return $elem.find("a." + config['class']).moedictHoverIntent({
                timeout: 250,
                out: function(){},
                over: function(e){
                  var href;
                  href = jQuery(this).attr('href');
                  if (0 === jQuery('#moedict').length) {
                    jQuery("<div id='moedict' style='position:absolute; height: 90%; width: 40%; margin: 0; z-index:9999;' >\n  <div id='moedict-controls' style='padding-right: 20px; background-color: #F8F9F8; text-align:right;'><a href=\"#\" onclick='jQuery(\"#moedict\").css({left: (jQuery(\"#moedict\").position().left < (document.body.clientWidth/2)?(document.body.clientWidth-jQuery(\"#moedict\").width()):0)});return false;'>←→</a> | <a href=\"#\" onclick='jQuery(\"#moedict\").hide();return false;'>X</a></div>\n  <iframe id='moedictFrame' name='moedictFrame' src='" + href + "' style='width: 100%; height: 100%; margin: 0; border-radius: 20px;' />\n</div>").prependTo('body');
                  } else {
                    jQuery('#moedictFrame').attr('src', href);
                  }
                  return jQuery('#moedict').css({
                    'top': window.scrollY + jQuery('#moedict').height() / 20,
                    'left': document.body.clientWidth / 2 > e.pageX ? document.body.clientWidth - jQuery('#moedict').width() : 0
                  }).show();
                }
              });
            }
          }
        });
        return this$;
      };
      initRegexp = function(cb){
        return $.ajax({
          type: 'GET',
          dataType: 'jsonp',
          jsonp: false,
          cache: true,
          jsonCallback: '_moedictDataCallback',
          url: "https://www.moedict.tw/lenToRegex." + config.lang + ".json.js",
          complete: function(){
            if (cb) {
              return cb.call();
            }
          }
        });
      };
      if (!moedictConfig["initialized_" + config.lang]) {
        return initRegexp(replaceContent);
      } else {
        return replaceContent();
      }
    };
    $.fn.moedict.VERSION = '1.1.0';
  }.call(this, jQuery));
}).call(this);

/**
* hoverIntent is similar to jQuery's built-in "hover" function except that
* instead of firing the onMouseOver event immediately, hoverIntent checks
* to see if the user's mouse has slowed down (beneath the sensitivity
* threshold) before firing the onMouseOver event.
*
* hoverIntent r6 // 2011.02.26 // jQuery 1.5.1+
* <http://cherne.net/brian/resources/jquery.hoverIntent.html>
*
* hoverIntent is currently available for use in all personal or commercial
* projects under both MIT and GPL licenses. This means that you can choose
* the license that best suits your project, and use it accordingly.
*
* // basic usage (just like .hover) receives onMouseOver and onMouseOut functions
* $("ul li").hoverIntent( showNav , hideNav );
*
* // advanced usage receives configuration object only
* $("ul li").hoverIntent({
*	sensitivity: 7, // number = sensitivity threshold (must be 1 or higher)
*	interval: 100,   // number = milliseconds of polling interval
*	over: showNav,  // function = onMouseOver callback (required)
*	timeout: 0,   // number = milliseconds delay before onMouseOut function call
*	out: hideNav    // function = onMouseOut callback (required)
* });
*
* @param  f  onMouseOver function || An object with configuration options
* @param  g  onMouseOut function  || Nothing (use configuration options object)
* @author    Brian Cherne brian(at)cherne(dot)net
*
* embeded hoverIntent into moedict
*/
(function($) {
	$.fn.moedictHoverIntent = function(f,g) {
		// default configuration options
		var cfg = {
			sensitivity: 7,
			interval: 100,
			timeout: 0
		};
		// override configuration options with user supplied object
		cfg = $.extend(cfg, g ? { over: f, out: g } : f );

		// instantiate variables
		// cX, cY = current X and Y position of mouse, updated by mousemove event
		// pX, pY = previous X and Y position of mouse, set by mouseover and polling interval
		var cX, cY, pX, pY;

		// A private function for getting mouse position
		var track = function(ev) {
			cX = ev.pageX;
			cY = ev.pageY;
		};

		// A private function for comparing current and previous mouse position
		var compare = function(ev,ob) {
			ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
			// compare mouse positions to see if they've crossed the threshold
			if ( ( Math.abs(pX-cX) + Math.abs(pY-cY) ) < cfg.sensitivity ) {
				$(ob).unbind("mousemove",track);
				// set hoverIntent state to true (so mouseOut can be called)
				ob.hoverIntent_s = 1;
				return cfg.over.apply(ob,[ev]);
			} else {
				// set previous coordinates for next time
				pX = cX; pY = cY;
				// use self-calling timeout, guarantees intervals are spaced out properly (avoids JavaScript timer bugs)
				ob.hoverIntent_t = setTimeout( function(){compare(ev, ob);} , cfg.interval );
			}
		};

		// A private function for delaying the mouseOut function
		var delay = function(ev,ob) {
			ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
			ob.hoverIntent_s = 0;
			return cfg.out.apply(ob,[ev]);
		};

		// A private function for handling mouse 'hovering'
		var handleHover = function(e) {
			// copy objects to be passed into t (required for event object to be passed in IE)
			var ev = jQuery.extend({},e);
			var ob = this;

			// cancel hoverIntent timer if it exists
			if (ob.hoverIntent_t) { ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t); }

			// if e.type == "mouseenter"
			if (e.type == "mouseenter") {
				// set "previous" X and Y position based on initial entry point
				pX = ev.pageX; pY = ev.pageY;
				// update "current" X and Y position based on mousemove
				$(ob).bind("mousemove",track);
				// start polling interval (self-calling timeout) to compare mouse coordinates over time
				if (ob.hoverIntent_s != 1) { ob.hoverIntent_t = setTimeout( function(){compare(ev,ob);} , cfg.interval );}

			// else e.type == "mouseleave"
			} else {
				// unbind expensive mousemove event
				$(ob).unbind("mousemove",track);
				// if hoverIntent state is true, then call the mouseOut function after the specified delay
				if (ob.hoverIntent_s == 1) { ob.hoverIntent_t = setTimeout( function(){delay(ev,ob);} , cfg.timeout );}
			}
		};

		// bind the function to the two event listeners
		return this.bind('mouseenter',handleHover).bind('mouseleave',handleHover);
	};
})(jQuery);
