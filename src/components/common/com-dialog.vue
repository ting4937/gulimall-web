<template>
	<el-dialog ref="dialog" :class="{'com-dialog-draggable':draggable,'com-dialog-nopadding':nopadding,'com-dialog-fullscreen':fullscreen}" :visible.sync="selfVisible"
		:width="width | widthConvert" :custom-class="customClass" :close-on-click-modal="false" :title="title" :fullscreen="fullscreen" @closed="close">
		<component :is="component" :params="params" :close="closeEvent"/>
	</el-dialog>
</template>

<script>
export default {
	name:'com-dialog',
	props:{
		visible:{default:false},
		draggable:{default:true},
		nopadding:{default:false},
		fullscreen:{default:false},
		width:{default:'1200px'},
		title:{default:'详情'},
		customClass:{},
		component:{},
		params:{},
		closeEvent:{}
	},
	data(){
		return {
			selfVisible:false,
		};
	},
	filters: {
		widthConvert(val){
			if (!val) return '';
			if(typeof val=='number'||/^\d+$/.test(val)){
				return val+'px';
			}
			return val;
		}
	},
	created(){
		this.$nextTick(()=>{
			if(this.draggable){
				this.bindDrag(this.$refs.dialog.$el);
			}
		});
	},
	watch:{
		selfVisible(val){
			this.$emit('update:visible',val);
		},
		visible(val){
			this.selfVisible=val;
		}
	},
	methods:{
		bindDrag(el) {
			const dialogHeaderEl = el.querySelector('.el-dialog__header')
			const dragDom = el.querySelector('.el-dialog')
			dialogHeaderEl.style.cssText += ';cursor:move;'
			dragDom.style.cssText += ';top:0px;'
		
			// 获取原有属性 ie dom元素.currentStyle 火狐谷歌 window.getComputedStyle(dom元素, null);
			const getStyle = (function() {
				if (window.document.currentStyle) {
					return (dom, attr) => dom.currentStyle[attr]
				} else {
					return (dom, attr) => getComputedStyle(dom, false)[attr]
				}
			})()
		
			dialogHeaderEl.onmousedown = (e) => {
				// 鼠标按下，计算当前元素距离可视区的距离
				const disX = e.clientX - dialogHeaderEl.offsetLeft
				const disY = e.clientY - dialogHeaderEl.offsetTop
		
				const dragDomWidth = dragDom.offsetWidth
				const dragDomHeight = dragDom.offsetHeight
		
				const screenWidth = document.body.clientWidth
				const screenHeight = document.body.clientHeight
		
				const minDragDomLeft = dragDom.offsetLeft
				const maxDragDomLeft = screenWidth - dragDom.offsetLeft - dragDomWidth
		
				const minDragDomTop = dragDom.offsetTop
				const maxDragDomTop = screenHeight - dragDom.offsetTop - dragDomHeight
		
				// 获取到的值带px 正则匹配替换
				let styL = getStyle(dragDom, 'left')
				let styT = getStyle(dragDom, 'top')
		
				if (styL.includes('%')) {
					styL = +document.body.clientWidth * (+styL.replace(/\%/g, '') / 100)
					styT = +document.body.clientHeight * (+styT.replace(/\%/g, '') / 100)
				} else {
					styL = +styL.replace(/\px/g, '')
					styT = +styT.replace(/\px/g, '')
				}
		
				document.onmousemove = (e)=>{
					// 通过事件委托，计算移动的距离
					let left = e.clientX - disX
					let top = e.clientY - disY
		
					// 边界处理
					if (-(left) > minDragDomLeft) {
						left = -minDragDomLeft
					} else if (left > maxDragDomLeft) {
						left = maxDragDomLeft
					}
		
					if (-(top) > minDragDomTop) {
						top = -minDragDomTop
					} else if (top > maxDragDomTop) {
						top = maxDragDomTop
					}
		
					// 移动当前元素
					dragDom.style.cssText += `;left:${left + styL}px;top:${top + styT}px;`
		
					this.$emit('drag',el)
				}
		
				document.onmouseup = (e)=>{
					document.onmousemove = null
					document.onmouseup = null
				}
			}
		},
		close(){
			this.$emit('close');
		}
	},
}
</script>

<style lang="scss">
.com-dialog-draggable .el-dialog{margin:0 auto;}
.com-dialog-nopadding .el-dialog__body{padding:0;}
.com-dialog-fullscreen .el-dialog{
	display:flex;flex-direction:column;
	.el-dialog__body{flex-grow:1;overflow:auto;height:100%;}
}
.el-dialog__header{
	background:#FAFAFA;border-bottom:1px solid #EBEEF5;padding-top:10px;
	.el-dialog__title{font-size:16px;}
	.el-dialog__headerbtn{top:15px;}
}
</style>