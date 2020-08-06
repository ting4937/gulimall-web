<template>
	<ui-validate :value="errorText" :novalidate="novalidate" :nomessage="nomessage" :verifying="verifying" v-if="!view">
		<editor :value="value" @input="$emit('input',$event)" @onChange="$emit('change',value)" :init="editorInit" @onBlur="validate"></editor>
	</ui-validate>
	<div class="uimaker-view" v-html="htmlValue" v-else></div>
</template>

<script>
import tinymce from 'tinymce/tinymce'
import 'tinymce/themes/silver'
import Editor from '@tinymce/tinymce-vue'
import 'tinymce/icons/default'
import 'tinymce/plugins/image'
import 'tinymce/plugins/link'
import 'tinymce/plugins/code'
import 'tinymce/plugins/table'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/wordcount'
import 'tinymce/plugins/fullscreen'

import uiValidate from './ui-validate.vue'
import store from '@/store'
import qs from 'qs'
import pictureCompress from 'picture-compressor-plus'

export default {
	name:'ui-richtext',
	props:{
		value:{default:''},
		required:{type:Boolean,default:false},
		view:{type:Boolean,default:false},
		novalidate:{type:Boolean,default:false},
		nomessage:{type:Boolean,default:false},
		height:{type:Number,default:300},
		minlength:{type:Number},
		maxlength:{type:Number},
		filesize:{type:String,default:'20M'},
		compressSize:{type:String},
		uploadPath:{type:String,default:'/resource/upload'},
		filePath:{type:String,default:''},
		responseValueField:{type:String,default:'data.fileUrl'},
		responseError:{type:Function,default:(response)=>{
			return response.code!==0;
		}},
		responseErrorMessage:{type:Function},
		headers:{type:Object,default:()=>{return {token:store.state.app.token}}},
		getWithHeaders:{type:Boolean,default:false},
	},
	data(){
		return {
			columns:Infinity,
			errorText:'',
			verifying:false,
			resourcePath:WEBCONFIG.resourcePath,
			editorInit:{
				skin_url: './tinymce/skins/ui/oxide',
				language_url: './tinymce/zh_CN.js',
				language:'zh_CN',
				branding: false,
				height:this.height,
				plugins: 'link lists image code table wordcount fullscreen',
				toolbar: 'bold italic underline strikethrough | fontsizeselect | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist '+
					'| outdent indent blockquote | undo redo | link unlink image | removeformat code fullscreen',
				images_upload_handler: (blobInfo, succFun, failFun)=>{
					let file = blobInfo.blob();
					let beforeEvent=this.beforeUploadEvent(file);
					if(this.isPromise(beforeEvent)){
						beforeEvent.then(newfile=>{
							this.uploadEvent(newfile, succFun, failFun);
						});
					}
					else if(beforeEvent!==true){
						failFun(beforeEvent.message);
					}
					else{
						this.uploadEvent(file, succFun, failFun);
					}
				}
			}
		};
	},
	computed:{
		htmlValue(){
			let result=this.value!=null?this.value.toString():'';
			return result;
		}
	},
	created(){},
	methods:{
		getFullUrl(value){
			if(value.slice(0,4).toLowerCase()=='http'){
				return value;
			}
			return this.resourcePath+this.filePath+(value.length>0&&value[0]=='/'?'':'/')+value+(this.getWithHeaders?'?'+qs.stringify(this.headers):'');
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
		isPromise(obj) {
			return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
		},
		beforeUploadEvent(file){
			if(file.type.split('/')[0]!='image'){
				return new Error('上传图片格式不正确');
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
					return new Error('上传图片大小不能超过'+this.filesize+'B');
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
		uploadEvent(file,succFun,failFun){
			let xhr=new XMLHttpRequest();
			xhr.withCredentials = false;
			xhr.open('post', WEBCONFIG.resourcePath+this.uploadPath);
			for(let name in this.headers){
				xhr.setRequestHeader(name,this.headers[name]);
			}
			xhr.onload = ()=>{
				if (xhr.status != 200) {
					failFun('HTTP Error: ' + xhr.status);
					return;
				}
				let response=JSON.parse(xhr.responseText);
				if (!response||this.responseError(response)) {
					let message='上传失败';
					if(this.responseErrorMessage!=null){
						message=this.responseErrorMessage(response)||message;
					}
					failFun(message);
					return;
				}
				succFun(this.getFullUrl(this.getResponseValue(response)));
			};
			let formData = new FormData();
			formData.append('file', file, file.name);
			xhr.send(formData);
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
		setTestValue(label,params={}){
			if(label==null)
				label='';
			label+=parseInt(Math.random()*100);
			if(params.maxlength){
				var maxlength=this.maxlength||1000;
				var text=label;
				for(var i=0;i<maxlength;i+=text.length){
					label+=text;
				}
				label=label.slice(0,maxlength);
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
			else if(this.value!==''&&this.minlength!=null&&this.value.length<this.minlength){
				this.errorText='长度不能小于'+this.minlength+'位';
			}
			else if(this.value!==''&&this.maxlength!=null&&this.value.length>this.maxlength){
				this.errorText='长度超出限制';
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
		uiValidate,Editor
	}
}
</script>

<style>
</style>

<style scoped>
.uimaker-view{line-height:initial;color:initial;font-size:initial;}
</style>