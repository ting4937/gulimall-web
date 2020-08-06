# projectcase

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### 创建步骤
1. 修改 package.json 和 package-lock.json 中name为项目名
2. 修改 vue.config.js 中title为网页的标签名
3. 修改 webconfig.js 中服务器地址 (config中的测试选项需要在正式上线后删除或者注释)
4. 默认 config.js 中 `permission:{static:true}` 为静态固定路由，如想设置动态路由请把 `static:true` 去除
5. 修改 layout.vue 中系统的名字（在css中）