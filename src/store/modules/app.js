import Vue from 'vue'

const app = {
	state:{
		token:'',
		user:{},
		menus:[]
	},
	mutations:{
		setUser (state, user) {
			state.user=user;
		},
		setMenus (state, menus) {
			state.menus=menus;
		},
		setToken (state, token) {
			state.token=token;
		},
		removeToken (state) {
			state.token='';
			state.user={};
			state.menus=[];
		},
	}
}
export default app