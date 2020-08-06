<template>
	<el-switch v-if="!view" :value="value==activeValue" @input="$emit('input',$event?activeValue:inactiveValue)" @change="$emit('change',$event?activeValue:inactiveValue)"/>
	<div v-else class="uimaker-view">
		<template v-if="tag">
			<el-tag :type="value==activeValue?'success':'danger'" size="small">{{htmlValue}}</el-tag>
		</template>
		<template v-else>
			{{htmlValue}}
		</template>
	</div>
</template>

<script>
export default {
	name:'ui-switch',
	props:{
		value:{default:'0'},
		required:{type:Boolean,default:false},
		view:{type:Boolean,default:false},
		tag:{type:Boolean,default:false},
		activeValue:{default:'1'},
		inactiveValue:{default:'0'},
	},
	created(){},
	methods:{
		setTestValue(){
			this.$emit('input',parseInt(Math.random()*2));
		},
		valueToText(value){
			return value==this.activeValue?'是':'否';
		}
	},
	computed:{
		htmlValue(){
			return this.value==this.activeValue?'是':'否';
		}
	},
}
</script>

<style scoped>
</style>