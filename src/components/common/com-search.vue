<template>
	<div class="com-search">
		<i class="el-icon-close com-test-close" v-if="showReport" @click="showReport=false;" />
		<i class="el-icon-magic-stick com-test" v-if="testSearchCondition&&table" @click="queryTest()" />
		<ui-form ref="form" :model="model" :transfer-model="transferModel" @update:transferModel="$emit('update:transferModel',$event)" 
			:update-model-trigger="updateModelTrigger" v-slot="{data}" inline autosubmit>
			<slot :data="data"></slot>
		</ui-form>
	</div>
</template>

<script>
export default {
	name:'com-search',
	props:{
		model:{type:Object},
		transferModel:{type:Object}, //表单提交对象
		table:{type:Object}, //设置此搜索关联的table组件，用于导出文件的确定列名和搜索条件测试功能
		updateModelTrigger:{type:String,default:'click'},
		pageFields:{type:Object,default:()=>{return {page:'page',rows:'rows'}}},
		testSearchCondition:{type:Boolean,default:false},
	},
	data(){
		return {
			showReport:false //是否显示搜索测试结果
		};
	},
	mounted(){ },
	watch:{
		showReport(val){
			if(!val)
				this.$refs.form.setVerifyInfos([]);
		}
	},
	methods:{
		exports(filename){ //导出Excel
			if(this.table==null){
				this.$msgbox('没有关联table无法导出');
				return;
			}
			if(!filename){
				filename='导出';
			}
			let pages={};
			pages[this.pageFields.page]=1;
			pages[this.pageFields.rows]=10000;
			
			this.$axios.get(this.table.url,{params:Object.assign(pages,this.$refs.form.getTransferModel())})
			.then(data=>{
				if(data.list!=null)
					data=data.list;
				
				let infos=this.table.getColumnsInfo();
				let rows=[];
				for(let i=0;i<data.length;i++){
					let row={};
					for(let n=0;n<infos.length;n++){
						let info=infos[n];
						row[info.field]=this.getObjectValue(data[i],info.field);
						if(info.format)
							row[info.field]=info.format(row[info.field]);
					}
					rows.push(row);
				}
				
				this.$export(filename,infos,rows);
			});
		},
		reset(){
			this.$refs.form.reset();
			this.$refs.form.updateTransferModel();
		},
		updateTransferModel(){
			this.$refs.form.updateTransferModel();
		},
		getObjectValue(obj,name){
			var names=name.split('.');
			var output=obj;
			for(var i=0;i<names.length;i++){
				if(output==null)
					break;
				output=output[names[i]];
			}
			return output;
		},
		queryTest(){ //搜索条件测试
			this.showReport=false;
			var form=this.$refs.form;
			var params=[];
			for(var i=0;i<form.components.length;i++){
				var component=form.components[i];
				var ctlType=component.tag.replace(/vue-component-\d.*?-ui-/,'');
				let type;
				switch(ctlType){
					case 'text':
						type='like';
						break;
					case 'date':
						var start=component.field.slice(0,5);
						var end=component.field.slice(0,3);
						if(start=='start'||start=='begin'){
							type='gte';
							if(component.componentInstance.type=='datetime'){
								type='datetime-'+type;
							}
							else{
								type='date-'+type;
							}
							break;
						}
						else if(end=='end'){
							type='lte';
							if(component.componentInstance.type=='datetime'){
								type='datetime-'+type;
							}
							else{
								type='date-'+type;
							}
							break;
						}
					case 'number':
					case 'select':
					case 'cascade':
						type='number-equals';
						break;
					default:
						type='string-equals';
						break;
				}
				params.push({field:component.field,type:type,valueField:component.data.attrs['search-field']});
			}
			this.runTest(this.table.url,params).then(d=>{
				this.$refs.form.setVerifyInfos(d);
				this.showReport=true;
			}).catch(e=>{
				this.$msgbox(e);
			});
		},
		runTest(url,searchs){
			return new Promise((resolve, reject)=>{
				url+=url.indexOf('?')==-1?'?':'&';
				url+=this.pageFields.page+'=1&'+this.pageFields.rows+'=1';

				this.$axios.get(url).then(o=>{
					if(o.list&&o.list.length==0||o.length==0){
						throw new Error('没有数据项无法检测');
					}
					if(o.list!=null&&o.list.length!=1){
						throw new Error('分页参数'+this.pageFields.page+'和'+this.pageFields.rows+'非有效字段');
					}
					
					url+='00';
					this.$axios.get(url)
					.then(data=>{
						if(data.list!=null)
							data=data.list;
							
						var setReturnResult=(obj)=>{
							result.push(obj);
							if(result.length==searchs.length){
								resolve(result);
							}
						}
					
						var oData=data;
						var result=[];
						var count=0;
						for(let i=0;i<searchs.length;i++){
							let params={};
							let valueField=searchs[i].valueField?searchs[i].valueField:searchs[i].field;
							params[searchs[i].field]=this.$g(oData[0],valueField,true);
							if(params[searchs[i].field]===undefined){
								setReturnResult({field:searchs[i].field,valid:false,message:'没有找到比对值字段'});
								continue;
							}
							else if(!params[searchs[i].field]){
								var hasValue=false;
								for(let c=1;c<oData.length;c++){
									params[searchs[i].field]=this.$g(oData[c],valueField);
									if(params[searchs[i].field]!=null){
										hasValue=true;
										break;
									}
								}
								if(!hasValue){
									var flag=false;
									if(searchs[i].type.slice(-3)=='gte'||searchs[i].type.slice(-3)=='lte'){
										var slots=this.table.$scopedSlots.default({data:{}});
										for(let s=0;s<slots.length;s++){
											let ctl=slots[s];
											if(ctl.tag==null)
												continue;
											var ctlType=ctl.tag.replace(/vue-component-\d.*?-ui-/,'');
											if(ctlType=='date'){
												var field=ctl.data.attrs.field;
												if(!field){
													field=ctl.data.model.expression.split('.');
													field=field[field.length-1];
												}
												valueField=field;
												params[searchs[i].field]=this.$g(oData[0],valueField);
												flag=true;
												break;
											}
										}
									}
									if(!flag){
										setReturnResult({field:searchs[i].field,valid:false,message:'所有比对值为空'});
										continue;
									}
								}
							}
							let nparams={};
							switch(searchs[i].type){
								case 'date-gte':
									nparams[searchs[i].field]='2099-01-01';
									break;
								case 'date-lte':
									nparams[searchs[i].field]='1901-01-01';
									break;
								case 'datetime-gte':
									nparams[searchs[i].field]='2099-01-01 00:00:00';
									break;
								case 'datetime-lte':
									nparams[searchs[i].field]='1901-01-01 00:00:00';
									break;
								case 'number-equals':
									nparams[searchs[i].field]=params[searchs[i].field]+'19574';
									break;
								default:
									nparams[searchs[i].field]=params[searchs[i].field]+'9CS02';
									break;
							}
							this.$axios.get(url,{params:nparams})
							.then(d=>{
								if(d.list!=null)
									d=d.list;
								if(d.length>0){
									setReturnResult({field:searchs[i].field,valid:false,message:'无效搜索'});
									return;
								}
								if(searchs[i].type.slice(-3)=='gte'||searchs[i].type.slice(-3)=='lte'){
									var sData=oData.map(p=>this.$g(p,valueField)).filter(p=>p);
									if(sData.length<3){
										setReturnResult({field:searchs[i].field,valid:false,message:'数据过少无法验证'});
										return;
									}
									sData.sort();
									let lparams={};
									var getDateData=(val)=>{
										if(searchs[i].type.slice(0,5)=='date-'){
											return val.split(' ')[0];
										}
										return val;
									};
									lparams[searchs[i].field]=getDateData(sData[parseInt(sData.length/2)]);

									this.$axios.get(url,{params:lparams})
									.then(data=>{
										if(data.list!=null)
											data=data.list;
										if(data.length>0&&data.every(p=>{
											if(searchs[i].type.slice(-3)=='gte'){
												return getDateData(this.$g(p,valueField))>=lparams[searchs[i].field];
											}
											else{
												return getDateData(this.$g(p,valueField))<=lparams[searchs[i].field];
											}
										})){
											setReturnResult({field:searchs[i].field,valid:true});
										}
										else{
											setReturnResult({field:searchs[i].field,valid:false,message:'无效搜索'});
										}
										if(result.length==searchs.length){
											resolve(result);
										}
									}).catch(e=>{
										setReturnResult({field:searchs[i].field,valid:false,message:e.message});
									});
								}
								else if(searchs[i].type=='like'){
									var sData=oData.map(p=>this.$g(p,valueField)).filter(p=>p.length>=3);
									if(sData.length==0){
										setReturnResult({field:searchs[i].field,valid:false,message:'字段值过少无法验证'});
										return;
									}
									let lparams={};
									lparams[searchs[i].field]=sData[0][1];
									this.$axios.get(url,{params:lparams})
									.then(data=>{
										if(data.list!=null)
											data=data.list;
										let val=lparams[searchs[i].field].toLowerCase();
										if(data.length>0&&data.every(p=>this.$g(p,valueField).toLowerCase().indexOf(val)!=-1)){
											setReturnResult({field:searchs[i].field,valid:true});
										}
										else{
											setReturnResult({field:searchs[i].field,valid:false,message:'无效搜索'});
										}
									}).catch(e=>{
										setReturnResult({field:searchs[i].field,valid:false,message:e.message});
									});
								}
								else if(searchs[i].type=='number-equals'||searchs[i].type=='string-equals'){
									this.$axios.get(url,{params:params})
									.then(data=>{
										if(data.list!=null)
											data=data.list;
										if(data.length>0&&data.every(p=>this.$g(p,valueField)==params[searchs[i].field])){
											setReturnResult({field:searchs[i].field,valid:true});
										}
										else{
											setReturnResult({field:searchs[i].field,valid:false,message:'无效搜索'});
										}
										if(result.length==searchs.length){
											resolve(result);
										}
									}).catch(e=>{
										setReturnResult({field:searchs[i].field,valid:false,message:e.message});
									});
								}
							}).catch(e=>{
								setReturnResult({field:searchs[i].field,valid:false,message:e.message});
							});
						}
					}).catch(e=>{
						reject(e.message);
					});
				}).catch(e=>{
					reject(e.message);
				});
			});
		}
	}
}
</script>

<style lang="scss">
.com-search{
	border-left:3px solid #409EFF;padding:5px 12px;background:#FAFAFA;margin-bottom:15px;position:relative;
	.com-test{
		position:absolute;right:0;top:0;color:#606266;cursor:pointer;font-weight:bold;color:#C0C4CC;
		&:hover{color:#409EFF;}
		&:active{color:#3a8ee6;}
	}
	.com-test-close{
		position:absolute;right:20px;top:0;cursor:pointer;font-weight:bold;color:#C0C4CC;
		&:hover{color:#F56C6C;}
		&:active{color:#C96B64;}
	}
}
</style>