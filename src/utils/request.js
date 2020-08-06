import axios from 'axios'
import qs from 'qs'
import store from '@/store'
import router from '@/router'
import { MessageBox,Loading } from 'element-ui'

let urlObjects={};
let loading;
const repeatSubmitMsgbox=false;
axios.interceptors.request.use(
	config => {
		if(config.url[0]=='@'){
			config.url=config.url.slice(config.url[1]=='/'?2:1);
			return config;
		}
		config.baseURL=WEBCONFIG.connectPath;
		if(config.method=='add'){
			config.method='post';
		}
		else if(config.method=='edit'){
			config.method='put';
		}

		if(config.method!='get'){
			let url=config.method+':'+config.baseURL+config.url;
			const message=repeatSubmitMsgbox?'数据处理中，请勿重复提交':'';

			if(config.loadingmask!==false){
				loading = Loading.service({
					lock: true,
					text: '提交中',
					background: 'rgba(0, 0, 0, 0.7)'
				});
				loading.target.lastChild.style.zIndex=10000;
			}

			if(urlObjects[url]!=null){
				if(urlObjects[url].timestamp!=null){
					if(new Date().getTime()-urlObjects[url].timestamp<=1000){ //用于拦截请求结束后1秒内的同名请求
						throw new Error(message);
					}
					else{
						delete urlObjects[url];
					}
				}
				else{ //用于拦截请求还没结束时的同名请求
					throw new Error(message);
				}
			}
			urlObjects[url]={}; //设置此名称地址正在请求
		}

		if(store.state.app.token!='')
			config.headers['token'] = store.state.app.token;
		if(WEBCONFIG.system!=null)
			config.headers['system'] = WEBCONFIG.system;
		if(config.data!=null&&config.urlencode){
			config.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
			config.transformRequest = [function (data, headers) {
				return qs.stringify(data/*,{allowDots:true}*/);
			}];
		}

		return config;
	},error => {
		return Promise.reject(error);
	}
)
let isAuth=true;
axios.interceptors.response.use(
	response=>{
		if(!response.config.baseURL){
			return response.data;
		}
		
		let url=response.config.method+':'+response.config.baseURL+response.config.url;
		if(response.config.method!='get'){
			if(response.config.repeatsubmit!==true){
				urlObjects[url]={timestamp:new Date().getTime()}; //设置此名称请求结束的时间
			}
			else{
				delete urlObjects[url]; //删除请求中标记
			}
			
			if(loading)
				loading.close();
		}

		if (response.data.status === 401) {
			if(isAuth){
				isAuth=false;
				MessageBox({message:response.data.message,$type:'alert'}).then(()=>{
					throw new Error();
				}).catch(()=>{
					store.commit('removeToken');
					router.push({name:'login'});
				});
			}
			throw new Error('');
		}
		isAuth=true;
		if (response.data.status === 200) {
			if(response.data.total!=undefined)
				return {list:response.data.data,total:response.data.total};

			if(response.config.responseall){
				return response.data;
			}
			return response.data.data;
		}
		if(response.data){
			if(response.config.method!='get'){
				delete urlObjects[url]; //如果返回结果出现异常情况，解除1秒内拦截限制
			}
			let error=new Error(response.data.message+'\n'+(response.data.data!=null?response.data.data:''));
			error.response=response;
			throw error;
		}
		let error=new Error('请求结果异常');
		error.response=response;
		throw error;
	},
	error => {
		if(loading)
			loading.close();
		urlObjects={}; //异常情况清空所有名称请求信息
		return Promise.reject(error);
	}
)

const install = function(Vue, opts = {}) {
	Vue.prototype.$axios = axios;

	let messages={};
	let showMsgBox=false;

	let msgBoxList=Vue.extend({
		template: `<div class="msgboxlist">
			<div v-for="(v,k) in messages" class="msgboxlist-item" :key="k">
				<span class="msgboxlist-count" v-if="v>1||Object.keys(messages).length>1">{{v}}</span>
				<span class="msgboxlist-text">{{k}}</span>
			</div>
		</div>`,
		data(){
			return {
				messages:messages
			};
		}
	});
	let addMessage=(msg)=>{
		if(messages[msg]==null)
			Vue.set(messages,msg,0);
		messages[msg]++;
	};

	Promise.prototype.end=function(){
		this.catch((error)=>{
			if(error.message==''){
				return;
			}

			addMessage(error.message);
			if(!showMsgBox){
				showMsgBox=true;

				let h=new Vue().$createElement;
				MessageBox({
					message:h(msgBoxList),
					$type:'alert',
					customClass:'msgbox-request'
				}).then((action, instance)=>{
					showMsgBox=false;
					for(let key in messages) {
						delete messages[key]
					}
				}).catch(e=>{
					showMsgBox=false;
					for(let key in messages) {
						delete messages[key]
					}
				});

				setTimeout(()=>{
					document.body.children[document.body.children.length-2].style.zIndex=9001;
					document.body.lastChild.style.zIndex=9000;
				});
			}
		});
	}
}

export default {
	install:install,
}