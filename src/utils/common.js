import moment from 'moment'

moment.locale('zh-cn');

const merge = function(oparams,cparams){
	if(cparams!=undefined){
		for(var name in cparams){
			if(typeof cparams[name]=='object'&&!Array.isArray(cparams[name])){
				if(oparams[name]==null)
					oparams[name]={};
				oparams[name]=merge(oparams[name],cparams[name]);
			}
			else{
				oparams[name]=cparams[name];
			}
		}
	}
	return oparams;
}

const install = function(Vue, opts = {}) {
	Vue.prototype.$g = (obj,name,returnNull)=>{
		var objs=obj;
		if(!Array.isArray(obj)){
			objs=[obj];
		}
		
		var texts=[];
		for(var i=0;i<objs.length;i++){
			var names=name.split('.');
			var output=objs[i];
			for(var j=0;j<names.length;j++){
				if(output==null)
					break;
				output=output[names[j]];
			}
			if(returnNull&&output==null){
				return null;
			}
			if(output==null){
				output='';
			}
			texts.push(output);
		}
		if(texts.length==1){
			return texts[0];
		}
		return texts.map(m=>m.toString()).join(',');
	};
	
	Vue.prototype.$moment = (d)=>{
		return moment(d);
	};
	
	Vue.prototype.$merge = (o,c)=>{
		return merge(o,c);
	}
	
	//如果需要使用本地导出Excel功能请取消下面的注释
	/*Vue.prototype.$export = (filename,headers,data)=>{
		const formatJson=(filterVal, jsonData)=>{
			return jsonData.map(v => filterVal.map(j => {
				return v[j];
			}));
		};
		
		import('@/vendor/Export2Excel').then(excel => {
			const tHeader = [];
			const filterVal = [];
			for(let i=0;i<headers.length;i++){
				tHeader.push(headers[i].label);
				filterVal.push(headers[i].field);
			}
		
			const list = formatJson(filterVal, data)
			excel.export_json_to_excel({
				header: tHeader,
				data: list,
				filename: filename,
			})
		})
	}*/
}

export default {
	install:install,
	merge
}