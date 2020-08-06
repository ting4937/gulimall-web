<template>
	<div class="main">
		<div class="left" :class="{fold:fold}">
			<div class="head">
				<div class="titlename"></div>
			</div>
			<div class="menuscon">
				<el-menu class="menus" :collapse="fold" :default-active="$route.path" @select="menuSelect">
					<template v-for="(menu,index) in menus">
						<el-submenu v-if="menu.children&&menu.children.length!=0" :index="'/'+menu.path">
							<template slot="title">
								<i :class="'el-icon-'+(menu.meta.icon?menu.meta.icon:'menu')"></i>
								<span>{{menu.meta.title}}</span>
							</template>
							<el-menu-item :index="'/'+menu.path+'/'+submenu.path" :key="subindex" v-for="(submenu,subindex) in menu.children" v-if="submenu.meta&&!submenu.hidden">
								<i :class="'el-icon-'+(submenu.meta.icon?submenu.meta.icon:'menu')"></i>
								<span slot="title">{{submenu.meta.title}}</span>
							</el-menu-item>
						</el-submenu>
						<el-menu-item v-else-if="menu.meta&&!menu.hidden" :index="'/'+menu.path">
							<i :class="'el-icon-'+(menu.meta.icon?menu.meta.icon:'menu')"></i>
							<span slot="title">{{menu.meta.title}}</span>
						</el-menu-item>
					</template>
				</el-menu>
			</div>
		</div>
		<div class="right">
			<div class="top">
				<div class="menufold" @click="fold=!fold">
					<i class="el-icon-d-arrow-left" :style="fold?'transform:rotate(180deg)':''"></i>
				</div>
				<div class="titlename"></div>
				<div class="time">{{now}}</div>
				<div class="accountinfo">
					<div class="avatar" :class="{exist:headImg}" :style="{backgroundImage:'url('+headImg+')'}"><i class="el-icon-s-custom"></i></div>
					<el-dropdown class="dropdowninfos" placement="bottom" @command="handleCommand">
						<span class="el-dropdown-link">{{$store.state.app.user.realName}}<i class="el-icon-caret-bottom el-icon--right"></i></span>
						<el-dropdown-menu slot="dropdown" trigger="click">
							<el-dropdown-item command="password">修改密码</el-dropdown-item>
							<el-dropdown-item command="exit">退出</el-dropdown-item>
						</el-dropdown-menu>
					</el-dropdown>
				</div>
			</div>
			<com-pagetabs class="pagetabs" ref="tabs" :page="$refs.page"/>
			<div class="pagecontent">
				<com-page ref="page" :noframe="$route.meta.frame==false"></com-page>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	data(){
		return {
			headImg:this.$store.state.app.user.headImg?WEBCONFIG.resourcePath+this.$store.state.app.user.headImg:null,//require('../assets/img/headimg.jpg'),
			menus:this.$router.options.routes.filter(r=>r.path=='/')[0].children.filter(r=>r.hidden!=true),
			now:'',
			fold:false,
		};
	},
	mounted(){
		this.timeInterval=setInterval(()=>{
			var now=this.$moment().format('ll LTS');
			this.now=now;
		},1000);
	},
	methods:{
		menuSelect(path){
			if(this.$route.path!=path){
				this.$router.push(path);
			}
		},
		handleCommand(command) {
			if(command=='exit'){
				this.logout();
			}
			else if(command=='password'){
				let username = this.$store.state.app.user.username;
				this.$dialog('password_detail',{type:'edit',data:{username:username}},()=>{
					this.$msgbox('修改完成，下次登录后生效');
				});
			}
		},
		logout(){
			this.$store.commit('removeToken');
			this.$router.push({name:'login'});
		},
	},
	destroyed(){
		clearInterval(this.timeInterval);
	}
}
</script>

<style lang="scss">
.com-border{background:white;box-shadow:0px 4px 8px 0px rgba(96,131,248,0.1);border-radius:10px;padding:10px 20px;font-size:14px}
.com-title{border-left:3px solid #409EFF;color:#14243E;padding-left:12px;}
</style>
<style lang="scss" scoped>
.menuscon /deep/{
	.menus{
		background:#304156;
		.el-submenu__title{
			color:#bfcbd9;height:50px;line-height:50px;
			&:hover{background:#263445;}
		}
		.el-menu-item{
			color:#bfcbd9;height:50px;line-height:50px;background:#304156;
			&:hover{background:#263445;}
		}
		i{color:inherit;}
		.el-menu-item.is-active{
			color:#409EFF;
		}
		.el-menu--inline{
			background:#1f2d3d;
			.el-menu-item{
				background:#1f2d3d;
				&:hover{background:#001528}
			}
		}
		.el-submenu.is-active{
			.el-submenu__title{color:#f4f4f5;}
		}
		&.el-menu{border-right:0;}
		&:not(.el-menu--collapse){height:100%;width:230px;}
	}
}
.main{
	height:100%;display:flex;
	.left{
		display:flex;flex-direction:column;background:white;width:230px;flex-shrink:0;
		z-index:110;transition:width .3s;background:#304156;
		.head{
			display:flex;align-items:center;height:60px;flex-shrink:0;justify-content:center;border-bottom:1px solid #1f2d3d;
			color:#bfcbd9;font-size:26px;font-weight:bold;white-space:nowrap;transition:font-size .3s;
			&:before{content:'案例管理系统';}
		}
		.menuscon{
			padding-bottom:2px;overflow-y:hidden;overflow-x:hidden;transition:padding-left .3s;background:#304156;
			&:hover{overflow-y:auto;/*给不支持overlay的浏览器使用*/overflow-y:overlay;}
			&::-webkit-scrollbar {
				width:7px;
				height:7px;
			}
			&::-webkit-scrollbar-thumb {
				background:#212d3c;
			}
		}
		&.fold{
			width:64px;
			.head{font-size:13px;
				&:before{content:'案例';}
			}
		}
	}
	.right{
		flex-grow:1;background:#F5F9FF;display:flex;flex-direction:column;position:relative;
		.right-drawer{position:absolute;top:0;bottom:0;left:-1px;z-index:101;background:white;border-left:1px solid #CDCDCD;transform:translateX(-100%);transition:transform .3s;}
		.top{
			height:60px;flex-shrink:0;background:#304156;display:flex;align-items:center;color:#bfcbd9;
			.menufold{border-left:1px solid #bfcbd9;width:60px;display:flex;
				align-items:center;justify-content:center;font-size:24px;cursor:pointer;align-self:stretch;
				i{transition:transform .3s;}
			}
			.menufold:hover{color:white;}
			.titlename{
				margin-left:30px;flex-grow:1;color:white;font-size:20px;display:flex;align-items:center;
			}
			.time{margin-right:50px;}
			.accountinfo{
				display:flex;align-items:center;margin-right:25px;
				.avatar{
					background:#56677c no-repeat center/cover;
					width:35px;height:35px;border-radius:50%;display:flex;align-items:center;justify-content:center;
					&.exist{
						i{display:none;}
					}
				}
				.dropdowninfos{
					cursor:pointer;margin-left:15px;color:inherit;
				}
			}
		}
		.pagetabs{margin-bottom:10px;}
		.pagecontent{flex-grow:1;display:flex;overflow-y:auto;}
	}
}
</style>