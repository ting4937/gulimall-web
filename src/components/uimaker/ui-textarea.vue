<template>
	<ui-text type="textarea" :maxlength="maxlength" :minlength="minlength" :show-word-limit="showWordLimit" :novalidate="novalidate" :description="description" :rules="rules" :overflowWidth="overflowWidth" :nomessage="nomessage" :value="value" @input="$emit('input',$event);" @change="$emit('change',$event);" :required="required" :view="view" ref="control" />
</template>

<script>
export default {
	name:'ui-textarea',
	props:{
		value:{type:String,default:''},
		required:{type:Boolean,default:false},
		view:{type:Boolean,default:false},
		description:{type:String,default:''},
		novalidate:{type:Boolean,default:false},
		nomessage:{type:Boolean,default:false},
		overflowWidth:{type:String,default:''},
		maxlength:{type:Number},
		minlength:{type:Number},
		showWordLimit:{type:Boolean,default:true},
		rules:{type:Array,default:()=>[]}
	},
	data(){
		return {
			columns:Infinity
		};
	},
	created(){},
	methods:{
		validate(){
			return this.$refs.control.validate();
		},
		setTestValue(label,params){
			return this.$refs.control.setTestValue(label,params);
		},
		getMessage(){
			return this.$refs.control.getMessage();
		},
		reset(){
			return this.$refs.control.reset();
		}
	}
}
</script>

<style scoped>
</style>