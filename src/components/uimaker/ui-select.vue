<template>
</template>

<script>
import uiValidate from './ui-validate.vue';

export default {
	name:'ui-select',
	props: {
		value:{default:''},
		url:{type:String,default:''},
		items:{type:Array},
		textField:{type:String,default:'text'},
		valueField:{type:String,default:'value'},
		subtextField:{type:String,default:''},
		required:{type:Boolean,default:false},
		view:{type:Boolean,default:false},
		description:{type:String,default:''},
		novalidate:{type:Boolean,default:false},
		nomessage:{type:Boolean,default:false},
		multiple:{type:Boolean,default:false},
		stringValue:{type:Boolean,default:false},
		filterable:{type:Boolean,default:true},
		tag:{type:Boolean,default:false},
		nopagination:{type:Boolean,default:false},
		pageFields:{type:Object,default:()=>{return {page:'page',rows:'rows'}}},
		dataFormat:{type:Function,default:(data)=>{
			return data;
		}},
	},
	data(){
		return {
			selfItems:null,
			errorText:'',
			verifying:false,
			currentPage:1,
			pageSize:10,
			total:0,
		};
	},
	created(){
		if(this.items!=null){
			this.selfItems=this.items;
		}
		this.$options.render = createElement => {
			var options=[];

			var selfItems=[];
			if(this.selfItems!=null){
				selfItems=this.selfItems;
			}
			else if(this.url==''){
				if(this.$slots.default==null){
					throw new Error('select组件缺少option项');
				}
				for(var i=0;i<this.$slots.default.length;i++){
					var ctl=this.$slots.default[i];
					if(ctl.tag==null)
						continue;
					selfItems.push(ctl.data.attrs);
				}
			}
			if(selfItems.length!=0){
				var subtextFields=this.subtextField.split(',');
				
				for(var i=0;i<selfItems.length;i++){
					
					let optionTemplate;
					if(this.subtextField!=''){
						optionTemplate=[
							createElement('span',{},this.getObjectValue(selfItems[i],this.textField))
						];
						for(var t=0;t<subtextFields.length;t++){
							let item;
							if(subtextFields[t][0]=='#'){
								var items=subtextFields[t].slice(1).split(/\{|\}/);
								item='';
								for(var s=0;s<items.length;s++){
									if(s%2==0){
										item+=items[s];
									}
									else{
										item+=this.getObjectValue(selfItems[i],items[s]);
									}
								}
							}
							else{
								item=this.getObjectValue(selfItems[i],subtextFields[t]);
							}
							optionTemplate.push(createElement('span',{
								class:'uimaker-option-item',
								style:this.multiple&&t==subtextFields.length-1?'margin-right:20px':undefined
							},item));
						}
					}
					let obj=createElement('el-option',{
						props: {
							key:selfItems[i][this.valueField],
							value:selfItems[i][this.valueField],
							label:this.getObjectValue(selfItems[i],this.textField)
						},
						class:optionTemplate?'uimaker-option':undefined
					},optionTemplate);
					options.push(obj);
				}
			}
			
			var getValueByType=(value)=>{
				if(options.length>0){
					var itemType=typeof options[0].componentOptions.propsData.value;
					var valueType=typeof value;
					if(itemType!=valueType){
						if(itemType=='number'){
							var num=parseInt(value);
							if(!isNaN(num)){
								value=num;
							}
						}
						else if(itemType=='string'){
							value=value.toString();
						}
					}
				}
				return value;
			};

			if(!this.view){
				var value=this.value;
				if(value==null){
					value='';
				}
				else if(!this.multiple){
					value=getValueByType(value);
				}
				else if(typeof value=='string'&&value.length!=0){
					var values=value.split(',');
					value=values.map(p=>getValueByType(p));
				}
				/*if(this.url!=''&&this.total!=0&&!this.nopagination){
					options.push(createElement('div',{class:'uimaker-select-pagination'},[
						createElement('span',{on:{
							click:()=>{
								if(this.currentPage>1){
									this.currentPage--;
									this.loadUrlItems();
								}
							}
						}},'上一页'),
						createElement('span',{},this.currentPage),
						createElement('span',{on:{
							click:()=>{
								if(this.currentPage<this.total/this.pageSize){
									this.currentPage++;
									this.loadUrlItems();
								}
							}
						}},'下一页'),
					]));
				}*/
				return createElement('ui-validate',{
					attrs:{value:this.errorText,novalidate:this.novalidate,nomessage:this.nomessage,verifying:this.verifying}
				},[createElement('el-select',{
					on:{change:this.change,clear:this.clear},
					attrs:{value:value,clearable:true,filterable:this.filterable,multiple:this.multiple,
						placeholder:'请选择'+this.description//,remote:this.total!=0&&!this.nopagination
					}
				},options)]);
			}
			else{
				var texts=[];
				var tagTypes=[];
				var values=this.value;
				if(values==null){
					values=[];
				}
				if(typeof this.value=='number'){
					values=[this.value.toString()];
				}
				else if(typeof this.value=='string'&&this.value.length!=0){
					var valuesArray=values.split(',');
					if(valuesArray.length>1){
						values=valuesArray;
					}
					else{
						values=[values];
					}
				}
				for(var i=0;i<selfItems.length;i++){
					if(values.indexOf(selfItems[i][this.valueField].toString())!=-1){
						texts.push(this.getObjectValue(selfItems[i],this.textField));
						tagTypes.push(selfItems[i]['tag-type']);
					}
				}
				if(this.tag){
					var tags=[];
					for(var i=0;i<texts.length;i++){
						if(i!=0){
							tags.push(createElement('span',{},' '));
						}
						tags.push(createElement('el-tag',{props:{
							type:tagTypes[i],size:'small'
						}},texts[i]));
					}
					return createElement('div',{class:'uimaker-view'},tags);
				}
				else{
					return createElement('div',{class:'uimaker-view',domProps:{innerHTML:texts.join(',')}});
				}
			}
		};
		if(this.url!=''){
			this.loadUrlItems();
		}
		this.changeEvent(this.value);
	},
	mounted () {},
	watch:{
		value(val){
			this.changeEvent(val);
			if(this.verifying)
				this.validate();
		},
		selfItems(val){
			this.changeEvent(this.value);
			this.$emit('update:items', val);
		},
		items(val){
			this.selfItems=val;
		},
		url(val){
			this.loadUrlItems();
		}
	},
	methods: {
		valueToText(value){
			var texts=[];
			var values=value;
			if(values==null){
				values=[];
			}
			if(typeof value=='number'){
				values=[value.toString()];
			}
			else if(typeof value=='string'&&value.length!=0){
				var valuesArray=values.split(',');
				if(valuesArray.length>1){
					values=valuesArray;
				}
				else{
					values=[values];
				}
			}
			let selfItems=[];
			if(this.selfItems==null){
				for(var i=0;i<this.$slots.default.length;i++){
					var ctl=this.$slots.default[i];
					if(ctl.tag==null)
						continue;
					selfItems.push(ctl.data.attrs);
				}
			}
			else{
				selfItems=this.selfItems;
			}
			
			for(var i=0;i<selfItems.length;i++){
				if(values.indexOf(selfItems[i][this.valueField].toString())!=-1){
					texts.push(this.getObjectValue(selfItems[i],this.textField));
				}
			}
			return texts.join(',');
		},
		getObjectValue(obj,name){
			var names=name.split('.');
			var output=obj;
			for(var i=0;i<names.length;i++){
				if(output==null)
					break;
				output=output[names[i]];
			}
			return output;
		},
		setTestValue(){
			var setRandomValue=(items)=>{
				if(items.length==0)
					return;
				if(this.multiple){
					var values=[];
					for(var i=0;i<items.length;i++){
						if(parseInt(Math.random()*2)==1)
							values.push(items[i][this.valueField]);
					}
					let value=this.stringValue?values.map(p=>p.toString()).join(','):values;
					this.$emit('input',value);
					this.changeEvent(value,'change');
				}
				else{
					let value=items[parseInt(Math.random()*items.length)][this.valueField];
					this.$emit('input',value);
					this.changeEvent(value,'change');
				}
			};

			if(this.selfItems!=null){
				setRandomValue(this.selfItems);
			}
			else if(this.$slots.default!=null){
				var selfItems=[];
				for(var i=0;i<this.$slots.default.length;i++){
					let obj=this.$slots.default[i];
					if(obj.tag==null)
						continue;
					selfItems.push(obj.data.attrs);
				}
				setRandomValue(selfItems);
			}
		},
		validate(){
			this.verifying=true;
			var isValid=false;
			if(this.required&&!this.view&&(this.value===''||this.value==null||typeof this.value=='object'&&this.value.length==0)){
				this.errorText='必填项不能为空';
			}
			else{
				this.errorText='';
				isValid=true;
			}
			return isValid;
		},
		getMessage(){
			return this.errorText;
		},
		loadUrlItems(){
			var pageParmas={};
			//pageParmas[this.pageFields.page]=this.currentPage;
			//pageParmas[this.pageFields.rows]=this.nopagination?10000:this.pageSize;
			if(/=(undefined|null)?&|=(undefined|null)?$/.test(this.url)){
				this.selfItems=[];
			}
			else{
				this.$axios.get(this.url,{params:pageParmas}).then(data=>{
					if(data.total!=null){
						this.total=data.total;
						this.selfItems=this.dataFormat(data.list);
					}
					else if(Array.isArray(data)){
						this.selfItems=this.dataFormat(data);
					}
					else{
						this.selfItems=this.dataFormat(data);
						//throw new Error('不支持的数据格式');
					}
				}).end();
			}
		},
		changeEvent(val,event='value-change') {
			if(this._events[event]!=null&&(this.selfItems!=null||this.$slots.default!=null)){
				var currentItems=[];
				var vals=val.toString().split(',');
				if(this.selfItems!=null){
					for(let i=0;i<vals.length;i++){
						let items=this.selfItems.filter(p=>p[this.valueField].toString()==vals[i]);
						if(items.length!=0){
							currentItems.push(items[0]);
						}
					}
				}
				else if(this.$slots.default!=null){
					let selectItems=this.$slots.default.filter(p=>p.tag!=null).map(p=>p.data.attrs);
					for(let i=0;i<vals.length;i++){
						let items=selectItems.filter(p=>p[this.valueField]==vals[i]);
						if(items.length!=0){
							currentItems.push(items[0]);
						}
					}
				}
				this.$emit(event, val, currentItems.length==1?currentItems[0]:currentItems);
			}
		},
		trigger(eventName){
			this.$nextTick(()=>{
				this.changeEvent(this.value,eventName);
			});
		},
		change(value) {
			if(typeof value=='object'&&this.stringValue){
				value=value.join(',');
			}
			this.$emit('input', value);
			this.changeEvent(value,'change');
			this.validate();
		},
		clear() {
			this.$emit('input', '');
			this.validate();
		},
		reset(){
			this.errorText='';
			this.verifying=false;
		}
	},
	components: {
		uiValidate
	}
}
</script>

<style lang="scss">
.uimaker-option{
	display:flex;
	span{
		flex-grow:1;text-align:center;flex-basis:0;
		&:first-child{text-align:left;}
		&:last-child{text-align:right;}
	}
	.uimaker-option-item{color:#8492a6;font-size:13px;}
}
.uimaker-select-pagination{
	display:flex;justify-content:space-between;
	>span{margin:2px 10px;cursor:pointer;font-size:12px;color:#8492a6;}
}
</style>
<style lang="scss" scoped>
.el-select{width:100%;}
</style>