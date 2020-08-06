<template>
	<div :class="noframe?'noframe':'content'">
		<!--<div class="title"><span>{{title}}</span></div>-->
		<keep-alive>
			<component ref="page" :is="page"/>
		</keep-alive>
	</div>
</template>

<script>
export default {
	name:'com-page',
	props:{
		title:{default:''},
		noframe:{type:Boolean,default:false},
	},
	data(){
		return {
			page:'',
		};
	},
	created(){
		this.page=this.$route.name;
	},
	watch:{
		'$route'(route){
			this.page=route.name;
		}
	},
	methods:{
		refresh(){
			let page=this.page;
			this.page='';
			this.clearCache([page]);
			this.$nextTick(()=>{
				this.page=page;
			});
		},
		clearCache(arr){
			var caches=this.$refs.page.$vnode.parent.componentInstance.cache;
			for(var name in caches){
				if(arr.indexOf(name.split('::')[1])!=-1){
					delete caches[name];
				}
			}
		}
	},
}
</script>

<style lang="scss" scoped>
/*.content{
	font-size:14px;margin:15px;font-family:-webkit-body;padding:15px 20px 20px 20px;background-color:white;
	border-radius:3px;line-height:1.2;box-shadow: 0 3px 10px rgba(0, 0, 0, 0.23), 0 3px 10px rgba(0, 0, 0, 0.16);
	display:flex;flex-direction:column;overflow-y:overlay;flex-grow:1;margin-top:20px;
	.title{
		text-align:center;display:flex;justify-content:center;margin-bottom:35px;
		&>span{
			background-image:url(../../assets/img/bookmark.png);background-repeat:no-repeat;background-size:contain;width:172px;height:42px;line-height:42px;
			display:inline-block;color:white;font-size:18px;position:absolute;transform: translateY(-22px);z-index:100;
			text-shadow: 0 0 18px rgba(255, 255, 255, 1);
		}
	}
}*/
.content{font-family:-webkit-body;padding:15px;margin:10px;margin-top:0;flex-grow:1;display:flex;flex-direction:column;
	background:white;box-shadow:0px 4px 8px 0px rgba(96,131,248,0.1);border-radius:10px;}
.noframe{display:contents;}
</style>