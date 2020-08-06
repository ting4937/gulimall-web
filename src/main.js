import Vue from 'vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
//import 'element-ui/lib/theme-chalk/index.css'
import './styles/common.scss'
import './styles/theme.scss'
import echarts from 'echarts'
import UIMaker from './components/uimaker/index.js'
import CommonUI from './components/common/index.js'
import request from './utils/request.js'
import permission from './utils/permission.js'
import common from './utils/common.js'
import config from './config.js'
import App from './App.vue'

Vue.config.productionTip = false

//如想按需加载请自己设置echarts所加载的组件
/*const echarts=equire([
  'bar',
  'line',
  'tooltip'
])*/
Vue.use(ElementUI);
Vue.use(common);
var configs=common.merge(config,WEBCONFIG.config);
Vue.use(UIMaker,configs.uimaker);
Vue.use(CommonUI,configs.commonui);
Vue.use(request);
Vue.use(permission,config.permission);

Vue.prototype.$echarts = echarts;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
