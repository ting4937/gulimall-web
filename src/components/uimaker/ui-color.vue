<template>
	<ui-validate :value="errorText" class="uimaker-color-validate" :novalidate="novalidate" :nomessage="nomessage" :verifying="verifying" v-if="!view">
		<el-color-picker :value="value" @input="$emit('input',$event!=null?$event:'')" @change="change"></el-color-picker>
	</ui-validate>
	<div v-else class="uimaker-view" :style="{background:value}"></div>
</template>

<script>
import uiValidate from './ui-validate.vue';

export default {
	name:'ui-color',
	props:{
		value:{type:String,default:''},
		required:{type:Boolean,default:false},
		view:{type:Boolean,default:false},
		novalidate:{type:Boolean,default:false},
		nomessage:{type:Boolean,default:false},
	},
	data(){
		return {
			errorText:'',
			verifying:false,
		};
	},
	created(){},
	methods:{
		setTestValue(){
			var digits='0123456789ABCDEF';
			
			var value='#';
			for(var i=0;i<6;i++){
				value+=digits[parseInt(Math.random()*digits.length)];
			}
			
			this.$emit('input',value);
		},
		change(e){
			this.validate();
			this.$emit('change',e!=null?e:'');
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

<style>
.uimaker-color-validate{height:40px;}
</style>
<style scoped>
.uimaker-view{height:32px;width:32px;border:1px solid #e6e6e6;border-radius:4px;}
</style>