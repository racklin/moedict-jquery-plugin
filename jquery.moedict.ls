/**
 * moedict for jQuery plugin
 *
 * 將您的網站萌化
 */
let $ = jQuery
  moedictConfig =
    initialized_a: false
    regex_a: null
    initialized_t: false
    regex_t: null
    initialized_h: false
    regex_h: null

  window._moedictDataCallback = (data) ->
    lang = \a
    if data.lenToRegex?
      lang = \a
      lenToRegex = data.lenToRegex
    else if data.lenToRegex_t?
      lang = \t
      lenToRegex = data.lenToRegex_t
    else if data.lenToRegex_h?
      lang = \h
      lenToRegex = data.lenToRegex_h

    keys = Object.keys(lenToRegex).sort((a, b) -> b - a)
    words = []
    keys.forEach (k) ->
      words.push lenToRegex[k]

    moedictConfig["regex_#{lang}"] = new RegExp(words.join(\|), \g)
    moedictConfig["initialized_#{lang}"] = true


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
  $.fn.moedict = (config) ->
    config = $.extend(
      lang: \a
      class: \moedict-word
      spaced: false
      draw: false
      analyze: false
      dryrun: false
      callback: null
    , config)

    if <[a t h]>.indexOf(config.lang) == -1 then config.lang = \a

    replaceContent = ~>

      @each ->
        $elem = $(this)
        regex = moedictConfig["regex_#{config.lang}"] ? moedictConfig["regex_a"]
        lang-prefix = switch config.lang
          | \t => \!
          | \h => \:
          | _ => ''

        if config.analyze
          text = $elem.text!
          wordUsage = {}
          text.replace regex, (w) ->
            if wordUsage[w]
              wordUsage[w]++
            else
              wordUsage[w] = 1

          config.callback.call $elem, wordUsage  if config.callback
        else
          html = $elem.html!
          newHtml = html.replace(regex, (w) ->
            if config.draw
              buf = "<a href='https://www.moedict.tw/?draw##{lang-prefix}#{w}' class='#{config.class}'>#{w}</a>"
            else
              buf = "<a href='https://www.moedict.tw/##{lang-prefix}#{w}' class='#{config.class}'>#{w}</a>"
            buf += " "  if config.spaced
            buf
          )
          if config.dryrun
            config.callback.call $elem, newHtml  if config.callback
          else
            $elem.html newHtml
            $elem.find("a.#{config.class}").moedictHoverIntent(
              timeout: 250
              out: ->
              over: (e) ->
                href = jQuery this .attr \href
                if 0 == jQuery \#moedict .length
                  jQuery """
                    <div id='moedict' style='position:absolute; height: 90%; width: 40%; margin: 0; z-index:9999;' >
                      <div id='moedict-controls' style='padding-right: 20px; background-color: \#F8F9F8; text-align:right;'><a href="\#" onclick='jQuery("\#moedict").css({left: (jQuery("\#moedict").position().left < (document.body.clientWidth/2)?(document.body.clientWidth-jQuery("\#moedict").width()):0)});return false;'>←→</a> | <a href="\#" onclick='jQuery("\#moedict").hide();return false;'>X</a></div>
                      <iframe id='moedictFrame' name='moedictFrame' src='#{href}' style='width: 100%; height: 100%; margin: 0; border-radius: 20px;' />
                    </div>
                         """ .prependTo \body

                else
                  jQuery \#moedictFrame .attr \src href
                jQuery \#moedict .css( do
                  \top : window.scrollY + jQuery \#moedict .height!/20
                  \left : if (document.body.clientWidth/2) > e.pageX then document.body.clientWidth - jQuery('#moedict').width! else 0
                ).show!

            )
      this

    initRegexp = (cb) ->
      $.ajax (
        type: \GET
        dataType: \jsonp
        jsonp: false
        cache: true
        jsonCallback: \_moedictDataCallback
        url: "https://www.moedict.tw/lenToRegex.#{config.lang}.json.js"
        complete: ->
          cb.call! if cb
      )


    # check initialized ?
    unless moedictConfig["initialized_#{config.lang}"]
      initRegexp replaceContent
    else
      replaceContent!

  $.fn.moedict.VERSION = \1.1.0
