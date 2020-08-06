<template>
	<div class="com-list-content">
		<com-search>
			<ui-template>
				<ui-button type="add" @click="add">增加</ui-button>
			</ui-template>
		</com-search>
		<com-table ref="table" url="/admin/role/listPage" v-slot="{data}">
			<ui-text v-model="data.roleName" label="角色名称"/>
			<ui-text v-model="data.roleCode" label="角色编号"/>
			<ui-textarea v-model="data.remark" label="备注"/>
			<ui-template label="操作">
				<ui-button type="edit" @click="edit(data)"/>
				<ui-button @click="menu(data)" icon="el-icon-menu" button-type="success">菜单权限</ui-button>
				<ui-button type="delete" @click="remove(data)"/>
			</ui-template>
		</com-table>
	</div>
</template>

<script>
export default {
	methods:{
		add(){
			this.$dialog('role_detail',{type:'add',data:{}},()=>{
				this.$refs.table.refresh();
			})
		},
		edit(data){
			this.$dialog('role_detail',{type:'edit',data:data},()=>{
				this.$refs.table.refresh();
			})
		},
		menu(data){
			this.$dialog('role_menu_dialog',{type:'edit',data:data},()=>{
				this.$refs.table.refresh();
			})
		},
		remove(data){
			this.$axios.delete('/admin/role/'+data.id).then(()=>{
				this.$refs.table.refresh();
			}).end();
		}
	}
}
</script>

<style>
</style>