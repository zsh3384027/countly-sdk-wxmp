module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1603337650694, function(require, module, exports) {
!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.Countly=t():e.Countly=t()}(window,(function(){return function(e){var t={};function i(n){if(t[n])return t[n].exports;var s=t[n]={i:n,l:!1,exports:{}};return e[n].call(s.exports,s,s.exports,i),s.l=!0,s.exports}return i.m=e,i.c=t,i.d=function(e,t,n){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var s in e)i.d(n,s,function(t){return e[t]}.bind(null,s));return n},i.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="",i(i.s=0)}([function(e,t,i){e.exports=i(1)},function(e,t,i){function n(e,t,i,n,s,o,r){try{var a=e[o](r),u=a.value}catch(e){return void i(e)}a.done?t(u):Promise.resolve(u).then(n,s)}function s(e){return(s="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function r(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function a(e,t,i){return t&&r(e.prototype,t),i&&r(e,i),e}i.r(t);var u=wx.getSystemInfoSync(),c=!1,h=function(){function e(){var t=this;o(this,e),function(e,t,i){t in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i}(this,"userData",{set:function(e,i){t.customData[e]=i},unset:function(e){t.customData[e]=""},set_once:function(e,i){t.changeCustomProperty(e,i,"$setOnce")},increment:function(e){t.changeCustomProperty(e,1,"$inc")},increment_by:function(e,i){t.changeCustomProperty(e,i,"$inc")},multiply:function(e,i){t.changeCustomProperty(e,i,"$mul")},max:function(e,i){t.changeCustomProperty(e,i,"$max")},min:function(e,i){t.changeCustomProperty(e,i,"$min")},push:function(e,i){t.changeCustomProperty(e,i,"$push")},push_unique:function(e,i){t.changeCustomProperty(e,i,"$addToSet")},pull:function(e,i){t.changeCustomProperty(e,i,"$pull")},save:function(){t.toRequestQueue({user_details:JSON.stringify({custom:t.customData})}),t.customData={}}}),this.startTime=this.getTimestamp(),this.apiPath="/i",this.requestQueue=[],this.eventQueue=[],this.crashLogs=[],this.sessionStarted=!1,this.lastBeat=0,this.lastMsTs=0,this.failTimeout=0,this.crashSegments=null,this.customData={},this.trackSession=!1}var t,i;return a(e,[{key:"init",value:function(t){this.beatInterval=this.getConfig("interval",t,500),this.queueSize=this.getConfig("queue_size",t,1e3),this.sessionUpdate=this.getConfig("session_update",t,60),this.maxEventBatch=this.getConfig("max_events",t,10),this.failTimeoutAmount=this.getConfig("fail_timeout",t,60),this.maxCrashLogs=this.getConfig("max_logs",t,100),e.namespace=this.getConfig("namespace",t,""),e.debug=this.getConfig("debug",t,!1),e.app_key=this.getConfig("app_key",t,!1),e.url=this.stripTrailingSlash(this.getConfig("url",t,"")),e.app_version=this.getConfig("app_version",t,"0.0"),e.device_id=this.getConfig("device_id",t,this.getId()),e.force_post=this.getConfig("force_post",t,!1),e.ignore_visitor=this.getConfig("ignore_visitor",t,!1),e.track_page=this.getConfig("track_page",t,!1),e.track_errors=this.getConfig("track_errors",t,!1),e.city_code=this.getConfig("city_code",t,0),e.city_name=this.getConfig("city_name",t,""),e.q=e.q||[],e.device_id!==this.store("cly_id")&&this.store("cly_id",e.device_id),this.log("Countly initialized"),this.setOnWindowResizeListener(),this.heartBeat()}},{key:"heartBeat",value:function(){var t=this;if(void 0!==e.q&&e.q.length>0){for(var i=0;i<e.q.length;i++){var n=e.q[i];if(n.constructor===Array&&n.length>0)if(this.log("Processing queued call",n),void 0!==this[n[0]])this[n[0]].apply(this,n.slice(1));else{var s=n[0].replace("userData.","");void 0!==this.userData[s]&&this.userData[s].apply(this,n.slice(1))}}e.q=[]}if(this.sessionStarted){var o=this.getTimestamp();o-this.lastBeat>60&&(this.session_duration(o-this.lastBeat),this.lastBeat=o)}if(this.eventQueue.length>0){if(this.eventQueue.length<=this.maxEventBatch)this.toRequestQueue({events:JSON.stringify(this.eventQueue)}),this.eventQueue=[];else{var r=this.eventQueue.splice(0,this.maxEventBatch);this.toRequestQueue({events:JSON.stringify(r)})}this.store("cly_event",this.eventQueue)}if(this.requestQueue.length>0&&this.getTimestamp()>this.failTimeout){var a=this.requestQueue.shift();this.log("Processing request",a),this.sendHttpRequest(e.url+this.apiPath,a,(function(e){t.log("Request Finished",a,e),e?(t.requestQueue.unshift(a),t.failTimeout=t.getTimestamp()+t.failTimeoutAmount):t.store("cly_queue",t.requestQueue)})),this.store("cly_queue",this.requestQueue)}setTimeout((function(){t.heartBeat()}),this.beatInterval)}},{key:"track_session",value:function(){this.trackSession=!0,this.begin_session()}},{key:"begin_session",value:function(){if(this.trackSession&&!this.sessionStarted){this.log("Session started"),this.lastBeat=this.getTimestamp(),this.sessionStarted=!0;var e={begin_session:1,metrics:JSON.stringify(this.getMetrics())};this.report_orientation(),this.toRequestQueue(e)}}},{key:"session_duration",value:function(e){this.sessionStarted&&(this.log("Session extended",e),this.toRequestQueue({session_duration:e}))}},{key:"end_session",value:function(){this.trackSession&&this.sessionStarted&&(this.log("Ending session"),this.sessionStarted=!1,this.toRequestQueue({end_session:1,session_duration:this.getTimestamp()-this.lastBeat}))}},{key:"report_orientation",value:function(e){this.add_event({key:"[CLY]_orientation",segmentation:{mode:e||u.deviceOrientation}})}},{key:"setOnWindowResizeListener",value:function(){var e=this;wx.onWindowResize((function(t){if(t&&t.size){var i=t.size.windowWidth>t.size.windowHeight?"landscape":"portrait";e.report_orientation(i)}}))}},{key:"add_event",value:function(t){if(!e.ignore_visitor)if(t.key){t.count||(t.count=1);var i=this.getProperties(t,["key","count","sum","dur","segmentation"]);i.timestamp=this.getMsTimestamp();var n=new Date;i.hour=n.getHours(),i.dow=n.getDay(),this.eventQueue.push(i),this.store("cly_event",this.eventQueue),this.log("Adding event: ",t)}else this.log("Event must have key property")}},{key:"getProperties",value:function(e,t){for(var i={},n=0;n<t.length;n++){var s=t[n];void 0!==e[s]&&(i[s]=e[s])}return i}},{key:"toRequestQueue",value:function(t){e.ignore_visitor||(e.app_key&&e.device_id?(this.prepareRequest(t),this.requestQueue.length>this.queueSize&&this.requestQueue.shift(),this.requestQueue.push(t),this.store("cly_queue",this.requestQueue)):this.log("app_key or device_id is missing"))}},{key:"prepareRequest",value:function(t){t.app_key=e.app_key,t.device_id=e.device_id,t.sdk_name="javascript_native_WXMP",t.sdk_version="1.0",t.timestamp=this.getMsTimestamp();var i=new Date;t.hour=i.getHours(),t.dow=i.getDay()}},{key:"getMsTimestamp",value:function(){var e=(new Date).getTime();return this.lastMsTs>=e?this.lastMsTs++:this.lastMsTs=e,this.lastMsTs}},{key:"getMetrics",value:function(){var t={_app_version:e.app_version};return u&&(t._resolution="".concat(u.screenWidth,"x").concat(u.screenHeight),t._density=u.pixelRatio,t._locale=u.language,t._os_version=u.system,t._os=u.platform,t._device=u.brand,t._browser="wechat",t._browser_version=u.version),this.log("Got metrics",t),t}},{key:"getConfig",value:function(t,i,n){return i&&void 0!==i[t]?i[t]:void 0!==e[t]?e[t]:n}},{key:"log",value:function(){e.debug&&"undefined"!=typeof console&&(arguments[1]&&"object"===s(arguments[1])&&(arguments[1]=JSON.stringify(arguments[1])),console.log(Array.prototype.slice.call(arguments).join("\n")))}},{key:"stripTrailingSlash",value:function(e){return"/"===e.substr(e.length-1)?e.substr(0,e.length-1):e}},{key:"getTimestamp",value:function(){return Math.floor((new Date).getTime()/1e3)}},{key:"getId",value:function(){return this.store("cly_id")||this.generateUUID()}},{key:"generateUUID",value:function(){var e=(new Date).getTime();return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(function(t){var i=(e+16*Math.random())%16|0;return e=Math.floor(e/16),("x"===t?i:3&i|8).toString(16)}))}},{key:"store",value:function(t,i){var n=e.namespace+t;if(null!=i)try{wx.setStorageSync(n,e.serialize(i))}catch(e){this.log(e)}if(void 0===i)try{return e.deserialize(wx.getStorageSync(n))}catch(e){this.log(e)}if(null===i)try{wx.removeStorageSync(n)}catch(e){this.log(e)}}},{key:"sendHttpRequest",value:function(t,i,n){var s=this;this.log("Sending XML HTTP request");var o=this.prepareParams(i||{}),r="GET";(e.force_post||o.length>=2e3)&&(r="POST");var a=t;"GET"===r&&(a="".concat(t,"?").concat(o)),wx.request({url:a,method:r,data:"POST"===r?i:"",header:{"content-type":"application/json"},success:function(e){e.data&&"Success"===e.data.result?n(!1):(s.log(e.data.result),n(!0))},fail:function(){n(!0)}})}},{key:"prepareParams",value:function(e){var t=[];for(var i in e)e.hasOwnProperty(i)&&t.push("".concat(i,"=").concat(encodeURIComponent(e[i])));return t.join("&")}},{key:"add_log",value:function(e){this.crashLogs.length>this.maxCrashLogs&&this.crashLogs.shift(),this.crashLogs.push(e)}},{key:"log_error",value:function(e,t){this.recordError(e,!0,t)}},{key:"recordError",value:(t=regeneratorRuntime.mark((function e(t,i,n){var o,r,a,u,h;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n=n||this.crashSegments,o="","object"===s(t)?(void 0!==t.stack?o=t.stack:(void 0!==t.name&&(o+=t.name+":"),void 0!==t.message&&(o+=t.message+"\n"),void 0!==t.fileName&&(o+="in "+t.fileName+"\n"),void 0!==t.lineNumber&&(o+="on "+t.lineNumber),void 0!==t.columnNumber&&(o+=":"+t.columnNumber)),o||(o=JSON.stringify(t))):o=t+"",r=this.getMetrics(),(a={_resolution:r._resolution,_error:o,_app_version:r._app_version,_run:this.getTimestamp()-this.startTime})._not_os_specific=!0,a._nonfatal=!!i,e.next=9,this.getBatteryInfo();case 9:return u=e.sent,e.next=12,this.getNetworkType();case 12:h=e.sent,a._os=r._os,a._os_version=r._os_version,a._manufacture=r._device,a._online=h,u&&(a._bat=u),this.crashLogs.length>0&&(a._logs=this.crashLogs.join("\n")),a._background=c,this.crashLogs=[],void 0!==n&&n&&(a._custom={segments:n}),this.toRequestQueue({crash:JSON.stringify(a)});case 23:case"end":return e.stop()}}),e,this)})),i=function(){var e=this,i=arguments;return new Promise((function(s,o){var r=t.apply(e,i);function a(e){n(r,s,o,a,u,"next",e)}function u(e){n(r,s,o,a,u,"throw",e)}a(void 0)}))},function(e,t,n){return i.apply(this,arguments)})},{key:"getBatteryInfo",value:function(){return new Promise((function(e){wx.getBatteryInfo({success:function(t){e(t.level)},fail:function(){e()}})}))}},{key:"getNetworkType",value:function(){return new Promise((function(e){wx.getNetworkType({success:function(t){t&&"none"===t.networkType&&e(!1),e(!0)},fail:function(){e(!0)}})}))}},{key:"user_details",value:function(e){this.log("Adding userdetails: ",e);this.toRequestQueue({user_details:JSON.stringify(this.getProperties(e,["name","username","email","organization","phone","picture","gender","byear","custom"]))})}},{key:"changeCustomProperty",value:function(e,t,i){this.customData[e]||(this.customData[e]={}),"$push"===i||"$pull"===i||"$addToSet"===i?(this.customData[e][i]||(this.customData[e][i]=[]),this.customData[e][i].push(t)):this.customData[e][i]=t}}],[{key:"serialize",value:function(e){return"object"===s(e)&&(e=JSON.stringify(e)),e}},{key:"deserialize",value:function(e){try{e=JSON.parse(e)}catch(e){}return e}}]),e}(),l=new(function(){function e(){o(this,e),this.pageStack=[]}return a(e,[{key:"onPageStart",value:function(e){this.pageStack.push({name:e,startTime:Date.now()})}},{key:"onPageEnd",value:function(e){if(!(this.pageStack.length<=0||this.pageStack[this.pageStack.length-1].name!==e)){var t=this.pageStack.pop(),i=Date.now()-t.startTime,n={key:"页面加载",dur:i/1e3,segmentation:{"页面名称":t.name,"加载耗时":i+"","终端类型":"微信小程序"}};h.q.push(["add_event",n]),h.city_code&&(this.putIfKeyValueValid(n.segmentation,"城市编码",h.city_code),this.putIfKeyValueValid(n.segmentation,"城市名称",h.city_name),h.q.push(["add_event",n]))}}},{key:"putIfKeyValueValid",value:function(e,t,i){!t||!i&&isNaN(parseInt(i,10))||(e[t]=i+"")}}]),e}());try{var f=App;App=function(e){x(e,"onLaunch",(function(){h.q=h.q||[]})),x(e,"onShow",g),x(e,"onHide",p),x(e,"onError",d),x(e,"onPageNotFound",v),x(e,"onUnhandledRejection",y),f(e)}}catch(e){console.log("App重写异常")}function g(){c=!1,h.q.push(["begin_session"])}function p(){c=!0,h.q.push(["end_session"])}function d(e){h.track_errors&&h.q.push(["log_error",e])}function v(e){h.track_errors&&h.q.push(["log_error",e])}function y(e){h.track_errors&&h.q.push(["log_error",e])}try{var m=Page;Page=function(e){return x(e,"onShow",_),x(e,"onHide",k),x(e,"onUnload",k),m(e)}}catch(e){console.error("Page重写异常")}function _(){h.track_page&&l.onPageStart(this.route)}function k(){h.track_page&&l.onPageEnd(this.route)}function x(e,t,i){var n=e[t];e[t]=function(e){i.call(this,e),n&&n.call(this,e)}}t.default=h}])}));
}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1603337650694);
})()
//# sourceMappingURL=index.js.map