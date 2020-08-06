import store from '@/store'
import router from '@/router'

var props={name:'root.url',children:'son'};
var firstPage=null;
var loadRouters=(isStatic)=>{
	let menus=null;
	isStatic=store.state.app.staticMenus||isStatic;
	if(!isStatic){
		menus=store.state.app.menus;
		if(menus==null||menus.length==0){
			return;
		}
	}
	var routers=router.options.dynamicRouters;

	var getObjectValue=(obj,name)=>{
		var names=name.split('.');
		var output=obj;
		for(var i=0;i<names.length;i++){
			if(output==null)
				break;
			output=output[names[i]];
		}
		return output;
	};

	var getFullPath=(node)=>{
		if(Array.isArray(node.children)&&node.children.length>0){
			let child=node.children[0];
			return node.path+'/'+getFullPath(child);
		}
		firstPage=node; //设置首页
		return node.path;
	};

	var loadNodeRouters=(results,nodes,menus)=>{
		for(var i=0;i<nodes.length;i++){
			let menu=null;
			if(isStatic!=true){
				if(menus==null)
					continue;
				menu=menus.filter(m=>getObjectValue(m,props.name)==nodes[i].name||nodes[i].path!=''&&getObjectValue(m,props.name)==nodes[i].path);
				if(menu.length==0&&nodes[i].static!=true){
					continue;
				}
			}

			var node=Object.assign({},nodes[i]);
			node.children=[];
			results.push(node);
			if(!firstPage&&!nodes[i].static&&!nodes[i].hidden){
				if(!node.children){
					node.path='';
				}
				firstPage=node;
			}
			if(Array.isArray(nodes[i].children)){
				loadNodeRouters(node.children,nodes[i].children,menu==null?null:getObjectValue(menu[0],props.children));
			}
		}
	};

	firstPage=null;
	var resultRouters=[];
	loadNodeRouters(resultRouters,routers.filter(p=>p.path=='/')[0].children,menus);

	if(firstPage==null){
		store.commit('removeToken');
		router.push({name:'login'});
		return;
	}
	else if(firstPage.children){
		resultRouters.push({path:'',redirect:getFullPath(firstPage)});
	}
	var currentRouters=[];
	for(var i=0;i<routers.length;i++){
		currentRouters.push(Object.assign({},routers[i]));
		delete currentRouters[i].children;
	}
	currentRouters.filter(p=>p.path=='/')[0].children=resultRouters;
	router.options.routes=currentRouters;
	router.addRoutes(currentRouters);
	return currentRouters;
};

router.beforeEach((to, from, next)=>{
	if(!to.meta.noauth&&!store.state.app.token){
		next({name:'login'});
	}
	else{
		next();
	}
});

const install = function(Vue, opts = {}) {
	var componentNames=[];
	var loadComponents=(routes)=>{
		for(var i=0;i<routes.length;i++){
			var route=routes[i];
			if(route.name){
				if(componentNames.indexOf(route.name)!=-1)
					throw new Error('组件'+route.name+'重名');
				Vue.component(route.name, route.component);
				componentNames.push(route.name);
			}
			if(route.hiddens){
				for(var name in route.hiddens){
					if(componentNames.indexOf(name)!=-1)
						throw new Error('组件'+name+'重名');
					Vue.component(name, route.hiddens[name]);
					componentNames.push(name);
				}
			}
			if(route.children){
				loadComponents(route.children);
			}
		}
	};

	props=opts.props||props;
	loadComponents(router.options.dynamicRouters);
	loadRouters(opts.static);

	Vue.prototype.$getFirstPage=()=>{
		return firstPage;
	};
	Vue.prototype.$loadRouters=(isStatic)=>{
		return loadRouters(opts.static||isStatic);
	};
}

export default {
	install:install,
}