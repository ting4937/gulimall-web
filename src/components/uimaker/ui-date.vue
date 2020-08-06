<template>
	<ui-validate :value="errorText" :novalidate="novalidate" :nomessage="nomessage" :verifying="verifying" v-if="!view">
		<el-date-picker :type="type" :value="value" :value-format="valueFormat" @input="$emit('input',$event!=null?$event:'')" @blur="validate" 
			@change="change" :placeholder="'请选择'+description" :picker-options="selfPickerOptions"/>
	</ui-validate>
	<div v-else class="uimaker-view">{{htmlValue}}</div>
</template>

<script>
import uiValidate from './ui-validate.vue';
import moment from 'moment';

export default {
	name:'ui-date',
	props:{
		value:{type:String,default:''},
		desc:{type:String},
		pickerOptions:{type:Object},
		min:{type:String},
		max:{type:String},
		required:{type:Boolean,default:false},
		view:{type:Boolean,default:false},
		type:{type:String,default:'date'},
		description:{type:String,default:''},
		novalidate:{type:Boolean,default:false},
		nomessage:{type:Boolean,default:false},
	},
	data(){
		return {
			errorText:'',
			verifying:false,
			selfPickerOptions:{}
		};
	},
	computed:{
		valueFormat(){
			switch(this.type){
				case 'date':
					return 'yyyy-MM-dd';
				case 'time':
					return 'HH:mm:ss';
				case 'datetime':
					return 'yyyy-MM-dd HH:mm:ss';
				case 'month':
					return 'yyyy-MM';
				case 'year':
					return 'yyyy';
				default:
					return 'yyyy-MM-dd';
			}
		},
		htmlValue(){
			var val=this.value!=null?this.value.toString():'';
			if(this.type=='date'){
				val=val.split(' ')[0];
			}
			return val;
		}
	},
	created(){
		this.$emit('value-change',this.value);
	},
	methods:{
		setTestValue(){
			var year=parseInt(Math.random()*20)+2000;
			var month=parseInt(Math.random()*12)+1;
			var day=parseInt(Math.random()*28)+1;
			month=month>9?month:'0'+month;
			day=day>9?day:'0'+day;
			var value=year+'-'+month+'-'+day;
			
			if(this.type=='datetime'){
				var hour=parseInt(Math.random()*24);
				var minute=parseInt(Math.random()*60);
				var second=parseInt(Math.random()*60);
				hour=hour>9?hour:'0'+hour;
				minute=minute>9?minute:'0'+minute;
				second=second>9?second:'0'+second;
				value+=' '+hour+':'+minute+':'+second;
			}
			if(this.type=='month'){
				value=year+'-'+month;
			}
			
			this.$emit('input',value);
		},
		change(value) {
			this.$emit('change', value!=null?value:'');
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
		value(val){
			if(this.verifying)
				this.validate();
			this.$emit('value-change',val);
		},
		pickerOptions:{
			handler(val){
				val=val||{};
				if(val.disabledDate==null){
					val.disabledDate=(time)=>{
						var result=false;
						if(this.min){
							var min=this.min.split(' ')[0];
							if(/^\d+$/.test(min)){
								min=min+'-01'
							}
							result=time-moment(min)<0;
						}
						if(!result&&this.max){
							var max=this.max.split(' ')[0];
							if(/^\d+$/.test(max)){
								max=max+'-01'
							}
							result=time-moment(max)>0;
						}
						return result;
					}
				}
				this.selfPickerOptions=val;
			},
			immediate:true
		},
	},
	components: {
		uiValidate
	}
}
</script>

<style scoped>
.el-input{width:100%;}
</style>