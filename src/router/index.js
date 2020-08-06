import Vue from 'vue'
import Router from 'vue-router'
import Layout from '@/views/layout'
import RouterView from '@/views/routerview'

Vue.use(Router)

export const staticRouters = [
	{
		path: '/login',
		name: 'login',
		component: () => import('@/views/login'),
		meta:{noauth:true}
	},
	{ path: '*', redirect: '/login' }
];


export const dynamicRouters = [
{
	path: '/',
	component: Layout,
	hiddens: {
		'password_detail': () => import('@/views/first/password_detail'),
	},
	children: [
		{
			path: 'first',
			name: 'first',
			component: () => import('@/views/first'),
			meta: {title: '首页',icon: 'odometer',frame: false},
		},
		{
			path: 'product',
			meta: {title: '商品系统', icon: 'folder'},
			component: RouterView,
			children: [
				{
					path: 'pms_brand_list',
					name: 'pms_brand_list',
					component: () => import('@/views/product/pms_brand_list'),
					hiddens:{
						'pms_brand_detail': () => import('@/views/product/pms_brand_detail'),
					},
					meta: { title: '品牌', icon: 'document'}
				},
				{
					path: 'pms_category_list',
					name: 'pms_category_list',
					component: () => import('@/views/product/pms_category_list'),
					hiddens:{
						'pms_category_detail': () => import('@/views/product/pms_category_detail'),
					},
					meta: { title: '商品三级分类', icon: 'document'}
				},
			]
		},
		{
			path: 'system',
			meta: {title: '系统管理',icon: 'folder'},
			component: RouterView,
			children: [
				{
					path:'user_list',
					name:'user_list',
					component: () => import('@/views/system/user_list'),
					hiddens:{
						'user_detail': () => import('@/views/system/user_detail')
					},
					meta:{title:'人员管理',icon:'setting'}
				},
				{
					path: 'menu_list',
					name: 'menu_list',
					component: () => import('@/views/system/menu_list'),
					hiddens: {
						'menu_detail': () => import('@/views/system/menu_detail')
					},
					meta: {title: '菜单管理',icon: 'setting'}
				},
				{
					path: 'role_list',
					name: 'role_list',
					component: () => import('@/views/system/role_list'),
					hiddens: {
						'role_detail': () => import('@/views/system/role_detail'),
						'role_menu_dialog': () => import('@/views/system/role_menu_dialog')
					},
					meta: {title: '角色管理',icon: 'setting'}
				}
			]
		}
	]
}];

export default new Router({
	routes: staticRouters,
	staticRouters: staticRouters,
	dynamicRouters: dynamicRouters
})