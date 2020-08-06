<template>
</template>

<script>
import Sortable from 'sortablejs'

export default {
	name:'com-table',
	props:{
		url:{type:String,default:''},
		data:{type:Array},
		search:{type:Object,default:()=>{}},
		searchTypes:{type:Boolean,default:false},
		searchCom:{type:Object}, //设置此表格关联的search组件
		nopagination:{type:Boolean,default:false},
		noborder:{type:Boolean,default:false},
		nostripe:{type:Boolean,default:false},
		noautowidth:{type:Boolean,default:false},
		autolimitwidth:{type:Boolean,default:false},
		noautobind:{type:Boolean,default:false},
		orderbyasc:{type:Boolean,default:false},
		wrap:{type:Boolean,default:false},
		headerWrap:{type:Boolean,default:false},
		indexColumn:{type:Boolean,default:false},
		selectionColumn:{type:Boolean,default:false},
		draggable:{type:Boolean,default:false},
		defaultExpandAll:{type:Boolean,default:false},
		rowKey:{},
		treeProps:{type:Object,default:()=>{return {children:'children'}}},
		highlightCurrentRow:{},
		showHeader:{},
		rowClassName:{},
		rowStyle:{},
		cellClassName:{},
		cellStyle:{},
		headerRowClassName:{},
		headerRowStyle:{},
		headerCellClassName:{},
		headerCellStyle:{},
		pageFields:{type:Object,default:()=>{return {page:'page',rows:'rows'}}},
		dataFormat:{type:Function,default:(data)=>{
			return data;
		}},
	},
	created(){
		this.pageSize=this.defaultPageSize;
		if(this.data!=null){
			this.selfData=this.initDataFormat(this.data);
		}
		if(this.url!=''&&!this.noautobind){
			this.loadUrlData();
		}
		this.$options.render = createElement => {
			if(this.selfData==null){
				return;
			}
			
			var containers=[];
			var columns=[];
			this.components={};
			
			if(this.selectionColumn){
				columns.push(createElement('el-table-column',{props:{
					type:'selection',
					width:'40',
				}}));
			}

			if(this.indexColumn){
				columns.push(createElement('el-table-column',{props:{
					type:'index',
					width:25+9*this.getDataAmount().toString().length,
					showOverflowTooltip:!this.wrap
				}}));
			}

			var slots=this.$scopedSlots.default({data:{}});
			for(let i=0;i<slots.length;i++){
				let ctl=slots[i];
				if(ctl.tag==null)
					continue;
				var ctlType=ctl.tag.replace(/vue-component-\d.*?-/,'');
				if(ctlType=='ElTableColumn'){
					columns.push(ctl);
				}
				else{
					var width=ctl.data.attrs.width;
					var minWidth=ctl.data.attrs['min-width'];
					var limitwidth={
						get:()=>{
							return this.autolimitwidth||width=='auto'?(width=='auto'?null:width):minWidth;
						},
						set:(w)=>{
							if(this.autolimitwidth||width=='auto'){
								width=w;
							}
							else{
								minWidth=w;
							}
						}
					};

					var hasButton=false;
					if(ctlType=='ui-date'&&limitwidth.get()==null){
						if(ctl.componentOptions.propsData.type=='datetime'){
							limitwidth.set(180);
						}
						else{
							limitwidth.set(120);
						}
					}
					else if(ctlType=='ui-text'&&limitwidth.get()==null){
						switch(ctl.componentOptions.propsData.valueType){
							case 'idcard':
								limitwidth.set(170);
								break;
							case 'phone':
								limitwidth.set(115);
								break;
						}
					}
					else if(ctlType=='ui-template'&&i==slots.length-1&&width==null&&!this.noautowidth){
						var sumWidth=22;
						for(var c=0;c<ctl.componentOptions.children.length;c++){
							let child=ctl.componentOptions.children[c];
							if(child.tag==null)
								continue;
							if(child.tag.slice(-9)=='ui-button'){
								hasButton=true;
								if(child.componentOptions.children){
									sumWidth+=49+12*child.componentOptions.children[0].text.length;
									if(child.componentOptions.propsData.onlyicon!=null){
										sumWidth-=5;
									}
								}
								else{
									sumWidth+=73;//默认都是两个字12*2
									if(child.componentOptions.propsData.onlyicon!=null){
										sumWidth-=29;
									}
								}
								sumWidth+=14;
							}
						}
						width=sumWidth-14;
					}
					else if(minWidth==null&&!this.noautowidth){
						minWidth=100;
					}

					if(ctlType=='ui-template'&&!hasButton){
						hasButton=ctl.componentOptions.children.some(p=>p.tag!=null&&p.tag.slice(-9)=='ui-button');
					}
					
					let wrap=this.wrap;
					if(wrap){ //换行
						wrap=ctl.data.attrs.nowrap==null;
					}
					else{ //不换行
						wrap=ctl.data.attrs.wrap!=null;
					}

					if(hasButton&&this.draggable){
						columns.push(createElement('el-table-column',{props:{
							width:'50',
							label:'拖动',
							'class-name':'com-table-draggable-cell',
						},scopedSlots:{
							default:props=>{
								return createElement('i',{class:'el-icon-rank com-table-draggable'});
							},
						}}));
					}
					
					var classes=[];
					if(hasButton)
						classes.push('com-table-buttons-cell');
					if(ctl.data.attrs['class-name'])
						classes.push(ctl.data.attrs['class-name']);

					columns.push(createElement('el-table-column',{props:{
						label:ctl.data.attrs.label,
						width:width,
						minWidth:minWidth,
						fixed:ctl.data.attrs.fixed,
						showOverflowTooltip:hasButton?false:!wrap,
						'class-name':classes.length!=0?classes.join(' '):undefined,
					},scopedSlots:{
						header:props=>{
							if(this.headerWrap)
								return props.column.label;
							return createElement('div',{class:'com-table-header-nowrap',on:{
								'mouseover':(e)=>{
									let obj=e.currentTarget.parentNode;
									if(obj.scrollWidth>obj.offsetWidth){
										e.currentTarget.setAttribute('title',props.column.label);
									}
									else{
										e.currentTarget.removeAttribute('title');
									}
								}
							}},props.column.label);
						},
						default:props=>{
							let coms=[];
							let com=this.$scopedSlots.default({data:props.row})[i];
							var type=com.tag.replace(/vue-component-\d.*?-/,'');
							
							if(type=='ui-template'){
								for(var c=0;c<com.componentOptions.children.length;c++){
									let child=com.componentOptions.children[c];
									if(child.tag==null)
										continue;
									if(child.tag.slice(-9)=='ui-button'){
										child.componentOptions.propsData.size='mini';
									}
								}
							}
							if(com.componentOptions.propsData!=null){
								com.componentOptions.propsData.view='';
							}
							if(type=='ui-date'&&com.componentOptions.propsData.value){
								coms.push(createElement('i',{class:'el-icon-time'}));
							}
							else if(type=='ui-switch'){
								com.componentOptions.propsData.tag='';
							}
							else if(type=='ui-image'){
								com.componentOptions.propsData.size='mini';
							}
							else if(type=='ui-text'){
								com.componentOptions.propsData.nonewline='';
							}
							
							coms.push(com);
							
							if(com.data.model||com.data.attrs&&com.data.attrs.field){
								var field=com.data.attrs.field; //为了导出
								if(!field){
									field=com.data.model.expression.split('.');
									field=field[field.length-1];
								}
								if(!this.components[field])
									this.components[field]=com;
							}
							
							return createElement('div',{class:'com-table-cell'},coms);
						}
					}}));
				}
			}

			containers.push(createElement('div',{class:'com-table-frame'},[
				createElement('el-table',{
					props:{
						data:this.selfData,border:!this.noborder,stripe:!this.nostripe,height:'100%',
						rowKey:this.rowKey,treeProps:this.treeProps,defaultExpandAll:this.rowKey!=null?true:this.defaultExpandAll,
						highlightCurrentRow:this.highlightCurrentRow,showHeader:this.showHeader,
						rowClassName:this.rowClassName,rowStyle:this.rowStyle,
						cellClassName:this.cellClassName,cellStyle:this.cellStyle,
						headerRowClassName:this.headerRowClassName,headerRowStyle:this.headerRowStyle,
						headerCellClassName:this.headerCellClassName,headerCellStyle:this.headerCellStyle,
						tooltipEffect:'light',
					},
					on:{
						'current-change':this.currentChange,
						'select':this.select,
						'select-all':this.selectAll,
						'selection-change':this.selectionChange,
					},
					style:{
						position:'absolute'
					},
					ref:'table'
				},columns)
			]));
			if(this.url!=''&&this.total!=0&&!this.nopagination){
				var pageSizes=this.getPageSizes();

				containers.push(createElement('el-pagination',{props:{
					layout:'total,sizes,prev,pager,next,jumper',
					pageSizes:pageSizes,
					total:this.total,
					currentPage:this.currentPage,
					pageSize:this.pageSize,
					background:'',
				},
				on:{
					'update:currentPage':(val)=>{
						this.currentPage=val;
					},
					'update:pageSize':(val)=>{
						this.pageSize=val;
					},
					'size-change':()=>{
						this.currentPage=1; //分页条数切换 自动跳转到第1页
						this.loadUrlData();
					},
					'current-change':()=>{
						this.loadUrlData();
					},
				}}));
			}
			return createElement('div',{class:'com-table'+(this.wrap?'':' com-table-nowrap'),ref:'component'},containers);
		};
		this.$nextTick(()=>{
			if(this.draggable){
				this.bindDrag();
			}
		});
	},
	data(){
		return {
			selfData:[],
			selection:[],
			defaultPageSize:20,
			currentPage:1,
			pageSize:0,
			total:0,
		};
	},
	watch:{
		selfData(val){
			this.$nextTick(()=>{
				this.$emit('databound',val);
			});
			this.$emit('update:data', val);
			this.selection=[];
			this.selectionChangeEvent();
		},
		data(val){
			this.selfData=this.initDataFormat(val);
		},
		url(val){
			this.loadUrlData();
		},
		search(val){
			this.currentPage=1;
			this.pageSize=this.defaultPageSize;
			this.loadUrlData();
		},
	},
	methods:{
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
		bindDrag() {
			const el = this.$refs.table.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0];
			this.sortable = Sortable.create(el, {
				ghostClass: 'com-table-draggable-ghost',
				handle: '.com-table-draggable',
				onEnd: evt => {
					if(evt.oldIndex!=evt.newIndex){
						let oldChild=el.children[evt.oldIndex];
						let newChild=el.children[evt.newIndex];
						if(evt.newIndex>evt.oldIndex){
							el.insertBefore(newChild,oldChild);
							this.$emit('drag',this.selfData[evt.oldIndex],this.selfData[evt.newIndex+1]);
						}
						else{
							el.insertBefore(newChild,el.children[evt.oldIndex+1]);
							this.$emit('drag',this.selfData[evt.oldIndex],this.selfData[evt.newIndex]);
						}
					}
				}
			});
		},
		getPageSizes(){
			var pageSizes=[];
			var addPageSize=(size,append)=>{
				if((size<=this.total||append)&&pageSizes.indexOf(size)==-1){
					pageSizes.push(size);
				}
			};
			addPageSize(5);
			addPageSize(10);
			addPageSize(20);
			addPageSize(50);
			addPageSize(100);
			addPageSize(200);
			addPageSize(500);
			addPageSize(this.defaultPageSize,true);
			if(this.total>this.defaultPageSize&&this.total<500)
				addPageSize(this.total);

			return pageSizes;
		},
		currentChange(row,oldRow){
			this.$emit('current-change',row,oldRow);
		},
		selectionChange(selection){
			this.selection=selection;
		},
		selectionChangeEvent(){
			this.$emit('selection-change',this.selection);
		},
		getDataAmount(){
			let setNodeAmount=(arr)=>{
				for(let p=0;p<arr.length;p++){
					amount++;
					let children=arr[p][this.treeProps.children];
					if(this.rowKey!=null&&children&&children.length!=0){
						setNodeAmount(children,arr[p]);
					}
				}
			};
			let amount=0;
			setNodeAmount(this.selfData);
			return amount;
		},
		initDataFormat(data){
			let setTreeNode=(arr,parent)=>{
				for(let p=0;p<arr.length;p++){
					arr[p]._parent=parent;
					let children=arr[p][this.treeProps.children];
					if(this.rowKey!=null&&children&&children.length!=0){
						setTreeNode(children,arr[p]);
					}
				}
			};
			setTreeNode(data);
			return data;
		},
		select(selection,row){
			this.selection=selection;//执行顺序最晚，必须写这句不然数据项会滞后
			if(selection.indexOf(row)!=-1){
				this.setParentChecked(row);
				this.setChildrenChecked(row);
			}
			else{
				this.setChildrenChecked(row,false);
				this.setParentChecked(row,false);
			}
			this.selectionChangeEvent();
		},
		selectAll(selection){
			let selected=!this.selfData.some(p=>{
				return selection.indexOf(p)==-1;
			});
			for(let i=0;i<this.selfData.length;i++){
				this.setChildrenChecked(this.selfData[i],selected);
			}
			this.selectionChangeEvent();
		},
		setParentChecked(obj,selected=true){
			let node=obj._parent;
			while(node){
				if(selected){
					this.$refs.table.toggleRowSelection(node,selected);
				}
				else{
					if(node[this.treeProps.children].every(p=>this.selection.indexOf(p)==-1)){
						this.$refs.table.toggleRowSelection(node,selected);
					}
				}
				node=node._parent;
			}
		},
		setChildrenChecked(obj,selected=true){
			let children=obj[this.treeProps.children];
			if(this.rowKey!=null&&children&&children.length!=0){
				for(let i=0;i<children.length;i++){
					this.$refs.table.toggleRowSelection(children[i],selected);
					this.setChildrenChecked(children[i],selected);
				}
			}
		},
		toggleRowsSelection(cons,selected){
			let setTreeNode=(arr)=>{
				for(let p=0;p<arr.length;p++){
					let conResult=false;
					for(let i=0;i<cons.length;i++){
						let result=true;
						for(let name in cons[i]){
							if(cons[i][name]!=this.getObjectValue(arr[p],name)){
								result=false;
								break;
							}
						}
						if(result){
							conResult=true;
							this.$refs.table.toggleRowSelection(arr[p],selected);
							this.setParentChecked(arr[p]);
							break;
						}
					}
					if(!conResult){
						this.$refs.table.toggleRowSelection(arr[p],false);
					}
					let children=arr[p][this.treeProps.children];
					if(this.rowKey!=null&&children&&children.length!=0){
						setTreeNode(children);
					}
				}
			};
			setTreeNode(this.selfData);
			this.selectionChangeEvent();
		},
		toggleRowSelection(row,selected){
			this.$refs.table.toggleRowSelection(row,selected);
			this.select(this.selection,row);
		},
		clearSelection(){
			this.$refs.table.clearSelection();
			this.selectAll([]);
		},
		toggleAllSelection(){
			this.$refs.table.toggleAllSelection();
			this.selectAll(this.selection);
		},
		refresh(isReset){
			if(isReset&&this.searchCom){
				this.searchCom.reset();
			}
			else{
				this.loadUrlData();
			}
		},
		getColumnsInfo(){
			var infos=[];
			for(let name in this.components){
				let ctl=this.components[name];
				
				var info={field:name,label:ctl.data.attrs.label};
				if(ctl.componentInstance!=null&&ctl.componentInstance.valueToText!=null){
					info.format=ctl.componentInstance.valueToText;
				}
				infos.push(info);
			}
			return infos;
		},
		loadUrlData(){
			var paramTypes={};
			if(this.searchTypes){
				for(var name in this.search){
					paramTypes['_t_'+name]='like';
				}
			}
			var params=Object.assign(paramTypes,this.search);
			var pageParmas={};
			pageParmas[this.pageFields.page]=this.currentPage;
			pageParmas[this.pageFields.rows]=this.nopagination?10000:this.pageSize;
			this.$axios.get(this.url,{params:Object.assign(pageParmas,params)})
			.then(data=>{
				if(data.total!=null){
					if(data.list.length==0&&data.total!=0){ //删除造成当前页没数据的情况
						this.currentPage=1;
						this.loadUrlData();
					}
					else{
						this.total=data.total;
						var pageSizes=this.getPageSizes();
						if(this.pageSize>pageSizes[pageSizes.length-1]){
							this.pageSize=pageSizes[pageSizes.length-1];
						}
						else if(pageSizes.indexOf(this.pageSize)==-1){
							this.pageSize=pageSizes[pageSizes.length-2];
							data.list=data.list.filter((p,i)=>i<this.pageSize);
						}
						this.selfData=this.initDataFormat(this.dataFormat(data.list));
					}
				}
				else if(Array.isArray(data)){
					this.selfData=this.initDataFormat(this.dataFormat(data));
				}
				else{
					this.selfData=this.initDataFormat(this.dataFormat(data));
					//throw new Error('不支持的数据格式');
				}
			}).end();
		},
	},
}
</script>

<style lang="scss">
.el-pagination{border:1px solid #EBEEF5;padding:9px 10px;border-top:0;}
.com-table{
	flex-grow:1;display:flex;flex-direction:column;
	.com-table-frame{flex-grow:1;position:relative;}
	.com-table-cell{
		display:flex;align-items:center;display:unset;
		>i{margin-right:5px;}
		.uimaker-view{display:unset;}
	}
	.el-table__header .el-table-column--selection .cell{display:flex;justify-content:center;}
	.el-table__body .el-table-column--selection .cell{padding-left:0;padding-right:0;display:flex;justify-content:center;}
	.com-table-buttons-cell{
		padding:10px 0;
		>.cell{white-space:nowrap;}
	}
	.com-table-header-nowrap{white-space:nowrap;display:unset;}
	&.com-table-nowrap{}
	.el-table tr.com-table-draggable-ghost td{
		background:#4CB7A3;color:white;
	}
	.com-table-draggable-cell{text-align:center;}
	.com-table-draggable{font-size:22px;cursor:move;}
}
.el-table__header th{background:#FAFAFA;}
</style>
