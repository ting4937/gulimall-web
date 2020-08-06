<template>
	<div class="ui-validate" @keypress.enter="$emit('enter',$event)" :class="{'is-error':!novalidate&&value!='','is-success':!novalidate&&verifying&&value==''}">
		<slot></slot>
		<div class="el-form-item__error" v-if="!novalidate&&!nomessage&&value!=''">{{value}}</div>
	</div>
</template>

<script>
export default {
	props:{
		value:{default:''},
		verifying:{default:false},
		novalidate:{type:Boolean,default:false},
		nomessage:{type:Boolean,default:false},
	},
	created(){}
}
</script>

<style scoped>
</style>
<style>
.ui-validate{position:relative;}
.is-error .el-input__inner,.is-error .el-input__inner:focus,
.is-error .el-textarea__inner,.is-error .el-textarea__inner:focus{border-color: #f56c6c;}
.is-success .el-input__inner,.is-success .el-input__inner:focus,
.is-success .el-textarea__inner,.is-success .el-textarea__inner:focus{border-color: #67c23a;}
</style>