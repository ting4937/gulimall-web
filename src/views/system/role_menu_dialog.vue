<template>
	<div class="com-list-content">
		<com-table ref="menu" :data="menulist" row-key="id" style="height:500px;" selection-column v-slot="{data}" @selection-change="menuSelectionChange">
			<ui-text v-model="data.title" label="菜单名称" tag tag-type="success" />
			<ui-text v-model="data.remark" label="备注" />
		</com-table>
		<div class="buttons">
			<ui-button type="submit" @click="submit"></ui-button>
		</div>
	</div>
</template>

<script>
export default {
	props:['params','close'],
	data(){
		return {
			menus:[],
			menulist:[],
		};
	},
	mounted(){
		this.loadMenuData(this.params.data.id);
	},
	methods:{
		setTreeValue(items,selected){
			for(var i=0;i<items.length;i++){
				this.$refs.menu.toggleRowSelection(items[i],selected!=null?selected:items[i].selected);
				if(items[i].children!=null){
					this.setTreeValue(items[i].children);
				}
			}
		},
		loadMenuData(menuId){
			this.$axios.get('/admin/permission/queryAllAndSelectedByRoleId?roleId='+menuId).then(data=>{
				this.menulist=data;
				this.$nextTick(()=>{
					this.setTreeValue(this.menulist);
				});
			}).end();
		},
		currentChange(row){
			this.role=row;
			this.loadMenuData(row.id);
		},
		menuSelectionChange(rows){
			this.menus=rows;
		},
		submit(){
			if(this.menus.length==0){
				this.$msgbox('必须选择至少一个菜单');
				return;
			}
			
			var menuIds=[];
			for(var i=0;i<this.menus.length;i++){
				menuIds.push(this.menus[i].id);
			}
			
			this.$axios.post('/admin/role/auth',{roleId:this.params.data.id,permissionIds:menuIds.join(',')},{urlencode:true}).then(data=>{
				this.close();
			}).end();
		}
	}
}
</script>

<style lang="scss" scoped>
.buttons{margin:20px 0;}
</style>