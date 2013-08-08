module.exports = (grunt) ->

  grunt.task.loadNpmTasks \grunt-lsc
  grunt.task.loadNpmTasks \grunt-contrib-uglify
  grunt.task.loadNpmTasks \grunt-contrib-concat

  grunt.initConfig (

    lsc:
      moedict:
        files:
          \jquery.moedict.js : <[ jquery.moedict.ls ]>

    concat:
      moedict:
        files:
          \jquery.moedict.js : <[ jquery.moedict.js jquery.hoverIntent.js ]>

    uglify:
      moedict:
        options:
          preserveComments: \some
        files:
          \jquery.moedict.min.js : <[ jquery.moedict.js ]>

  )
  grunt.registerTask \default, <[ lsc concat uglify ]>
