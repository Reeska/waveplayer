module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        sourceMap: true
      },
      build: {
    	  files: {
    		  'dist/<%= pkg.name %>.min.js' : ['src/<%= pkg.name %>.js'],
    	  }
      }
    },
    cssmin: {
        options: {
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
          sourceMap: true
        },
        build: {
      	  files: {
      		  'dist/<%= pkg.name %>.min.css' : ['src/<%= pkg.name %>.css']
      	  }
        }
      }    
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  
  // Load CssMin
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Minify task
  grunt.registerTask('minify', ['uglify', 'cssmin']);
  
  // Default task(s).
  grunt.registerTask('default', ['minify']);
};