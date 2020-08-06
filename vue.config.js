const packageConfig = require('./package.json')
const UnicodeWebpackPlugin = require('./build/unicode-webpack-plugin.js')
const webpack = require('webpack')

module.exports = {
	publicPath:'./',
	devServer:{
		open:true
	},
	productionSourceMap:false,
	pages: {
		index: {
			entry: 'src/main.js',
			title: '案例系统'
		}
	},
	configureWebpack:{
		plugins: [
			new webpack.DefinePlugin({
				'process.env': {
					PROJECT_NAME: `"${packageConfig.name}"`
				}
			}),
			new UnicodeWebpackPlugin()
		],
		resolve: {
			alias: {
				vue$: 'vue/dist/vue.esm.js'
			}
		}
	}
}