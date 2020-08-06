<template>
	<div class="com-list-content">
		<com-search ref="search" :model="search" :transfer-model.sync="condition" v-slot="{data}" :table="$refs.table">
			<ui-template>
				<ui-button type="search"></ui-button>
				<ui-button type="add" @click="add">增加</ui-button>
			</ui-template>
		</com-search>
		<com-table ref="table" url="/product/pmsCategory/listTree" row-key="id" v-slot="{data}">
			<ui-text :value="$g(data,'nativeObject.name')" label="分类名称" min-width="200"/>
			<ui-text :value="$g(data,'nativeObject.orderNum')" label="序号" />
			<ui-text :value="$g(data,'nativeObject.remark')" label="备注" />
			<ui-template label="操作">
				<ui-button type="add" @click="add(data.id)">增加子项</ui-button>
				<ui-button type="edit" @click="edit(data.nativeObject)" button-type="warning" />
				<ui-button type="delete" @click="remove(data)" :disabled="data.children&&data.children.length!=0" />
			</ui-template>
		</com-table>
	</div>
</template>

<script>
export default {
	data(){
		return {
			search:{},
			condition:{},
		};
	},
	mounted(){
	},
	methods:{
		add(id){
			this.$dialog('pms_category_detail',{type:'add',data:{parentId:id}},()=>{
				this.$refs.table.refresh(true);
			})
		},
		edit(data){
			this.$dialog('pms_category_detail',{type:'edit',data:data},()=>{
				this.$refs.table.refresh();
			})
		},
		remove(data){
			this.$axios.delete('/product/pmsCategory/'+data.id)
			.then(data=>{
				this.$refs.table.refresh();
			}).end();
		}
	}
}
</script>

<style>
</style>