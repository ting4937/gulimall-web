<template>
	<div class="com-list-content">
		<com-search>
			<ui-template>
				<ui-button type="add" @click="add()" />
			</ui-template>
		</com-search>
		<com-table ref="table" url="/admin/permission/listTree" row-key="id" v-slot="{data}">
			<ui-text :value="$g(data,'nativeObject.title')" label="菜单名称" min-width="200"/>
			<ui-text :value="$g(data,'nativeObject.code')" label="菜单地址" />
			<ui-select :value="$g(data,'nativeObject.level')" tag label="权限等级">
				<ui-option value="1" text="超级权限" tag-type="success"/>
				<ui-option value="2" text="普通权限"/>
			</ui-select>
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
	methods: {
		add(id) {
			this.$dialog('menu_detail',{type:'add',data:{parentId:id}},()=>{
				this.$refs.table.refresh();
			})
		},
		edit(data) {
			this.$dialog('menu_detail',{type:'edit',data:data},()=>{
				this.$refs.table.refresh();
			})
		},
		remove(data) {
			this.$axios.delete('/admin/permission/'+data.id,{id:data.id}).then(()=>{
				this.$refs.table.refresh();
			}).end();
		},
	}
}
</script>

<style>
</style>
