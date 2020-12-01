### 市民通小程序开发
采用用框架，基于微信官方的提供的wepy，官方网站：https://tencent.github.io/wepy/index.html

### wepy特点
- 类Vue开发风格
- 支持自定义组件开发
- 支持引入NPM包
- 支持Promise
- 支持ES2015+特性，如Async Functions
- 支持多种编译器，Less/Sass/Stylus/PostCSS、Babel/Typescript、Pug
- 支持多种插件处理，文件压缩，图片压缩，内容替换等
- 支持 Sourcemap，ESLint等
- 小程序细节优化，如请求列队，事件优化等
  
### 编译命令
实时编译
```
npm run dev
```
正式编译打包
```
npm run build
```

### 前端框架

#### WeUI for 小程序
[WeUI](https://github.com/Tencent/weui-wxss)是一套同微信原生一致视觉体验的基础样式库，项目中已经集成了weui.wxss，在样式中可以直接使用。可以参考diss/example例子

#### vant-weapp
[vant-weapp](https://github.com/youzan/vant-weapp)是移动端vue组件库Vant的小程序版本，轻量级、可靠。在市民通小程序中并没有全部引入，由于小程序包大小有限制，不建议在小程序中引入过多的第三方库，即使引入也需要控制大小。
- src/vant 添加需求增加的组件
- 引入方法 需要使用的页面添加usingComponents
```
  config = {
    usingComponents: {
      'van-search': '/vant/search/index'
    }
  }
```

### 注意事项

- 如果Ui设计图是基于375像素，设计图中的每个1px=2rpx, 字体单位采用pt
- 组件列表渲染：不能够做的很好的支持，推荐在组件内的进行循环渲染
- view 点击事件传递，采用data-demo="{{demo}}" demo是忽略大小写
- scroll-view正常滑动需要设置高度（一般设置100%）
- 两个scroll-view联动滑动，可以通过设置scroll-top的值实现scroll-view的纵向滑动，滑动距离的获取可以通过wepy.createSelectorQuery().selectAll('.class').boundingClientRect()获取每个item在滚动视图中的高度单位是px
- [canvas 坑的地方](https://developers.weixin.qq.com/blogdetail?action=get_post_info&lang=zh_CN&token=&docid=4a9bd87666e8fd5183e98b2d94b56805)
- 重要：关闭es6转es5，未关闭项目运行会报错
- 重要：关闭上传代码时自动补全
- 关闭上传代码压缩 开启后，会导致真机computed, props.sync 等等属性失效
- app中globalData只能在page对象中赋值，其他地方例如组件、mixins中只能读取不能够赋值

### 代码规范

```
原 bindtap="click" 替换为 @tap="click"，原catchtap="click"替换为@tap.stop="click"。

原 capture-bind:tap="click" 替换为 @tap.capture="click"，原capture-catch:tap="click"替换为@tap.capture.stop="click"

事件传参使用优化后语法代替。 原bindtap="click" data-index={{index}}替换为@tap="click({{index}})" 适合单个参数，对于对象的传递使用data-XXX更好些
```

### 引入插件

插件引入步骤：
- 在小程序管理平台设置-第三方设置-开通插件
- 添加插件-搜索腾讯位置服务路线规划-选择添加

路线查询引入了腾讯位置服务路线规划插件详情见[《插件开发文档》](https://mp.weixin.qq.com/wxopen/plugindevdoc?appid=wx50b5593e81dd937a&token=1074144245&lang=zh_CN)