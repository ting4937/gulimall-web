<template>
	<ui-form :model="params.data" :transfer-model.sync="submitData" v-slot="{data}">
		<ui-hidden v-model="data.id" autosubmit/>
		<ui-hidden v-model="data.parentId"/>
		<ui-text v-model="data.title" label="菜单名称" required/>
		<ui-text v-model="data.code" label="菜单地址" required/>
		<ui-select v-model="data.level" label="权限等级" default="2" required>
			<ui-option value="1" text="超级权限"/>
			<ui-option value="2" text="普通权限"/>
		</ui-select>
		<ui-number v-model="data.orderNum" label="序号" v-if="params.type == 'edit'" required/>
		<ui-textarea v-model="data.remark" label="备注" />
		<ui-template>
			<ui-button type="submit" @submit="submit"></ui-button>
			<ui-button type="reset" v-if="params.type=='add'"></ui-button>
		</ui-template>
	</ui-form>
</template>

<script>
export default {
	props:['params','close'],
	data(){
		return {
			submitData:{},
		};
	},
	methods:{
		submit(){
			this.$axios.request({url:'/admin/permission',data:this.submitData,method:this.params.type})
			.then(data=>{
				this.close();
			}).end();
		},
	},
}
</script>

<style>
</style>
