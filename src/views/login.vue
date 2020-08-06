<template>
	<div class="frame">
		<div class="login">
			<div class="title">案例管理系统 <span class="verson">V1.0</span></div>
			<div class="form">
				<ui-form ref="form" :model="formData" :label-min-width="0" :transfer-model.sync="submitData" v-slot="{data}" :test-value-button="false" :columns="1">
					<ui-text v-model="data.username" label="用户名" description="用户名" @enter="submit" required/>
					<ui-text v-model="data.password" label="密码" description="密码" @enter="submit" show-password required/>
				</ui-form>
				<ui-button type="submit" :round="false" @click="submit" icon="" class="submit">登录</ui-button>
			</div>
		</div>
	</div>
</template>

<script>
import Router from 'vue-router'

export default {
	data(){
		return {
			formData:{},
			submitData:{},
		};
	},
	mounted(){
		const createRouter = () => new Router({
			routes: this.$router.options.staticRouters
		});
		this.$router.matcher = createRouter().matcher;
		
		//如果需要登录请删除下面的语句
		// [[
		this.$store.commit('setToken','-');
		this.$loadRouters()
		this.$router.push({path:'/'});
		// ]]
	},
	methods:{
		submit(){
			if(this.$refs.form.validate()){
				this.$refs.form.updateTransferModel();
				
				this.$axios.post('/public/login',this.submitData,{urlencode:true}).then(data=>{
					this.$store.commit('setMenus',data.menus);
					this.$store.commit('setToken',data.token);
					this.$store.commit('setUser',data);
					
					if(this.$loadRouters()==null){
						this.$msgbox('没有菜单权限无法访问！');
					}
					this.$router.push({path:'/'});
				}).end();
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.frame{background:url(../assets/img/login-background.jpg) center/cover;height:100%;}
.login{
	position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);width:350px;height:250px;
	.title{
		font-size:30px;letter-spacing:4px;color:#eee;margin:0 auto 30px auto;text-align:center;font-weight:700;display:flex;
		align-items:center;justify-content:center;
		.verson{font-size:12px;align-self:flex-end;font-weight:normal;letter-spacing:0;margin-left:10px;}
	}
	.form{
		box-shadow:0px 4px 8px 0px rgba(0, 0, 0, 0.2);background:#D5E9FD;border-radius:10px;display:flex;flex-direction:column;
		padding:20px 30px;padding-top:40px;
		.submit{margin:10px 20px;margin-top:15px;font-weight:bold;letter-spacing:2px;}
	}
	.form /deep/ .uimaker-label{color:#14243E;font-weight:normal;}
}
</style>