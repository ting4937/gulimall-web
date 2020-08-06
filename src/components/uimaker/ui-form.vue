<template>
</template>

<script>
import store from '@/store'

export default {
	name:'ui-form',
	props:{
		model:{type:Object},
		transferModel:{type:Object}, //表单提交对象
		columns:{type:[Number,String],default:2},
		inline:{type:Boolean,default:false},
		autosubmit:{type:Boolean,default:false},
		view:{type:Boolean,default:false},
		updateModelTrigger:{type:String,default:'click'},
		labelWidth:{type:Number,default:0},
		labelMinWidth:{type:Number,default:100},
		testValueButton:{type:Boolean,default:false},
		cacheKey:{type:String,default:''},
	},
	data(){
		return {
			currentLabelWidth:0,
			verifyInfos:[]
		};
	},
	created(){
		var labelWidth=0;
		if(this.labelWidth!=0){
			labelWidth=this.labelWidth;
		}
		else{
			labelWidth=this.labelMinWidth;
		}
		var cacheForm=this.readCache();
		this.$options.render = createElement => {
			var curColumnIndex=0;
			
			var rows=[];
			var items=[];
			
			this.components=[];
			
			var slots=this.$scopedSlots.default({data:this.model});
			for(var i=0;i<slots.length;i++){
				let ctl=slots[i];
				
				if(ctl.tag==null)
					continue;
				
				if(ctl.data!=null&&ctl.data.model!=null){
					this.initValue(ctl);
					this.components.push(ctl);
				}
				else if(ctl.componentOptions&&ctl.componentOptions.children){ //如果存在插槽对象，则循环
					var hasButton=false;
					for(var c=0;c<ctl.componentOptions.children.length;c++){
						let child=ctl.componentOptions.children[c];
						if(child.data!=null&&child.data.model!=null){
							this.initValue(child);
							this.components.push(child);
						}
						else if(child.tag!=null&&child.tag.slice(-9)=='ui-button'){
							if(child.componentOptions!=null){
								var type=child.componentOptions.propsData.type;
								if(child.componentOptions.listeners==null)
									child.componentOptions.listeners={};
								if(child.componentOptions.listeners.submit!=null){ //如果存在提交事件
									hasButton=true;
									child.componentOptions.listeners.click=()=>{
										if(this.validate()){
											this.updateTransferModel();
											child.componentOptions.listeners.submit();
										}
									}
								}
								else if(type=='reset'){ //如果是重置按钮
									child.componentOptions.listeners.click=()=>{
										this.reset();
									}
								}
								else if(type=='search'||child.data.attrs&&child.data.attrs['update-model']!=null){
									child.componentOptions.listeners.click=()=>{
										this.updateTransferModel();
									}
								}
							}
						}
					}
					if(hasButton&&this.testValueButton&&!this.inline){
						ctl.componentOptions.children.push(createElement('div',{
							on:{
								'contextmenu':(e)=>{
									e.preventDefault();
									this.setTestValue(true);
								},
							},
							style:{display:'inline-block',marginLeft:'15px'}
						},[createElement('ui-button',{
							props:{
								buttonType:'info'
							},
							on:{
								click:(e)=>{
									if(e.ctrlKey){
										this.setTestValue(null,{maxlength:true});
									}
									else{
										this.setTestValue();
									}
								},
							}
						},'填充测试值')]));
					}
				}
				
				var type=ctl.tag.replace(/vue-component-\d.*?-/,'');
				if(type=='ui-hidden'){
					continue;
				}
				
				if(this.inline&&ctl.data.attrs){
					if(ctl.componentOptions.propsData){
						ctl.componentOptions.propsData.novalidate=true;
						if(ctl.data.attrs.label)
							ctl.componentOptions.propsData.description=ctl.data.attrs.label;
					}
				}
				
				var objectColumns=1;
				var formColumns=this.inline?1:this.columns;
				if(ctl.data!=null&&ctl.data.attrs!=null&&ctl.data.attrs.columns){
					var columns=ctl.data.attrs.columns;
					if(columns=='max'){
						objectColumns=formColumns;
					}
					else{
						objectColumns=columns;
					}
				}
				else if(ctl.componentOptions&&ctl.componentOptions.Ctor.options.data&&ctl.componentOptions.Ctor.options.data().columns){
					objectColumns=ctl.componentOptions.Ctor.options.data().columns;
				}
				
				if(objectColumns>formColumns-curColumnIndex){
					rows.push(createElement('div',{class:'uimaker-item'},items));
					items=[];
					curColumnIndex=0;
				}
				
				var required=false;
				if(ctl.componentOptions&&ctl.componentOptions.propsData){
					required=this.getBooleanValue(ctl.componentOptions.propsData.required)&&!this.getBooleanValue(ctl.componentOptions.propsData.view);
				}
				var labelText=ctl.data!=null&&ctl.data.attrs!=null&&ctl.data.attrs.label?ctl.data.attrs.label+'：':'';
				var letterWidth={
					a:8,b:9,c:8,d:9,e:8,f:6,g:9,h:9,i:4,j:5,k:8,l:4,m:14,n:9,o:9,p:9,q:10,r:6,s:7,t:5,u:9,v:9,w:12,x:8,y:8,z:7,
					A:11,B:9,C:10,D:11,E:8,F:7,G:11,H:12,I:4,J:7,K:10,L:7,M:15,N:12,O:11,P:9,Q:12,R:10,S:8,T:9,U:11,V:10,W:15,X:10,Y:9,Z:9
				};
				var width=0;
				for(var l=0;l<labelText.length-1;l++){
					let letter=labelText[l];
					if(letterWidth[letter]!=null){
						width+=letterWidth[letter]+0.5;//字母宽度
					}
					else{
						width+=14.2;//中文宽度
					}
				}
				width+=13/*冒号*/+5/*右侧label预留空间*/;
				if(this.labelWidth==0&&width>labelWidth){
					labelWidth=width;
				}
				if(!this.inline)
					items.push(createElement('span',{class:'uimaker-label'+(required?' uimaker-required':''),style:{width:this.inline?'':this.currentLabelWidth+'px'}},labelText));
				let verifyInfoCtl;
				if(this.verifyInfos.length!=0&&ctl.field){
					let verifyInfo=this.verifyInfos.filter(c=>c.field==ctl.field);
					if(verifyInfo.length!=0){
						verifyInfoCtl=createElement('div',{class:['uimaker-verifyinfo',verifyInfo[0].valid?'valid':undefined]},[
							createElement('i',{class:['uimaker-icon',verifyInfo[0].valid?'el-icon-check':'el-icon-close']}),
							verifyInfo[0].message?createElement('div',{class:'uimaker-message'},[verifyInfo[0].message]):undefined
						]);
					}
				}
				items.push(createElement('div',{class:'uimaker-block'},[ctl,verifyInfoCtl?verifyInfoCtl:undefined]));
				curColumnIndex+=objectColumns;
			}
			this.currentLabelWidth=labelWidth;
			rows.push(createElement('div',{class:'uimaker-item'},items));
			return createElement('div',{class:['uimaker-form',this.inline?'uimaker-form-inline':'']},rows);
		};
	},
	methods:{
		getBooleanValue(val){
			if(typeof val=='boolean'){
				return val;
			}
			return val==undefined?false:true;
		},
		readCache(){
			if(!store.state.app.formCaches){
				return;
			}
			let tag=this.$parent.$vnode.tag;
			let type=tag.replace(/vue-component-\d.*?-/,'');
			return store.state.app.formCaches[type+this.cacheKey];
		},
		writeCache(form){
			let model={};
			for(let i=0;i<this.components.length;i++){
				let component=this.components[i];
				
				if(this.getBooleanValue(component.data.attrs.cache)){
					let val=form[component.field];
					if(component.data.attrs['cache-formatter']!=null){
						val=component.data.attrs['cache-formatter'](val);
					}
					model[component.field]=val;
				}
			}
			
			if(Object.keys(model).length!=0){
				let tag=this.$parent.$vnode.tag;
				let type=tag.replace(/vue-component-\d.*?-/,'');
				store.commit('setFormCaches',{name:type+this.cacheKey,cache:model});
			}
		},
		setVerifyInfos(arr){
			this.verifyInfos=arr;
		},
		setTestValue(onlyRequired,params){
			for(var i=0;i<this.components.length;i++){
				let ctl=this.components[i];
				if(ctl.componentInstance!=null&&ctl.componentInstance.setTestValue!=null&&
					(!onlyRequired||ctl.componentOptions.propsData&&this.getBooleanValue(ctl.componentOptions.propsData.required))&&
					(!ctl.componentOptions.propsData||!this.getBooleanValue(ctl.componentOptions.propsData.view))){
					ctl.componentInstance.setTestValue(ctl.data.attrs.label,params);
				}
			}
		},
		validate(){
			var isValid=true;
			for(var i=0;i<this.components.length;i++){
				let ctl=this.components[i];
				
				if(ctl.componentInstance!=null&&ctl.componentInstance.validate!=null){
					isValid=ctl.componentInstance.validate()?isValid:false;
				}
			}
			return isValid;
		},
		getTransferModel(){
			var model={};
			for(var i=0;i<this.components.length;i++){
				var component=this.components[i];
				
				var isSubmit=true;
				if(component.componentOptions.propsData&&this.getBooleanValue(component.componentOptions.propsData.view))
					isSubmit=false;
				if(this.getBooleanValue(component.data.attrs.autosubmit)){
					if(this.model[component.field]==null||this.model[component.field]===''){
						isSubmit=false;
					}
					else{
						isSubmit=true;
					}
				}
				if(this.getBooleanValue(component.data.attrs.submit))
					isSubmit=true;
				if(this.getBooleanValue(component.data.attrs.nosubmit))
					isSubmit=false;
				
				if(isSubmit){
					let submitField=component.data.attrs.submitfield;
					if(submitField==null)
						submitField=component.field;
					model[submitField]=this.model[component.field];
				}
			}
			return model;
		},
		updateTransferModel(){
			var model=this.getTransferModel();
			this.writeCache(model);
			this.$emit('update:transferModel',model);
		},
		initValue(ctl){
			var field=ctl.data.attrs.field;
			if(!field){
				field=ctl.data.model.expression.split('.');
				field=field[field.length-1];
			}
			ctl.field=field;
			if(ctl.key==null)
				ctl.key=field;
			if(this.autosubmit){
				ctl.data.attrs.autosubmit=true;
			}
			if(this.view&&!this.getBooleanValue(ctl.data.attrs.edit)){
				if(ctl.componentOptions.propsData==null){
					ctl.componentOptions.propsData={};
				}
				ctl.componentOptions.propsData.view=true;
			}
			if(this.updateModelTrigger=='change'){
				if(ctl.componentOptions.listeners==null){
					ctl.componentOptions.listeners={};
				}
				ctl.componentOptions.listeners.change=()=>{
					this.updateTransferModel();
				}
			}
			if(this.model[field]==null){
				var defaultVal=ctl.data.attrs.default;
				if(defaultVal==null&&this.getBooleanValue(ctl.data.attrs.cache)&&cacheForm&&cacheForm[field]!=null)
					defaultVal=cacheForm[field];
				if(defaultVal==null&&ctl.componentOptions.Ctor.options.props)
					defaultVal=ctl.componentOptions.Ctor.options.props.value.default;
				this.$set(this.model,field,defaultVal==null?'':defaultVal);
			}
		},
		clearValue(ctl){
			var field=ctl.data.attrs.field;
			if(!field){
				field=ctl.data.model.expression.split('.');
				field=field[field.length-1];
			}
			if(this.model[field]!=null){
				var defaultVal=ctl.data.attrs.default;
				if(defaultVal==null)
					defaultVal='';
				this.model[field]=defaultVal;
			}
		},
		reset(){
			for(var s=0;s<this.components.length;s++){
				let component=this.components[s];
				this.clearValue(component);
				if(component.componentInstance&&component.componentInstance.reset){
					component.componentInstance.reset();
				}
			}
		}
	},
	mounted(){ },
}
</script>
<style scoped>
	
</style>
<style lang="scss">
.uimaker-form{
	color:#606266;font-size:14px;
	.uimaker-item{display:flex;margin-bottom:20px;}
	.uimaker-space{width:70px;}
	.uimaker-label{
		line-height:34px;text-align:right;padding-right:20px;flex-shrink:0;padding-right:10px;font-weight:bold;
		&.uimaker-required{
			position:relative;
			&:after{color:#F56C6C;content:'*';position:absolute;margin-top:3px;margin-left:0;}
		}
	}
	/*.uimaker-label.uimaker-debug{position:relative;}
	.uimaker-label.uimaker-debug:before{content:'('attr(debugtext)')';width:85px;text-align: right;position:absolute;left:0px;top:23px}*/
	.uimaker-block{
		line-height:34px;width:100%;position:relative;
		.uimaker-info{line-height:initial;line-height:1.4;display:block;}
		.uimaker-verifyinfo{
			position:absolute;width:100%;height:100%;top:0;background:#F56C6C44;display:flex;align-items:center;border-radius:4px;
			.uimaker-icon{
				color:#F56C6C;font-size:20px;right:10px;position:absolute;
			}
			&.valid{
				background:#67C23A44;
				.uimaker-icon{color:#67C23A;}
			}
			.uimaker-message{color:#ff3333;font-size:14px;margin-left:10px;font-weight:bold;display:flex;align-items:center;
				height:18px;background:#F6DBD9;padding-right:5px;}
		}
	}
	.uimaker-view{padding-left:10px;}
	
	&.uimaker-form-inline{
		display:flex;flex-wrap:wrap;
		.uimaker-item{margin:7px 0;}
		.uimaker-block{max-width:200px;margin-right:15px;white-space:nowrap;}
	}
}
</style>