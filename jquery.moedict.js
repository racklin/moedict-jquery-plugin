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
              return $elem.find("a." + config['class']).hoverIntent({
                timeout: 250,
                out: function(){},
                over: function(e){
                  var href, $moedict;
                  href = jQuery(this).attr('href');
                  if (0 === jQuery('#moedict').length) {
                    jQuery("<div id='moedict' style='float: right; height: 90%; width: 40%; margin: 0;' >\n  <iframe id='moedictFrame' name='moedictFrame' src='" + href + "' style='width: 100%; height: 100%; margin: 0; border-radius: 20px;' />\n</div>").prependTo('body');
                    $moedict = jQuery('#moedict');
                    return jQuery(window).scroll(function(){
                      return $moedict.css('margin-top', window.scrollY);
                    });
                  } else {
                    return jQuery('#moedictFrame').attr('src', href);
                  }
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
