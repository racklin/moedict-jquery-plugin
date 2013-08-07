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

  window._moedictDataCallback = (data) ->
    lang = \a
    if data.lenToRegex?
      lang = \a
      lenToRegex = data.lenToRegex
    else if data.lenToRegex_t?
      lang = \t
      lenToRegex = data.lenToRegex_t

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
   *               lang:[a|t] - a 國 / t 閩南
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

    if <[a t]>.indexOf(config.lang) == -1 then config.lang = \a

    replaceContent = ~>

      @each ->
        $elem = $(this)
        regex = moedictConfig["regex_#{config.lang}"] ? moedictConfig["regex_a"]
        lang-prefix = if config.lang == \t then '!' else ''

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
            $elem.find("a.#{config.class}").hoverIntent(
              timeout: 250
              out: ->
              over: ->
                jQuery \#moedict .remove!
                href = jQuery this .attr \href
                jQuery "<iframe id='moedict' name='moedict' src='#{href}' style='float: right; height: 90%; width: 40%; margin: 0; border-radius: 20px' />" .prependTo \body
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

