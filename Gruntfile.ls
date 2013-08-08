module.exports = (grunt) ->

  grunt.task.loadNpmTasks \grunt-lsc
  grunt.task.loadNpmTasks \grunt-contrib-uglify

  grunt.initConfig (

    lsc:
      moedict:
        files:
          \jquery.moedict.js : <[ jquery.moedict.ls ]>

    uglify:
      moedict:
        options:
          preserveComments: \some
        files:
          \jquery.moedict.min.js : <[ jquery.moedict.js ]>

  )
  grunt.registerTask \default, <[ lsc uglify ]>
