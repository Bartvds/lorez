/*jshint newcap: false*/
module.exports = function (grunt) {
	'use strict';

	var fs = require('fs');
	var path = require('path');
	var assert = require('assert');
	var webpack = require('webpack');
	var browserify = require('browserify');
	var exorcist = require('exorcist');

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-gh-pages');
	grunt.loadNpmTasks('grunt-tslint');
	grunt.loadNpmTasks('grunt-typedoc');
	grunt.loadNpmTasks('grunt-ts');
	grunt.loadNpmTasks('grunt-webpack');

	// get a formatted commit message to review changes from the commit log
	// github will turn some of these into clickable links
	function getDeployMessage() {
		var ret = '\n\n';
		if (process.env.TRAVIS !== 'true') {
			ret += 'missing env vars for travis-ci';
			return ret;
		}
		ret += 'branch: ' + process.env.TRAVIS_BRANCH + '\n';
		ret += 'SHA: ' + process.env.TRAVIS_COMMIT + '\n';
		ret += 'range SHA: ' + process.env.TRAVIS_COMMIT_RANGE + '\n';
		ret += 'build id: ' + process.env.TRAVIS_BUILD_ID + '\n';
		ret += 'build number: ' + process.env.TRAVIS_BUILD_NUMBER + '\n';
		return ret;
	}

	var pkg = grunt.file.readJSON('package.json');

	grunt.initConfig({
		pkg: pkg,
		jshint: {
			options: grunt.file.readJSON('.jshintrc'),
			support: {
				src: ['Gruntfile.js', '*.js']
			}
		},
		tslint: {
			options: {
				configuration: grunt.file.readJSON('tslint.json'),
				formatter: 'tslint-path-formatter'
			},
			src: ['src/**/*.ts']
		},
		clean: {
			dist: [
				'dist/**/*'
			],
			build: [
				'build/**/*'
			],
			demo: [
				'demo/js/lorez*'
			],
			tmp: [
				'tmp/**/*'
			],
			docs: [
				'docs/'
			]
		},
		connect: {
			options: {
				port: 8080,
				hostname: '0.0.0.0',
				base: '.'
			},
			server: {
				options: {
					keepalive: true
				}
			}
		},
		copy: {
			lorez: {
				files: [
					{expand: true, cwd: '.', src: ['README.md'], dest: 'demo/'}
				]
			}
		},
		'gh-pages': {
			options: {
				branch: 'gh-pages',
				base: 'demo'
			},
			publish: {
				options: {
					repo: 'https://github.com/Bartvds/lorez.git',
					message: 'publish gh-pages (cli)'
				},
				src: ['**/*']
			},
			deploy: {
				options: {
					user: {
						name: 'Bart van der Schoor',
						email: 'bartvanderschoor@gmail.com'
					},
					repo: 'https://' + process.env.GH_TOKEN + '@github.com/Bartvds/lorez.git',
					message: 'publish gh-pages (auto)' + getDeployMessage(),
					silent: true
				},
				src: ['**/*']
			}
		},
		watch: {
			all: {
				options: {
					atBegin: true
				},
				files: ['src/**/*.ts'],
				tasks: ['onwatch']
			}
		},
		ts: {
			options: {
				fast: 'never',
				target: 'es5',
				module: 'commonjs',
				removeComments: true,
				sourceMap: true
			},
			index: {
				src: ['./src/index.ts'],
				outDir: './build'
			}
		},
		typedoc: {
			docs: {
				options: {
					name: pkg.name + ' - ' + pkg.description,
					module: 'commonjs',
					target: 'es5',
					out: './docs'
				},
				src: ['./src']
			}
		},
		webpack: {
			ts: {
				// NOTE this target exists help testing typescript-loader
				entry: './src/index.ts',
				// devtool: 'source-map',
				module: {
					loader: {
						test: /\.ts$/,
						loader: 'typescript-loader?module=commonjs'
					}
				},
				resolve: {
					extensions: ['', '.webpack.js', '.web.js', '.js', '.ts']
				},
				output: {
					library: 'lorez',
					libraryTarget: 'umd',
					path: './tmp/',
					sourceMapFilename: 'lorez.js.map',
					filename: 'lorez.js'
				}
			},
			demo: {
				entry: './build/index.js',
				devtool: 'source-map',
				module: {
					preLoaders: [
						{
							test: /\.js$/,
							loader: 'source-map-loader'
						}
					]
				},
				output: {
					library: 'lorez',
					libraryTarget: 'umd',
					path: './demo/js/',
					sourceMapFilename: 'lorez.js.map',
					filename: 'lorez.js'
				}
			},
			dist: {
				entry: './build/index.js',
				output: {
					library: 'lorez',
					libraryTarget: 'umd',
					path: './dist/',
					filename: 'lorez.js'
				}
			},
			min: {
				entry: './build/index.js',
				plugins: [
					new webpack.optimize.UglifyJsPlugin()
				],
				output: {
					library: 'lorez',
					libraryTarget: 'umd',
					path: './dist/',
					filename: 'lorez.min.js'
				}
			}
		},
		verify: {
			demo: {
				list: [
					'./demo/js/lorez.js'
				]
			},
			dist: {
				list: [
					'./dist/lorez.js',
					'./dist/lorez.min.js'
				]
			}
		},
		bundle: {
			options: {
				standalone: 'lorez'
			},
			index: {
				main: './src/index.ts',
				bundle: './demo/js/lorez.js'
			}
		}
	});

	// setup main aliases
	grunt.registerTask('default', ['build']);

	grunt.registerTask('prep', [
		'clean:tmp',
		'clean:dist',
		'clean:build',
		'clean:demo',
		'jshint:support'
	]);

	grunt.registerTask('build', [
		'prep',
		'ts:index',
		'tslint:src'
	]);

	grunt.registerTask('test', [
		'build',
		// more!
	]);

	grunt.registerTask('dev', [
		'build',
		'webpack:demo',
		'verify:demo'
	]);

	grunt.registerTask('dist', [
		'build',
		'webpack:demo',
		'webpack:dist',
		'webpack:min',
		'verify:dist'
	]);

	grunt.registerTask('server', [
		'connect:server',
	]);

	grunt.registerTask('onwatch', [
		'dev'
	]);

	grunt.registerTask('docs', [
		'clean:docs',
		'typedoc:docs'
	]);

	grunt.registerTask('publish', 'Publish from CLI', [
		'dist',
		'gh-pages:publish'
	]);

	grunt.registerTask('deploy', 'Publish from Travis', function () {
		if (process.env.TRAVIS !== 'true' || process.env.TRAVIS_BRANCH !== 'master') {
			grunt.log.writeln('not travis master');
			return;
		}

		// only deploy under these conditions
		if (process.env.TRAVIS_SECURE_ENV_VARS === 'true' && process.env.TRAVIS_PULL_REQUEST === 'false') {
			grunt.log.writeln('executing deployment');
			// queue bul & deploy
			grunt.task.run('dist');
			grunt.task.run('gh-pages:deploy');
		}
		else {
			grunt.log.writeln('skipped deployment');
		}
	});

	// NOTE this exists to test tsify-plugin
	// custom browserify multi-task
	grunt.registerMultiTask('bundle', function () {

		var mainFile = this.data.main;
		var bundleFile = this.data.bundle;
		var mapFile = bundleFile + '.map';

		var options = this.options({
			standalone: 'lorez'
		});
		options.debug = true;

		var done = this.async();

		// make sure we have the directory (fs-stream is naive)
		grunt.file.mkdir(path.dirname(bundleFile));

		//setup stream
		var bundle = new browserify();
		bundle.add(mainFile);
		bundle.plugin('tsify', {
			target: 'es5',
			removeComments: true,
			noImplicitAny: false
		});

		var stream = bundle.bundle(options, function (err) {
			if (err) {
				grunt.log.error(mainFile);
				console.log(err);
				done(false);
			}
			else {
				grunt.log.writeln('>> '.white + mainFile);
				grunt.log.ok(bundleFile);
				done();
			}
		});
		// split source-map to own file
		stream = stream.pipe(exorcist(mapFile));
		stream.pipe(fs.createWriteStream(bundleFile));
	});

	// check if we have all the important files
	grunt.registerMultiTask('verify', function () {
		var options = this.options({});
		var missing = [];

		function checkFile(file) {
			if (!grunt.file.exists(file)) {
				missing.push(file);
			}
			else {
				grunt.log.ok(file);
			}
		}

		// check dist files
		this.data.list.forEach(function (file) {
			checkFile(file);
		});

		if (missing.length > 0) {
			grunt.log.writeln('');
			missing.forEach(function (file) {
				grunt.log.error(file);
			});
			grunt.fail.warn('missing files');
		}
	});
};
