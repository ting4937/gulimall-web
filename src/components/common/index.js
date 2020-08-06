import comDialog from './com-dialog.vue';
import comTable from './com-table.vue';
import comSearch from './com-search.vue';
import comPage from './com-page.vue';
import comPagetabs from './com-pagetabs.vue';

const components = [
	comDialog,
	comTable,
	comSearch,
	comPage,
	comPagetabs,
];

const install = function(Vue, opts = {}) {
	components.forEach(component => {
		if(opts[component.name]){
			for(var name in opts[component.name]){
				component.props[name].default=opts[component.name][name];
			}
		}
		Vue.component(component.name, component);
	});

	Vue.prototype.$dialog = (name,params,dialogParams,callback)=>{
		if(typeof dialogParams=='function'){
			callback=dialogParams;
			dialogParams=null;
		}
		if(dialogParams==null){
			dialogParams={};
		}

		let dialogData={visible:false};

		let dialog=Vue.extend({
			template: '<com-dialog :visible="visible" :component="component" :width="width" :title="title" :customClass="customClass" :nopadding="nopadding" :fullscreen="fullscreen" :params="params" :closeEvent="closeEvent" @close="close"></com-dialog>',
			props:{
				component:{},
				params:{},
				closeEvent:{},
				width:{},
				title:{},
				customClass:{},
				nopadding:{},
				fullscreen:{},
			},
			data(){
				return dialogData;
			},
			mounted(){
				setTimeout(()=>{
					this.visible=true;
				},10);//为了多字段页面,过早打开弹框显示不全的问题
			},
			methods:{
				close(){
					if(dialogParams.close)
						dialogParams.close();
					component.$destroy();
					component.$el.remove();
				}
			}
		});

		let closeEvent=(result)=>{
			callback(result);
			dialogData.visible=false;
		};

		let component = new dialog({propsData:{
			component:name,
			width:dialogParams.width,
			title:dialogParams.title,
			customClass:dialogParams.customClass,
			nopadding:dialogParams.nopadding,
			fullscreen:dialogParams.fullscreen,
			params:_.cloneDeep(params),//Object.assign({},params),
			closeEvent:closeEvent
		}}).$mount();

		document.body.appendChild(component.$el);
	};
};

export default {
	version: '2.0.0',
	install:install,
}