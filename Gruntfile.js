'use strict';

module.exports = function (grunt) {
	grunt.initConfig({

		// metadata
		pkg : grunt.file.readJSON('package.json'),
		meta: {
			copyright : 'Copyright (c) 2013-<%= grunt.template.today("yyyy") %>',
			banner    : '/* \n' +
						' * <%= pkg.name %>.js v<%= pkg.version %> \n' +
						' * <%= pkg.repository.url %> \n' +
					//	' * <%= pkg.description %> \n' +
					//	' * \n' +
					//	' * <%= meta.copyright %>, <%= pkg.author.name %> <<%= pkg.author.email %>> \n' +
					//	' * Licensed under the <%= pkg.license.type %> License \n' +
						' */ \n',
			source    : ['junior.js']
		},

		// JShint this version
		jshint: {
			files: {
				src: '<%= meta.source %>'
			}
		},

		// uglifying concatenated file
		uglify: {
			options: {
				banner: '<%= meta.banner %>',
				mangle: true
			},
			// uglify this version
			stable: {
				src: ['<%= meta.source %>'],
				dest: '<%= pkg.name %>.min.js'
			}
		},

	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default', [
		'jshint',
    	'uglify'
	]);

};