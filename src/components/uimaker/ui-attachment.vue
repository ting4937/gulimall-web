<template>
	<ui-validate :value="errorText" :novalidate="novalidate" :nomessage="nomessage" :verifying="verifying" v-if="!view">
		<el-upload :action="action" :accept="accept" :headers="headers" :on-success="onSuccessEvent" :before-remove="beforeRemoveEvent" :on-remove="onRemoveEvent"
			:on-preview="onPreviewEvent" :before-upload="beforeUploadEvent" :on-progress="onProgress" :on-error="onErrorEvent" :file-list="fileList">
			<el-button size="small" icon="el-icon-upload2" type="primary">点击上传</el-button>
			<!--<div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>-->
		</el-upload>
	</ui-validate>
	<div v-else>
		<div v-for="file in selfFileList" class="uimaker-attachments">
			<ul class="el-upload-list el-upload-list--text" @click="filePreview(file)">
				<li tabindex="0" class="el-upload-list__item is-success">
					<a class="el-upload-list__item-name">
						<i class="el-icon-document"></i>{{file.name}}</a>
				</li>
			</ul>
		</div>
	</div>
</template>

<script>
import uiValidate from './ui-validate.vue'
import store from '@/store'
import qs from 'qs'

export default {
	name:'ui-attachment',
	props:{
		value:{type:String,default:''},
		required:{type:Boolean,default:false},
		view:{type:Boolean,default:false},
		novalidate:{type:Boolean,default:false},
		nomessage:{type:Boolean,default:false},
		multiple:{type:Boolean,default:false},
		accept:{type:String},
		filesize:{type:String,default:''},
		originalName:{type:String,default:''},
		uploadPath:{type:String,default:'/attach/upload'},
		filePath:{type:String,default:'/attach/download'},
		responseValueField:{type:String,default:'data.id'},
		responseOriginalNameField:{type:String,default:'data.originalName'},
		responseError:{type:Function,default:(response)=>{
			return response.code!==0;
		}},
		responseErrorMessage:{type:Function},
		headers:{type:Object,default:()=>{return {token:store.state.app.token}}},
		getWithHeaders:{type:Boolean,default:true},
		onProgress:{type:Function},
		onSuccess:{type:Function},
		onError:{type:Function},
		onCancel:{type:Function},
	},
	data(){
		return {
			errorText:'',
			resourcePath:WEBCONFIG.resourcePath,
			action:WEBCONFIG.resourcePath+this.uploadPath,
			verifying:false,
			fileList:[],
			selfFileList:[],
		};
	},
	created(){
		if(this.value!='')
			this.setFileList(this.value);
	},
	methods:{
		getFullUrl(value){
			if(value.slice(0,4).toLowerCase()=='http'){
				return value;
			}
			return this.resourcePath+this.filePath+(value.length>0&&value[0]=='/'?'':'/')+value+(this.getWithHeaders?'?'+qs.stringify(this.headers):'');
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
		getResponseInfo(response,field){
			var names=field.split('.');
			var obj=response;
			for(var i=0;i<names.length;i++){
				obj=obj[names[i]];
				if(obj==null)
					break;
			}
			return obj;
		},
		getResponseValue(response){
			return this.getResponseInfo(response,this.responseValueField);
		},
		getResponseOriginalName(response){
			return this.getResponseInfo(response,this.responseOriginalNameField);
		},
		setResponseValue(val){
			var names=this.responseValueField.split('.');
			var result={};
			var obj=result;
			for(var i=0;i<names.length;i++){
				if(i==names.length-1){
					obj[names[i]]=val;
					break;
				}
				obj[names[i]]={};
				obj=obj[names[i]];
			}
			return result;
		},
		beforeUploadEvent(file){
			if(this.filesize){
				let times=1;
				if(this.filesize.indexOf('M')!=-1){
					times=1024*1024;
				}
				else if(this.filesize.indexOf('K')!=-1){
					times=1024;
				}
				let filesize=parseInt(this.filesize)*times;
				if(filesize<file.size){
					this.$msgbox('上传文件大小不能超过'+this.filesize+'B').catch(e=>{});
					return false;
				}
			}
			return true;
		},
		onSuccessEvent(response, file, fileList) {
			if(response==''||this.responseError(response)){
				let message='上传失败';
				if(this.responseErrorMessage!=null){
					message=this.responseErrorMessage(response)||message;
				}
				this.$msgbox(message).catch(e=>{});
				this.setFileList(this.value);
				if(this.onError)
					this.onError(new Error(message), file, fileList);
				return;
			}
			if(!this.multiple){
				fileList=fileList.slice(-1);
			}
			this.selfFileList=fileList;
			let value=fileList.map(p=>this.getResponseValue(p.response)).join(',');
			let originalName=fileList.map(p=>this.getResponseOriginalName(p.response)).join(',');
			this.$emit('update:original-name',originalName);
			this.$emit('input',value);
			this.$emit('change',value,response.data);
			if(this.onSuccess)
				this.onSuccess(response, file, fileList);
		},
		onErrorEvent(err,file,fileList){
			let message='上传失败';
			this.$msgbox(message).catch(e=>{});
			if(this.onError)
				this.onError(err, file, fileList);
		},
		onRemoveEvent(file, fileList){
			if(file && file.status=="success"){
				this.selfFileList=fileList;
				let value=fileList.map(p=>this.getResponseValue(p.response)).join(',');
				let originalName=fileList.map(p=>this.getResponseOriginalName(p.response)).join(',');
				this.$emit('update:original-name',originalName);
				this.$emit('input',value);
				this.$emit('change',value,'');
			}
			else if(file && file.status=="uploading"){
				if(this.onCancel)
					this.onCancel(file, fileList);
			}
		},
		onPreviewEvent(file) {
			var val=this.getResponseValue(file.response);
			window.open(this.getFullUrl(val));
		},
		filePreview(file) {
			var val=this.getResponseValue(file.response);
			window.open(this.getFullUrl(val));
		},
		beforeRemoveEvent(file, fileList) {
			if(file && file.status=="success"){
				return this.$confirm(`确定移除 ${ file.name }？`);
			}
		},
		setFileList(val){
			this.selfFileList=[];
			if(val!=''&&typeof val=='string'){
				var vals=val.split(',');
				var originalNames=this.originalName.split(',');
				for(var i=0;i<vals.length;i++){
					if(this.selfFileList.filter(p=>this.getResponseValue(p.response)==vals[i]).length==0){
						var name='文件';
						var valInfos=vals[i].split(/\/|\\/);
						if(originalNames[i]){
							name=originalNames[i]
						}
						else{
							var valInfos=vals[i].split(/\/|\\/);
							name=valInfos[valInfos.length-1];
						}
						this.selfFileList.push({name:name,response:this.setResponseValue(vals[i])});
					}
				}
				this.fileList=this.selfFileList;
			}
			else if(val!=null&&typeof val=='object'){
				for(var i=0;i<val.length;i++){
					if(this.selfFileList.filter(p=>this.getResponseValue(p.response)==val[i].id).length==0){
						this.selfFileList.push({name:val[i].originalName,response:this.setResponseValue(val[i].id)});
					}
				}
				this.fileList=this.selfFileList;
			}
			else{
				this.fileList=[];
			}
		},
		reset(){
			this.errorText='';
			this.verifying=false;
		}
	},
	watch:{
		value(val){
			this.setFileList(val);
			if(this.verifying)
				this.validate();
		},
	},
	components: {
		uiValidate
	}
}
</script>

<style>
</style>