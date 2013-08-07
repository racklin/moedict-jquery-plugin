/**
 * moedict for jQuery plugin
 *
 * 將您的網站萌化
 */
let $ = jQuery
  moedictConfig =
    initialized: false
    regex: null

  window._moedictDataCallback = (data) ->
    if data.lenToRegex?
      keys = Object.keys(data.lenToRegex).sort((a, b) -> b - a)
      words = []
      keys.forEach (k) ->
        words.push data.lenToRegex[k]

      moedictConfig.regex = new RegExp(words.join(\|), \g)
      moedictConfig.initialized = true


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
   *
   * $('#content').moedict();
   */
  $.fn.moedict = (config) ->
    config = $.extend(
      class: \moedict-word
      spaced: false
      draw: false
      analyze: false
      dryrun: false
      callback: null
    , config)

    replaceContent = ~>

      @each ->
        $elem = $(this)

        if config.analyze
          text = $elem.text!
          wordUsage = {}
          text.replace moedictConfig.regex, (w) ->
            if wordUsage[w]
              wordUsage[w]++
            else
              wordUsage[w] = 1

          config.callback.call $elem, wordUsage  if config.callback
        else
          html = $elem.html!
          newHtml = html.replace(moedictConfig.regex, (w) ->
            if config.draw
              buf = "<a href='https://www.moedict.tw/?draw##{w}' class='#{config.class}'>#{w}</a>"
            else
              buf = "<a href='https://www.moedict.tw/##{w}' class='#{config.class}'>#{w}</a>"
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
        url: \https://www.moedict.tw/lenToRegex.a.json.js
        complete: ->
          cb.call! if cb
      )

      moedictConfig.initialized


    # check initialized ?
    unless moedictConfig.initialized
      initRegexp replaceContent
    else
      replaceContent!

