<template>
	<div class="uimaker-image" :class="(size?('uimaker-image-'+size):'')+' '+(fit?('uimaker-image-'+fit):'')">
		<ui-validate :value="errorText" :novalidate="novalidate" :nomessage="nomessage" :verifying="verifying" v-if="!view">
			<el-upload class="avatar-uploader" accept="image/*" :show-file-list="multiple?true:false" :action="action" :on-success="onSuccessEvent" :on-preview="onPreviewEvent" :before-upload="beforeUploadEvent" 
				:before-remove="beforeRemoveEvent" :headers="headers" :on-progress="onProgress" :on-error="onErrorEvent" :on-remove="onRemoveEvent" :file-list="fileList" :list-type="multiple?'picture-card':''">
				<template v-if="multiple">
					<i class="el-icon-plus"></i>
				</template>
				<template v-else>
					<img v-if="value!=null&&value!=''" :src="imageUrl" class="avatar">
					<i v-else class="el-icon-plus avatar-uploader-icon"></i>
				</template>
			</el-upload>
		</ui-validate>
		<div v-else-if="multiple" v-for="val in value.split(',')" class="avatars">
			<el-image v-if="val!=''" :src="getFullUrl(val)" class="avatar small" :fit="fit" :preview-src-list="value.split(',').map(p=>getFullUrl(p))"/>
		</div>
		<template v-else>
			<el-image v-if="value!=null&&value!=''" :src="imageUrl" class="avatar" :fit="fit" :preview-src-list="[imageUrl]"/>
			<div v-else class="avatar-noimage">暂无图片</div>
		</template>
		<el-dialog :visible.sync="dialogVisible" title="预览" custom-class="uimaker-preview-dialog" :width="dialogWidth" top="50vh" append-to-body>
			<img style="width:100%;height:100%" :src="dialogImageUrl" alt="">
		</el-dialog>
	</div>
</template>

<script>
import uiValidate from './ui-validate.vue';
import store from '@/store'
import qs from 'qs'
import pictureCompress from 'picture-compressor-plus'

export default {
	name:'ui-image',
	props:{
		value:{type:String,default:''},
		required:{type:Boolean,default:false},
		view:{type:Boolean,default:false},
		novalidate:{type:Boolean,default:false},
		nomessage:{type:Boolean,default:false},
		multiple:{type:Boolean,default:false},
		fit:{type:String},
		size:{type:String},
		filesize:{type:String,default:'20M'},
		compressSize:{type:String},
		uploadPath:{type:String,default:'/resource/upload'},
		imagePath:{type:String,default:''},
		responseValueField:{type:String,default:'data.fileUrl'},
		responseError:{type:Function,default:(response)=>{
			return response.code!==0;
		}},
		responseErrorMessage:{type:Function},
		headers:{type:Object,default:()=>{return {token:store.state.app.token}}},
		getWithHeaders:{type:Boolean,default:false},
		onProgress:{type:Function},
		onSuccess:{type:Function},
		onError:{type:Function},
	},
	data(){
		return {
			errorText:'',
			resourcePath:WEBCONFIG.resourcePath,
			action:WEBCONFIG.resourcePath+this.uploadPath,
			verifying:false,
			fileList:[],
			selfFileList:[],
			dialogVisible:false,
			dialogImageUrl:'',
			dialogWidth:'50%'
		};
	},
	computed:{
		imageUrl(){
			return this.getFullUrl(this.value);
		}
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
			return this.resourcePath+this.imagePath+(value.length>0&&value[0]=='/'?'':'/')+value+(this.getWithHeaders?'?'+qs.stringify(this.headers):'');
		},
		validate(){
			this.verifying=true;
			var isValid=false;
			if(this.required&&!this.view&&this.value===''){
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
		getResponseValue(response){
			var names=this.responseValueField.split('.');
			var obj=response;
			for(var i=0;i<names.length;i++){
				obj=obj[names[i]];
				if(obj==null)
					break;
			}
			return obj;
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
			if(file.type.split('/')[0]!='image'){
				this.$msgbox('上传图片格式不正确').catch(e=>{});
				return false;
			}
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
					this.$msgbox('上传图片大小不能超过'+this.filesize+'B').catch(e=>{});
					return false;
				}

				if(this.compressSize){
					return new Promise((resolve, reject)=>{
						let reads = new FileReader();
						reads.readAsDataURL(file);
						let pixel=1;
						if(this.compressSize.indexOf('M')!=-1){
							pixel=1024*1024;
						}
						else if(this.compressSize.indexOf('K')!=-1){
							pixel=1024;
						}
						pixel=parseInt(this.compressSize)*pixel;
						let length=Math.sqrt(pixel)*2;
						reads.onload = (e)=>{
							pictureCompress({
								img: e.currentTarget.result,
								width: length,
								height: length,
							}).then(res => {
								let newFile = new window.File([this.convertBase64UrlToBlob(res.img)], file.name, {type: file.type});
								resolve(newFile);
							});
						};
					});
				}
			}
			return true;
		},
		convertBase64UrlToBlob(urlData){
			var urlDatas=urlData.split(',');
			var bytes=window.atob(urlDatas[1]);
			var type=urlDatas[0].split(';')[0].split(':')[1];

			var ab = new ArrayBuffer(bytes.length);
			var ia = new Uint8Array(ab);
			for (var i = 0; i < bytes.length; i++) {
				ia[i] = bytes.charCodeAt(i);
			}
			return new Blob( [ab] ,{type:type});
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
			let value='';
			if(this.multiple){
				this.selfFileList=fileList;
				value=fileList.map(p=>this.getResponseValue(p.response)).join(',');
			}
			else{
				value=this.getResponseValue(response);
			}
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
				let value='';
				if(this.multiple){
					this.selfFileList=fileList;
					value=fileList.map(p=>this.getResponseValue(p.response)).join(',');
				}
				else{
					value='';
				}
				this.$emit('input',value);
				this.$emit('change',value,'');
			}
		},
		beforeRemoveEvent(file, fileList) {
			if(file && file.status=="success"){
				return this.$confirm(`确定移除 ${ file.name }？`);
			}
		},
		onPreviewEvent(file) {
			this.preview(file.url);
		},
		preview(url){
			let img=new Image();
			img.src=url;
			img.onload=()=>{
				let maxHeight=window.innerHeight-45-70;
				if(img.naturalHeight<maxHeight)
					maxHeight=img.naturalHeight;
				
				this.dialogWidth=maxHeight*img.naturalWidth/img.naturalHeight+'px';
				this.dialogImageUrl=url;
				this.dialogVisible=true;
			};
		},
		setFileList(val){
			this.selfFileList=[];
			if(val!=null&&val!=''){
				var vals=val.split(',');
				for(var i=0;i<vals.length;i++){
					if(this.selfFileList.filter(p=>this.getResponseValue(p.response)==vals[i]).length==0){
						this.selfFileList.push({name:'image',response:this.setResponseValue(vals[i]),url:this.getFullUrl(vals[i])});
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

<style lang="scss">
.uimaker-image{
	line-height:1;
	.avatar-uploader .el-upload {border:1px dashed #d9d9d9;border-radius: 6px;cursor: pointer;position: relative;overflow: hidden;}
	.avatar-uploader .el-upload:hover {border-color: #409EFF;}
	.avatar-uploader-icon{font-size: 28px;color: #8c939d;width: 178px;height: 178px;line-height: 178px;text-align: center;}
	.avatar {width: 178px;height: 178px;display: block;border-radius: 6px;cursor:pointer;}
	.avatar.small {width: 146px;height: 146px;}
	.avatars{display:inline-block;}
	.avatars .avatar{margin-right:10px;}
	.avatar-noimage {width: 178px;height: 178px;display: flex;align-items:center;justify-content:center;color:#DDDFE5;border:1px solid #DDDFE5;
		font-size:18px;font-weight:bold;letter-spacing:1px;border-radius: 6px;}
	&.uimaker-image-mini{
		.avatar-uploader-icon{width:60px;height:60px;line-height:60px;}
		.avatar{width:60px;height:60px;}
		.avatar.small{width:60px;height:60px;}
		.avatar-noimage{width:60px;height:60px;font-size:12px;letter-spacing:0;}
	}
	&.uimaker-image-fill .el-upload-list__item-thumbnail{object-fit:fill;}
	&.uimaker-image-contain .el-upload-list__item-thumbnail{object-fit:contain;}
	&.uimaker-image-cover .el-upload-list__item-thumbnail{object-fit:cover;}
	&.uimaker-image-none .el-upload-list__item-thumbnail{object-fit:none;}
	&.uimaker-image-scale-down .el-upload-list__item-thumbnail{object-fit:scale-down;}
}
.uimaker-preview-dialog{
	position:absolute;transform:translate(-50%,-50%);left:50%;
	.el-dialog__body{display:flex;padding:0;}
}
</style>