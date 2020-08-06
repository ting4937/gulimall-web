<template>
	<ui-form :model="params.data" :transfer-model.sync="submitData" :columns="1" v-slot="{data}">
		<ui-text v-model="data.username" label="用户名" view/>
		<ui-text v-model="data.oldPassword" label="原密码" show-password required/>
		<ui-text v-model="data.newPassword" label="新密码" show-password required/>
		<ui-text v-model="data.passwordConfirm" label="确认密码" show-password required nosubmit/>
		<ui-template>
			<ui-button type="submit" @submit="submit"></ui-button>
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
			if(this.params.data.newPassword!=this.params.data.passwordConfirm){
				this.$msgbox('两次密码必须相同！');
				return;
			}
			this.$axios.request({url:'/admin/user/updatePassword',data:this.submitData,method:'post',urlencode:true})
			.then(data=>{
				this.close();
			}).end();
		},
	},
}
</script>

<style>
</style>