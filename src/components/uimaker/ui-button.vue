<template>
	<compontent :is="link?'el-link':'el-button'" :type="selfButtonType" :icon="selfIcon" :disabled="disabled" @click="click($event)" :size="size" :round="round"
		:plain="plain" :title="onlyicon?($slots.default?$slots.default[0].text:text):undefined"><slot v-if="!onlyicon">{{text}}</slot></compontent>
</template>

<script>
export default {
	name:'ui-button',
	props:{
		icon:{type:String},
		type:{type:String},
		buttonType:{type:String},
		size:{type:String},
		confirmText:{type:String},
		confirm:{type:[String,Object]},
		disabled:{type:Boolean,default:false},
		onlyicon:{type:Boolean,default:false},
		round:{type:Boolean,default:false},
		plain:{type:Boolean,default:false},
		link:{type:Boolean,default:false},
	},
	data(){
		return {
			text:'',
			selfButtonType:'',
			selfIcon:'',
			selfConfirm:'',
		};
	},
	watch:{
		type:{
			handler(){
				this.setType();
			},
			immediate:true
		},
		selfIcon(val){
			this.$emit('update:icon', val);
		},
		icon(val){
			this.selfIcon=val;
		},
		buttonType(val){
			this.selfButtonType=val;
		},
		confirmText(val){
			this.selfConfirm=val;
		},
		confirm(val){
			this.selfConfirm=val;
		},
	},
	methods:{
		setType(){
			this.text='';
			this.selfButtonType='';
			this.selfConfirm='';
			this.selfIcon='';

			if(this.type=='submit'){
				this.text='立即提交';
				this.selfButtonType='primary';
				this.selfIcon='el-icon-document-checked';
			}
			else if(this.type=='reset'){
				this.text='重置';
				this.selfIcon='el-icon-refresh-right';
			}
			else if(this.type=='edit'){
				this.text='编辑';
				this.selfButtonType='primary';
				this.selfIcon='el-icon-edit';
			}
			else if(this.type=='view'){
				this.text='查看';
				this.selfButtonType='primary';
				this.selfIcon='el-icon-document';
			}
			else if(this.type=='delete'){
				this.text='删除';
				this.selfButtonType='danger';
				this.selfConfirm='确定删除吗？';
				this.selfIcon='el-icon-delete';
			}
			else if(this.type=='search'){
				this.text='搜索';
				this.selfButtonType='primary';
				this.selfIcon='el-icon-search';
			}
			else if(this.type=='add'){
				this.text='增加';
				this.selfButtonType='primary';
				this.selfIcon='el-icon-circle-plus-outline';
			}
			else if(this.type=='export'){
				this.text='导出';
				this.selfButtonType='success';
				this.selfIcon='el-icon-download';
			}
			else if(this.type=='import'){
				this.text='导入';
				this.selfButtonType='success';
				this.selfIcon='el-icon-upload';
			}
			
			if(this.icon!=null)
				this.selfIcon=this.icon;
			if(this.buttonType!=null)
				this.selfButtonType=this.buttonType;
			if(this.confirmText!=null)
				this.selfConfirm=this.confirmText;
			if(this.confirm!=null)
				this.selfConfirm=this.confirm;
		},
		click(e){
			if(this.selfConfirm!=null&&this.selfConfirm!==''){
				let message='';
				let options={};
				if(typeof this.selfConfirm=='string'){
					message=this.selfConfirm;
				}
				else{
					options=this.selfConfirm;
				}
				if(options.customClass==null){
					options.customClass='uimaker-button-confirm';
				}
				if(options.type==null){
					options.type='warning';
				}
				this.$confirm(message,options).then((type) => {
					this.$emit('click',e);
				}).catch((type)=>{
					
				});
			}
			else{
				this.$emit('click',e);
			}
		}
	}
}
</script>

<style lang="scss">
.uimaker-button-confirm{white-space:pre;}
</style>