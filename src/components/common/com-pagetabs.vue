<template>
	<div class="com-pagetabs" :class="{'default-theme':!nostyle}" ref="tabs" @mousewheel="mousewheel" @contextmenu.prevent="contextmenu">
		<div class="pagetabscon" ref="tabscon" @contextmenu.stop="" :style="{transform:'translateX('+pagetabsLeft+'px)'}">
			<div class="pagetab" ref="tab" :class="{selected:$route.name==tab.name,'selected-prev':index<pagetabs.length-1&&$route.name==pagetabs[index+1].name}" v-for="(tab,index) in pagetabs" :key="index" 
				@click="redirect(tab)" @contextmenu.prevent="$refs.tabmenu[index].click()">
				<span>{{tab.title}}</span>
				<el-dropdown @command="tabCommand($event,index)" trigger="click" placement="top">
					<div ref="tabmenu"></div>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item command="refresh">刷新</el-dropdown-item>
						<el-dropdown-item command="close" v-if="index!=0" divided>关闭</el-dropdown-item>
						<el-dropdown-item command="closeOther">关闭其他</el-dropdown-item>
						<el-dropdown-item command="closeLeft" v-if="index!=0">关闭左侧所有</el-dropdown-item>
						<el-dropdown-item command="closeRight" v-if="index!=pagetabs.length-1">关闭右侧所有</el-dropdown-item>
						<el-dropdown-item command="closeAll">关闭全部</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
				<i class="el-icon-close" v-if="index!=0" @click.stop="removeTab(index)"></i>
			</div>
		</div>
		<el-dropdown @command="tabCommand($event,tabIndex)" trigger="click" placement="top" :style="{left:contextmenuPosition.left+'px',top:contextmenuPosition.top+'px'}">
			<div ref="menu"></div>
			<el-dropdown-menu slot="dropdown">
				<el-dropdown-item command="refresh">刷新</el-dropdown-item>
				<el-dropdown-item command="close" v-if="tabIndex!=0" divided>关闭</el-dropdown-item>
				<el-dropdown-item command="closeOther">关闭其他</el-dropdown-item>
				<el-dropdown-item command="closeLeft" v-if="tabIndex!=0">关闭左侧所有</el-dropdown-item>
				<el-dropdown-item command="closeRight" v-if="tabIndex!=pagetabs.length-1">关闭右侧所有</el-dropdown-item>
				<el-dropdown-item command="closeAll">关闭全部</el-dropdown-item>
			</el-dropdown-menu>
		</el-dropdown>
	</div>
</template>

<script>
export default {
	name:'com-pagetabs',
	props:{
		page:{type:Object},
		nostyle:{type:Boolean,default:false},
	},
	data(){
		return {
			pagetabsLeft:0,
			pagetabs:[{name:this.$getFirstPage().name,title:this.$getFirstPage().meta.title}],
			tabIndex:null,
			contextmenuPosition:{left:0,top:0},
		};
	},
	mounted(){
		this.changeTab(false,true);
	},
	watch:{
		'$route'(route){
			if(route.params._close==true){
				this.removeTab(this.tabIndex,false);
				delete route.params._close;
			}
			this.changeTab();
		}
	},
	methods:{
		contextmenu(e){
			this.contextmenuPosition={left:e.offsetX,top:e.offsetY-20};
			this.$nextTick(()=>{
				this.$refs.menu.click();
			});
		},
		redirect(tab){
			if(this.$route.name!=tab.name){
				this.$router.push({name:tab.name,params:tab.params});
			}
		},
		mousewheel(e){
			var tabsWidth=this.$refs.tabs.clientWidth;
			var tabsconWidth=this.$refs.tabscon.clientWidth;
			
			var offset=100;
			if(e.deltaY>0){ //向下滚动
				if(tabsconWidth<tabsWidth){
					offset=0;
				}
				else if(tabsconWidth-tabsWidth+this.pagetabsLeft<offset){
					offset=tabsconWidth-tabsWidth+this.pagetabsLeft;
				}
				this.pagetabsLeft-=offset;
			}
			else if(e.deltaY<0){ //向上滚动
				if(tabsconWidth<tabsWidth&&this.pagetabsLeft==0){
					offset=0;
				}
				else if(-this.pagetabsLeft<offset){
					offset=-this.pagetabsLeft;
				}
				this.pagetabsLeft+=offset;
			}
		},
		removeTab(index,isLink=true){
			var tabs=this.pagetabs.splice(index,1);
			this.page.clearCache(tabs.map(p=>p.name));
			if(isLink&&tabs[0].name==this.$route.name){
				let pagetab=this.pagetabs[index-1];
				this.$router.push({name:pagetab.name,params:pagetab.params});
			}
		},
		tabCommand(command,index) {
			if(command=='refresh'){
				this.page.refresh();
			}
			else if(command=='close'){
				this.removeTab(index);
			}
			else if(command=='closeOther'){
				var tabrs=this.pagetabs.splice(index+1);
				var tabs=this.pagetabs.splice(1,index-1);
				this.page.clearCache(tabs.concat(tabrs).map(p=>p.name));
				this.changeTab(true);
			}
			else if(command=='closeLeft'){
				var tabs=this.pagetabs.splice(1,index-1);
				this.page.clearCache(tabs.map(p=>p.name));
				this.changeTab(true);
			}
			else if(command=='closeRight'){
				var tabs=this.pagetabs.splice(index+1);
				this.page.clearCache(tabs.map(p=>p.name));
				this.changeTab();
			}
			else if(command=='closeAll'){
				var tabs=this.pagetabs.splice(1);
				this.page.clearCache(tabs.map(p=>p.name));
				this.redirect(this.pagetabs[0]);
			}
		},
		changeTab(isReset,isFirstLoad){
			let tabIndex=null;
			for(var i=0;i<this.pagetabs.length;i++){
				if(this.pagetabs[i].name==this.$route.name){
					tabIndex=i;
					break;
				}
			}
			if(tabIndex==null){
				//如果router文件设置 nofirstload:true,当前页面通过刷新浏览器就不会作为一个可直接显示的页面
				if(isFirstLoad&&this.$route.meta.nofirstload){
					this.$router.replace({path:'/'});
				}
				else{
					this.pagetabs.push({name:this.$route.name,title:this.$route.meta.title,params:this.$route.params});
				}
				tabIndex=this.pagetabs.length-1;
			}
			else{
				this.pagetabs[tabIndex].params=this.$route.params;
			}
			this.tabIndex=tabIndex;
			
			this.$nextTick(()=>{
				if(isReset){
					this.pagetabsLeft=0;
					return;
				}
				var tabsWidth=this.$refs.tabs.clientWidth;
				var tabsconStyle=getComputedStyle(this.$refs.tabscon);
				var tabStyle=getComputedStyle(this.$refs.tab[tabIndex]);
				var tabOffsetLeft=this.$refs.tab[tabIndex].offsetLeft-parseInt(tabStyle.marginLeft);
				if(tabIndex==0){
					tabOffsetLeft-=parseInt(tabsconStyle.paddingLeft);
				}
				var tabWidth=this.$refs.tab[tabIndex].offsetWidth+parseInt(tabStyle.marginLeft)+parseInt(tabStyle.marginRight);
				if(tabIndex==this.$refs.tab.length-1){
					tabOffsetLeft+=parseInt(tabsconStyle.paddingRight);
				}

				if(tabOffsetLeft<-this.pagetabsLeft){
					this.pagetabsLeft=-tabOffsetLeft;
				}
				else if(tabOffsetLeft>tabsWidth-this.pagetabsLeft-tabWidth){
					this.pagetabsLeft=tabsWidth-(tabOffsetLeft+tabWidth);
				}
			});
		}
	},
}
</script>

<style lang="scss">
.com-pagetabs.default-theme{
	height:38px;overflow:hidden;flex-shrink:0;position:relative;border-bottom:1px solid #DBDBDB;background:white;
	.pagetabscon{
		position:absolute;display:flex;white-space:nowrap;transition:transform .3s;padding:0 1px;
		.pagetab{
			color:#495060;margin:3px 2px;
			padding:5px 14px;font-size:14px;display:flex;align-items:center;cursor:pointer;border:1px solid #d8dce5;
			i{
				margin-left:8px;color:#bbbec3;transform:scale(.9); 
				&:hover{font-weight:bold;}
			}
			&.selected{
				background:#4CB7A3;color:white;border-color:transparent;
				i{color:white;}
				&:before{content:'';background:white;width:10px;height:10px;border-radius:50%;margin-right:8px;}
			}
		}
	}
}
</style>