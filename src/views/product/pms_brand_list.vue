<template>
	<div class="com-list-content">
		<com-search ref="search" :model="search" :transfer-model.sync="condition" v-slot="{data}" :table="$refs.table">
			<ui-text v-model="data.firstLetter" label="检索首字母"/>
			<ui-text v-model="data.name" label="品牌名"/>
			<ui-template>
				<ui-button type="search"></ui-button>
				<ui-button type="add" @click="add">增加</ui-button>
			</ui-template>
		</com-search>
		<com-table ref="table" url="/pmsBrand/listPage" :search="condition" v-slot="{data}" :search-com="$refs.search">
			<ui-text v-model="data.firstLetter" label="检索首字母"/>
			<ui-text v-model="data.name" label="品牌名"/>
			<ui-image v-model="data.logo" label="品牌logo"/>
			<ui-text v-model="data.remark" label="备注"/>
			<ui-number v-model="data.sort" label="排序"/>
			<ui-template label="操作">
				<ui-button type="edit" @click="edit(data)"/>
				<ui-button type="delete" @click="remove(data)"/>
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
		add(){
			this.$dialog('pms_brand_detail',{type:'add',data:{}},()=>{
				this.$refs.table.refresh(true);
			})
		},
		edit(data){
			this.$dialog('pms_brand_detail',{type:'edit',data:data},()=>{
				this.$refs.table.refresh();
			})
		},
		remove(data){
			this.$axios.delete('/pmsBrand/'+data.id)
			.then(data=>{
				this.$refs.table.refresh();
			}).end();
		}
	}
}
</script>

<style>
</style>