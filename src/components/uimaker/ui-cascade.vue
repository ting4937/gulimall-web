<template>
	<ui-validate :value="errorText" :novalidate="novalidate" :nomessage="nomessage" :verifying="verifying" v-if="!view">
		<el-cascader clearable :value="getValue()" @input="input" @change="change" :options="selfOptions" :props="multiple?{multiple:true}:undefined"
			:collapse-tags="collapseTags" :filterable="filterable" :placeholder="'请选择'+description" />
	</ui-validate>
	<div class="uimaker-view" v-else>{{textValue}}</div>
</template>

<script>
import uiValidate from './ui-validate.vue';

export default {
	name:'ui-cascade',
	props:{
		value:{default:''},
		url:{type:String,default:''},
		required:{type:Boolean,default:false},
		view:{type:Boolean,default:false},
		options:{type:Array,default:()=>[]},
		description:{type:String,default:''},
		novalidate:{type:Boolean,default:false},
		nomessage:{type:Boolean,default:false},
		multiple:{type:Boolean,default:false},
		collapseTags:{type:Boolean,default:false},
		filterable:{type:Boolean,default:true},
		props:{type:Object,default:()=>{}},
		dataFormat:{type:Function,default:(data)=>{
			return data;
		}},
	},
	data(){
		return {
			errorText:'',
			verifying:false,
			selfOptions:[],
			selfProps:{value:'value',label:'label',children:'children'},
			optionalValues:[]
		};
	},
	computed:{
		textValue(){
			if(this.value==null)
				return '';
			var result=this.getTreeLinkedArray(this.value);
			return result?result.map(p=>p.label).join(' / '):'';
		}
	},
	created(){
		if(this.props!=null){
			this.selfProps=Object.assign(this.selfProps,this.props);
		}
		if(this.options!=null){
			this.selfOptions=this.setTreeData(this.options);
		}
		if(this.url!=''){
			this.loadUrlOptions();
		}
	},
	methods:{
		setTestValue(){
			if(this.optionalValues.length!=0){
				let value=this.optionalValues[parseInt(Math.random()*this.optionalValues.length)];
				this.$emit('input',value);
				this.change([value]);
			}
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
		getTreeLinkedArray(value){
			let findValue=(arr,links)=>{
				for(let i=0;i<arr.length;i++){
					if(value==arr[i].value){
						links.push(arr[i]);
						return links;
					}
					let children=arr[i].children;
					if(children){
						let linkArray=[];
						for(let l=0;l<links.length;l++){
							linkArray.push(Object.assign({},links[l]));
						}
						linkArray.push(arr[i]);
						let result=findValue(children,linkArray);
						if(result)
							return result;
					}
				}
			};
			return findValue(this.selfOptions,[]);
		},
		getValue(e){
			if(this.multiple&&typeof this.value=='string'){ //单选
				var values=this.value.split(',');
				var result=[];
				for(var i=0;i<values.length;i++){
					var vals=this.getTreeLinkedArray(values[i]);
					if(vals)
						result.push(vals.map(p=>p.value));
				}
				return result;
			}
			var vals=this.getTreeLinkedArray(this.value);
			return vals?vals.map(p=>p.value):undefined;
		},
		input(e){
			let val='';
			if(!e||e.length==0){
				val='';
			}
			else if(this.multiple){
				val=e.map(p=>p[p.length-1]).join(',');
			}
			else{
				val=e[e.length-1];
			}
			this.$emit('input',val);
		},
		change(val){
			var vals=[];
			var currentOptions=[];
			if(!val||val.length==0){
				vals=[];
			}
			else if(this.multiple){
				currentOptions=val.map(p=>this.getTreeLinkedArray(p[p.length-1]));
				vals=val.map(p=>p.map(m=>m[0]=='_'?m.slice(1):m));
			}
			else{
				currentOptions=this.getTreeLinkedArray(val[val.length-1]);
				vals=val.map(m=>m[0]=='_'?m.slice(1):m);
			}
			this.$emit('change', vals, currentOptions);
			this.validate();
		},
		setTreeData(val){
			let getTreeNode=(arr)=>{
				let list=[];
				for(let i=0;i<arr.length;i++){
					let node={value:this.getObjectValue(arr[i],this.selfProps.value),label:this.getObjectValue(arr[i],this.selfProps.label)};
					let children=this.getObjectValue(arr[i],this.selfProps.children);
					if(children&&children.length!=0){
						node.value='_'+node.value;
						node.children=getTreeNode(children);
					}
					else{
						this.optionalValues.push(node.value);
					}
					list.push(node);
				}
				return list;
			};
			this.optionalValues=[];
			return getTreeNode(val);
		},
		loadUrlOptions(){
			if(/=(undefined|null)?&|=(undefined|null)?$/.test(this.url)){
				this.selfOptions=[];
			}
			else{
				this.$axios.get(this.url).then(data=>{
					if(data.total!=null){
						this.selfOptions=this.setTreeData(this.dataFormat(data.list));
					}
					else if(Array.isArray(data)){
						this.selfOptions=this.setTreeData(this.dataFormat(data));
					}
					else{
						this.selfOptions=this.setTreeData(this.dataFormat(data));
						//throw new Error('不支持的数据格式');
					}
				}).end();
			}
		},
		validate(){
			this.verifying=true;
			var isValid=false;
			if(this.required&&!this.view&&(this.value===''||this.value==null)){
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
		reset(){
			this.errorText='';
			this.verifying=false;
		}
	},
	watch:{
		value(){
			if(this.verifying)
				this.validate();
		},
		selfOptions(val){
			this.$emit('update:options', val);
		},
		options(val){
			this.selfOptions=this.setTreeData(val);
		},
		url(val){
			this.loadUrlOptions();
		}
	},
	components: {
		uiValidate
	}
}
</script>

<style scoped>
.el-cascader{width:100%;}
</style>