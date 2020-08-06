<template>
	<ui-validate :value="errorText" @enter="$emit('enter',$event)" :novalidate="novalidate" :nomessage="nomessage" :verifying="verifying" v-if="!view">
		<el-input clearable :show-password="showPassword" :show-word-limit="showWordLimit" :maxlength="maxlength" :disabled="disabled" :type="type" rows="4" :value="value" @change="$emit('change',$event)" @input="$emit('input',$event)" @blur="validate" :placeholder="placeholder||'请输入'+description" />
	</ui-validate>
	<div class="uimaker-unset" v-else-if="tooltip">
		<el-tooltip class="uimaker-unset" effect="light" placement="right-end">
			<template slot="content">
				<slot name="tooltip" v-if="isShowTooltip"></slot>
			</template>
			<div @mouseover="isShowTooltip=true;isHover=true;" @mouseleave="leave" class="uimaker-view" v-if="tag">
				<el-tag v-html="htmlValue" :type="tagType" :size="tagSize"></el-tag>
			</div>
			<div class="uimaker-view" @mouseover="isShowTooltip=true;isHover=true;" @mouseleave="leave" v-html="htmlValue" :title="overflowWidth!=''?value:''" :class="{'uimaker-overflow':overflowWidth!=''}" :style="overflowWidth!=''?('width:'+overflowWidth+'px'):''" v-else></div>
		</el-tooltip>
	</div>
	<div class="uimaker-unset" v-else>
		<div class="uimaker-view" v-if="tag">
			<el-tag v-html="htmlValue" :type="tagType" :size="tagSize"></el-tag>
		</div>
		<div class="uimaker-view" v-html="htmlValue" :class="{'uimaker-overflow':overflowWidth!=''}" :title="overflowWidth!=''?value:''" :style="overflowWidth!=''?('width:'+overflowWidth+'px'):''" v-else></div>
	</div>
</template>

<script>
import uiValidate from './ui-validate.vue';

export default {
	name:'ui-text',
	props:{
		value:{default:''},
		required:{type:Boolean,default:false},
		view:{type:Boolean,default:false},
		type:{type:String,default:'text'},
		valueType:{type:String,default:''},
		description:{type:String,default:''},
		placeholder:{type:String,default:''},
		novalidate:{type:Boolean,default:false},
		nomessage:{type:Boolean,default:false},
		tag:{type:Boolean,default:false},
		tagType:{type:String,default:''},
		tagSize:{type:String,default:'small'},
		showPassword:{type:Boolean,default:false},
		disabled:{type:Boolean,default:false},
		tooltip:{type:Boolean,default:false},
		nonewline:{type:Boolean,default:false},
		overflowWidth:{type:String,default:''},
		minlength:{type:Number},
		maxlength:{type:Number},
		showWordLimit:{type:Boolean,default:false},
		rules:{type:Array,default:()=>[]}
	},
	data(){
		return {
			errorText:'',
			verifying:false,
			isShowTooltip:false,
			isHover:false,
			verify:{
				phone:{verify:/^1\d{10}$/,message:'手机号格式不正确'},
				email:{verify:/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,message:'邮箱格式不正确'},
				url:{verify:/(^#)|(^http(s*):\/\/[^\s]+\.[^\s]+)/,message:'链接格式不正确'},
				idcard:{verify:/(^\d{15}$)|(^\d{17}(x|X|\d)$)/,message:'身份证号格式不正确'},
				number:{verify:/^\d+$/,message:'只能填写数字'},
				ip:{verify:/^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/,message:'IP地址格式不正确'},
			}
		};
	},
	computed:{
		htmlValue(){
			let result=this.value!=null?this.value.toString():'';
			result=result.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/ /g,'&nbsp;');
			if(this.overflowWidth==''&&!this.nonewline){
				result=result.replace(/\n/g,'<br>');
			}
			return result;
		}
	},
	created(){},
	methods:{
		leave(){
			this.isHover=false;
			//setTimeout(()=>{
			//	if(!this.isHover)
					//this.isShowTooltip=false;
			//},1000);
		},
		setTestValue(label,params={}){
			if(label==null)
				label='';
			switch(this.valueType){
				case 'phone':
					label='1';
					for(var i=0;i<10;i++){
						label+=parseInt(Math.random()*10).toString();
					}
					break;
				case 'number':
					label=parseInt(Math.random()*100);
					break;
				case 'idcard':
					label='320';
					for(var i=0;i<15;i++){
						label+=parseInt(Math.random()*10).toString();
					}
					break;
				case 'email':
					label='e'+parseInt(Math.random()*100).toString()+'@a.com';
					break;
				case 'ip':
					label=parseInt(Math.random()*256).toString()+'.'+parseInt(Math.random()*256).toString()+'.'+
						parseInt(Math.random()*256).toString()+'.'+parseInt(Math.random()*256).toString();
					break;
				default:
					label+=parseInt(Math.random()*100);
					if(params.maxlength){
						var maxlength=this.maxlength||1000;
						var text=label;
						for(var i=0;i<maxlength;i+=text.length){
							label+=text;
						}
						label=label.slice(0,maxlength);
					}
					break;
			}
			this.$emit('input',label);
			this.$emit('change',label);
		},
		validate(){
			this.verifying=true;
			var isValid=false;
			if(this.required&&!this.view&&(this.value===''||this.value==null)){
				this.errorText='必填项不能为空';
			}
			else if((this.valueType!=''||this.rules.length!=0)&&this.value!==''){
				for(let i=-1;i<this.rules.length;i++){
					let rule;
					if(i==-1){
						if(this.valueType==''){
							continue;
						}
						rule=this.verify[this.valueType];
						if(rule==null){
							this.errorText='不存在'+this.valueType+'验证类型';
							return;
						}
					}
					else{
						rule=this.rules[i];
					}
					
					if(!rule.verify.test(this.value)){
						this.errorText=rule.message;
						return;
					}
					else{
						this.errorText='';
						isValid=true;
					}
				}
			}
			else if(this.value!==''&&this.minlength!=null&&this.value.length<this.minlength){
				this.errorText='长度不能小于'+this.minlength+'位';
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
.uimaker-overflow{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.uimaker-unset{display:unset;}
</style>

<style scoped>
.uimaker-view{}
</style>