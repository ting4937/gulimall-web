<template>
	<ui-form :model="params.data" :transfer-model.sync="submitData" v-slot="{data}">
		<ui-hidden v-model="data.id" autosubmit/>
		<ui-text v-model="data.username" label="用户名" required/>
		<ui-text v-model="data.password" label="密码" type="password" autosubmit :required="params.type=='add'?'':undefined"/>
		<ui-text v-model="data.realName" label="姓名" required/>
		<ui-text value="管理员" label="关联角色" view v-if="data.userType==2"/>
		<ui-select v-model="data.roleIds" multiple label="关联角色" url="/admin/role" value-field="id" text-field="roleName" v-else/>
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
			submitData:{}
		};
	},
	methods:{
		submit(){
			this.$axios.request({url:'/admin/user',data:this.submitData,method:this.params.type})
			.then(data=>{
				this.close();
			}).end();
		},
	},
}
</script>

<style>
</style>
