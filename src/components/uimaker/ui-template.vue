<template>
	<div @click="$emit('click',$event)"><slot></slot></div>
</template>

<script>
export default {
	name:'ui-template',
	props:{
		required:{type:Boolean,default:false}
	},
	data(){
		return {
			columns:Infinity
		};
	},
	methods:{
		/*validate(){
			var isValid=true;
			if(this.$slots.default!=null){
				for(var i=0;i<this.$slots.default.length;i++){
					let ctl=this.$slots.default[i];
					if(ctl.componentInstance!=null&&ctl.componentInstance.validate!=null){
						isValid=ctl.componentInstance.validate()?isValid:false;
					}
				}
			}
			return isValid;
		}*/
	},
}
</script>

<style>
</style>