import Vue from 'vue'
import Vuex from 'vuex'
import VuexAlong from 'vuex-along'

import app from './modules/app'

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
	modules: {
		app
	},
	strict: debug,
	plugins:[VuexAlong({
		name:'vuex-along-'+process.env.PROJECT_NAME
	})]
})
