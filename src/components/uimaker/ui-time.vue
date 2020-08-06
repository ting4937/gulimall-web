<template>
	<ui-validate :value="errorText" :novalidate="novalidate" :nomessage="nomessage" :verifying="verifying" v-if="!view">
		<el-time-picker :value="value" :value-format="valueFormat" @input="$emit('input',$event!=null?$event:'')" @change="$emit('change',$event!=null?$event:'')" @blur="validate" :placeholder="'请选择'+description"/>
	</ui-validate>
	<div v-else class="uimaker-view">{{htmlValue}}</div>
</template>

<script>
import uiValidate from './ui-validate.vue';

export default {
	name:'ui-time',
	props:{
		value:{type:String,default:''},
		required:{type:Boolean,default:false},
		view:{type:Boolean,default:false},
		description:{type:String,default:''},
		novalidate:{type:Boolean,default:false},
		nomessage:{type:Boolean,default:false},
	},
	data(){
		return {
			errorText:'',
			verifying:false,
			valueFormat:'HH:mm:ss'
		};
	},
	computed:{
		htmlValue(){
			return this.value!=null?this.value:'';
		}
	},
	created(){},
	methods:{
		setTestValue(){
			var hour=parseInt(Math.random()*24);
			var minute=parseInt(Math.random()*60);
			var second=parseInt(Math.random()*60);
			hour=hour>9?hour:'0'+hour;
			minute=minute>9?minute:'0'+minute;
			second=second>9?second:'0'+second;
			var value=hour+':'+minute+':'+second;
			
			this.$emit('input',value);
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
		}
	},
	components: {
		uiValidate
	}
}
</script>

<style scoped>
.el-input{width:100%;}
</style>