<template>
	<ui-validate :value="errorText" :novalidate="novalidate" :nomessage="nomessage" :verifying="verifying" v-if="!view">
		<el-input-number :disabled="disabled" controls-position="right" @change="$emit('change',$event!=null?$event:'')" @blur="validate" :min="min" :max="max" :placeholder="'请输入'+description"
			:precision="precision" :step="selfStep" :value="value!==''?parseFloat(value):undefined" @input="$emit('input',$event!=null?$event:'')"/>
	</ui-validate>
	<div v-else class="uimaker-view">{{htmlValue}}</div>
</template>

<script>
import uiValidate from './ui-validate.vue';

export default {
	name:'ui-number',
	props:{
		value:{default:''},
		required:{type:Boolean,default:false},
		view:{type:Boolean,default:false},
		min:{type:Number,default:0},
		max:{type:Number,default:Infinity},
		precision:{type:Number,default:0},
		step:{type:Number},
		description:{type:String,default:''},
		novalidate:{type:Boolean,default:false},
		nomessage:{type:Boolean,default:false},
		disabled:{type:Boolean,default:false},
	},
	data(){
		return {
			errorText:'',
			verifying:false,
			selfStep:1,
		};
	},
	computed:{
		htmlValue(){
			return this.value!=null?this.value:'';
		}
	},
	created(){
		if(this.step==undefined){
			this.selfStep=1/Math.pow(10,this.precision);
		}
		else{
			this.selfStep=this.step;
		}
	},
	methods:{
		setTestValue(){
			var max=this.max>1000?1000:this.max;
			var min=this.min<-1000?-1000:this.min;
			this.$emit('input',parseInt(Math.random()*(max-min+1))+min);
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
		step(val){
			this.selfStep=this.val;
		}
	},
	components: {
		uiValidate
	}
}
</script>

<style scoped>
.el-input-number{width:100%;}
</style>