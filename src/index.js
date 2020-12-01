/* eslint-disable camelcase */
// eslint-disable-next-line no-console

const systemInfo = wx.getSystemInfoSync()
const SDK_VERSION = '1.0'
const SDK_NAME = 'javascript_native_WXMP'
let appInBackground = false
class Countly {
  constructor() {
    this.startTime = this.getTimestamp()
    this.apiPath = '/i'
    this.requestQueue = []
    this.eventQueue = []
    this.crashLogs = []
    this.sessionStarted = false
    this.lastBeat = 0
    this.lastMsTs = 0
    this.failTimeout = 0
    this.crashSegments = null
    this.customData = {}
    this.trackSession = false
  }

  /**
   * 初始化方法
   * @param {number} [conf.interval=500] - set an interval how often to check if there is any data to report and report it in miliseconds
   * @param {string} conf.app_key - app key for your app created in Countly
   * @param {number} [conf.queue_size=1000] - maximum amount of queued requests to store
   * @param {number} [conf.max_events=10] - maximum amount of events to send in one batch
   * @param {number} [conf.fail_timeout=60] - set time in seconds to wait after failed connection to server in seconds
   * @param {number} [conf.max_logs=100] - maximum amount of breadcrumbs to store for crash logs
   * @param {string} conf.url - your Countly server url, you can use your server URL or IP here
   * @param {boolean} [conf.debug=false] - output debug info into console
   * @param {string} [conf.app_version=0.0] - the version of your app or website
   * @param {string} conf.device_id - to identify a visitor, will be auto generated if not provided
   * @param {boolean} [conf.force_post=false] - force using post method for all requests
   * @param {boolean} [conf.ignore_visitor=false] - ignore this current visitor
   * @param {boolean} [conf.track_page=false] - auto track page for wechat miniproagrame
   * @param {boolean} [conf.track_errors=false] - auto track error for wechat miniproagrame
   * @param {boolean} [conf.city_code=true] - 城市编码
   * @param {boolean} [conf.city_name=true] - 城市名称
   */
  init(obj) {
    this.beatInterval = this.getConfig('interval', obj, 500)
    this.queueSize = this.getConfig('queue_size', obj, 1000)
    this.sessionUpdate = this.getConfig('session_update', obj, 60)
    this.maxEventBatch = this.getConfig('max_events', obj, 10)
    this.failTimeoutAmount = this.getConfig('fail_timeout', obj, 60)
    this.maxCrashLogs = this.getConfig('max_logs', obj, 100)

    Countly.namespace = this.getConfig('namespace', obj, '')
    Countly.debug = this.getConfig('debug', obj, false)
    Countly.app_key = this.getConfig('app_key', obj, false)
    Countly.url = this.stripTrailingSlash(this.getConfig('url', obj, ''))
    Countly.app_version = this.getConfig('app_version', obj, '0.0')
    Countly.device_id = this.getConfig('device_id', obj, this.getId())
    Countly.force_post = this.getConfig('force_post', obj, false)
    Countly.ignore_visitor = this.getConfig('ignore_visitor', obj, false)
    Countly.track_page = this.getConfig('track_page', obj, false)
    Countly.track_errors = this.getConfig('track_errors', obj, false)
    Countly.city_code = this.getConfig('city_code', obj, 0)
    Countly.city_name = this.getConfig('city_name', obj, '')
    Countly.q = Countly.q || []
    if (Countly.device_id !== this.store('cly_id')) {
      this.store('cly_id', Countly.device_id)
    }

    this.log('Countly initialized')
    this.setOnWindowResizeListener()
    this.heartBeat()
  }

  heartBeat() {
    // process queue
    if (typeof Countly.q !== 'undefined' && Countly.q.length > 0) {
      for (let i = 0; i < Countly.q.length; i++) {
        const req = Countly.q[i]
        if (req.constructor === Array && req.length > 0) {
          this.log('Processing queued call', req)
          if (typeof this[req[0]] !== 'undefined') {
            this[req[0]].apply(this, req.slice(1))
          } else {
            const userdata = req[0].replace('userData.', '')
            if (typeof this.userData[userdata] !== 'undefined') {
              this.userData[userdata].apply(this, req.slice(1))
            }
          }
        }
      }
      Countly.q = []
    }

    // extend session if needed
    if (this.sessionStarted) {
      const last = this.getTimestamp()
      if (last - this.lastBeat > 60) {
        this.session_duration(last - this.lastBeat)
        this.lastBeat = last
      }
    }

    // process event queue
    if (this.eventQueue.length > 0) {
      if (this.eventQueue.length <= this.maxEventBatch) {
        this.toRequestQueue({events: JSON.stringify(this.eventQueue)})
        this.eventQueue = []
      } else {
        const events = this.eventQueue.splice(0, this.maxEventBatch)
        this.toRequestQueue({events: JSON.stringify(events)})
      }
      this.store('cly_event', this.eventQueue)
    }

    // process request queue with event queue
    if (this.requestQueue.length > 0 && this.getTimestamp() > this.failTimeout) {
      const params = this.requestQueue.shift()
      this.log('Processing request', params)
      this.sendHttpRequest(Countly.url + this.apiPath, params, (err) => {
        this.log('Request Finished', params, err)
        if (err) {
          this.requestQueue.unshift(params)
          this.failTimeout = this.getTimestamp() + this.failTimeoutAmount
        } else {
          this.store('cly_queue', this.requestQueue)
        }
      })
      this.store('cly_queue', this.requestQueue)
    }

    setTimeout(() => {
      this.heartBeat()
    }, this.beatInterval)
  }

  track_session() {
    this.trackSession = true
    this.begin_session()
  }

  begin_session() {
    if (this.trackSession && !this.sessionStarted) {
      this.log('Session started')
      this.lastBeat = this.getTimestamp()
      this.sessionStarted = true
      const req = {
        begin_session: 1,
        metrics: JSON.stringify(this.getMetrics())
      }
      this.report_orientation()
      this.toRequestQueue(req)
    }
  }

  session_duration(sec) {
    if (this.sessionStarted) {
      this.log('Session extended', sec)
      this.toRequestQueue({session_duration: sec})
    }
  }

  end_session() {
    if (this.trackSession && this.sessionStarted) {
      this.log('Ending session')
      this.sessionStarted = false
      this.toRequestQueue({
        end_session: 1,
        session_duration: this.getTimestamp() - this.lastBeat
      })
    }
  }

  /**
  * Report device orientation
  * @param {string=} orientation - orientation as landscape or portrait
  */
  report_orientation(orientation) {
    this.add_event({
      key: '[CLY]_orientation',
      segmentation: {
        mode: orientation || systemInfo.deviceOrientation
      }
    })
  }

  /** 设置屏幕变化监听事件 */
  setOnWindowResizeListener() {
    wx.onWindowResize((res) => {
      if (res && res.size) {
        const orientation = res.size.windowWidth > res.size.windowHeight ? 'landscape' : 'portrait'
        this.report_orientation(orientation)
      }
    })
  }

  /**
  * Report custom event
  * @param {Object} event - Countly {@link Event} object
  * @param {string} event.key - name or id of the event
  * @param {number} [event.count=1] - how many times did event occur
  * @param {number=} event.sum - sum to report with event (if any)
  * @param {number=} event.dur - duration to report with event (if any)
  * @param {Object=} event.segmentation - object with segments key /values
  **/
  add_event(event) {
    if (Countly.ignore_visitor) {
      return
    }

    if (!event.key) {
      this.log('Event must have key property')
      return
    }

    if (!event.count) {
      event.count = 1
    }
    const props = ['key', 'count', 'sum', 'dur', 'segmentation']
    const e = this.getProperties(event, props)
    e.timestamp = this.getMsTimestamp()
    const date = new Date()
    e.hour = date.getHours()
    e.dow = date.getDay()
    this.eventQueue.push(e)
    this.store('cly_event', this.eventQueue)
    this.log('Adding event: ', event)
  }

  // retrieve only specific properties from object
  getProperties(orig, props) {
    const ob = {}
    for (let i = 0; i < props.length; i++) {
      const prop = props[i]
      if (typeof orig[prop] !== 'undefined') {
        ob[prop] = orig[prop]
      }
    }
    return ob
  }

  toRequestQueue(request) {
    if (Countly.ignore_visitor) {
      return
    }

    if (!Countly.app_key || !Countly.device_id) {
      this.log('app_key or device_id is missing')
      return
    }

    this.prepareRequest(request)

    if (this.requestQueue.length > this.queueSize) {
      this.requestQueue.shift()
    }

    this.requestQueue.push(request)
    this.store('cly_queue', this.requestQueue)
  }

  prepareRequest(request) {
    request.app_key = Countly.app_key
    request.device_id = Countly.device_id
    request.sdk_name = SDK_NAME
    request.sdk_version = SDK_VERSION

    request.timestamp = this.getMsTimestamp()
    const date = new Date()
    request.hour = date.getHours()
    request.dow = date.getDay()
  }

  // get unique timestamp in miliseconds
  getMsTimestamp() {
    const ts = new Date().getTime()
    if (this.lastMsTs >= ts) {
      this.lastMsTs++
    } else {
      this.lastMsTs = ts
    }
    return this.lastMsTs
  }

  getMetrics() {
    const metrics = {
      _app_version: Countly.app_version
    }
    if (systemInfo) {
      metrics._resolution = `${systemInfo.screenWidth}x${systemInfo.screenHeight}`
      metrics._density = systemInfo.pixelRatio
      metrics._locale = systemInfo.language
      metrics._os_version = systemInfo.system
      metrics._os = systemInfo.platform
      metrics._device = systemInfo.brand
      metrics._browser = 'wechat'
      metrics._browser_version = systemInfo.version
    }
    this.log('Got metrics', metrics)
    return metrics
  }

  getConfig(key, obj, override) {
    if (obj && typeof obj[key] !== 'undefined') {
      return obj[key]
    }
    if (typeof Countly[key] !== 'undefined') {
      return Countly[key]
    }
    return override
  }

  log() {
    if (Countly.debug && typeof console !== 'undefined') {
      if (arguments[1] && typeof arguments[1] === 'object') {
        arguments[1] = JSON.stringify(arguments[1])
      }
      console.log(Array.prototype.slice.call(arguments).join('\n'))
    }
  }

  /** removing trailing slashes */
  stripTrailingSlash(str) {
    if (str.substr(str.length - 1) === '/') {
      return str.substr(0, str.length - 1)
    }
    return str
  }

  /** get current timestamp */
  getTimestamp() {
    return Math.floor(new Date().getTime() / 1000)
  }

  /** get ID */
  getId() {
    return this.store('cly_id') || this.generateUUID()
  }

  /** generate UUID */
  generateUUID() {
    let d = new Date().getTime()
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = (d + Math.random() * 16) % 16 | 0
      d = Math.floor(d / 16)
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
  }

  store(key, value) {
    const newKey = Countly.namespace + key
    // If value is detected, set new or modify store
    if (typeof value !== 'undefined' && value !== null) {
      // Set the store
      try {
        wx.setStorageSync(newKey, Countly.serialize(value))
      } catch (error) {
        this.log(error)
      }
    }
    // No value supplied, return value
    if (typeof value === 'undefined') {
      // Get value
      try {
        return Countly.deserialize(wx.getStorageSync(newKey))
      } catch (error) {
        this.log(error)
      }
    }
    if (value === null) {
      try {
        wx.removeStorageSync(newKey)
      } catch (error) {
        this.log(error)
      }
    }
  }

  /** 发送网络请求 */
  sendHttpRequest(url, params, callback) {
    this.log('Sending XML HTTP request')
    const data = this.prepareParams(params || {})
    let method = 'GET'
    if (Countly.force_post || data.length >= 2000) {
      method = 'POST'
    }
    let newUrl = url
    if (method === 'GET') {
      newUrl = `${url}?${data}`
    }
    wx.request({
      url: newUrl,
      method: method,
      data: method === 'POST' ? params : '',
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        if (res.data && res.data.result === 'Success') {
          callback(false)
        } else {
          this.log(res.data.result)
          callback(true)
        }
      },
      fail: () => {
        callback(true)
      }
    })
  }

  prepareParams(params) {
    const str = []
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        str.push(`${key}=${encodeURIComponent(params[key])}`)
      }
    }
    return str.join('&')
  }

  /**
  * Add new line in the log of breadcrumbs of what user did, will be included together with error report
  * @param {string} record - any text describing what user did
  */
  add_log(record) {
    if (this.crashLogs.length > this.maxCrashLogs) {
      this.crashLogs.shift()
    }
    this.crashLogs.push(record)
  }

  /**
  * Log an exception that you catched through try and catch block and handled yourself and just want to report it to server
  * @param {Object} err - error exception object provided in catch block
  * @param {string=} segments - additional key value pairs you want to provide with error report, like versions of libraries used, etc.
  */
  log_error(err, segments) {
    this.recordError(err, true, segments)
  }

  /**
  * Automatically track javascript errors that happen on the website and report them to the server
  * @param {string=} segments - additional key value pairs you want to provide with error report, like versions of libraries used, etc.
  */
  // track_errors(segments) {
  //   this.crashSegments = segments
  //   wx.onError((err) => {
  //     console.log('测试：', err)
  //     this.recordError(err, false)
  //   })
  // }

  async recordError(err, nonfatal, segments) {
    segments = segments || this.crashSegments
    let error = ''
    if (typeof err === 'object') {
      if (typeof err.stack !== 'undefined') {
        error = err.stack
      } else {
        if (typeof err.name !== 'undefined') {
          error += err.name + ':'
        }
        if (typeof err.message !== 'undefined') {
          error += err.message + '\n'
        }
        if (typeof err.fileName !== 'undefined') {
          error += 'in ' + err.fileName + '\n'
        }
        if (typeof err.lineNumber !== 'undefined') {
          error += 'on ' + err.lineNumber
        }
        if (typeof err.columnNumber !== 'undefined') {
          error += ':' + err.columnNumber
        }
      }
      if (!error) {
        error = JSON.stringify(err)
      }
    } else {
      error = err + ''
    }

    const metrics = this.getMetrics()
    const ob = { _resolution: metrics._resolution, _error: error, _app_version: metrics._app_version, _run: this.getTimestamp() - this.startTime }

    ob._not_os_specific = true
    ob._nonfatal = !!nonfatal
    const level = await this.getBatteryInfo()
    const isOnline = await this.getNetworkType()

    ob._os = metrics._os
    ob._os_version = metrics._os_version
    ob._manufacture = metrics._device
    ob._online = isOnline
    if (level) {
      ob._bat = level
    }
    if (this.crashLogs.length > 0) {
      ob._logs = this.crashLogs.join('\n')
    }
    ob._background = appInBackground
    this.crashLogs = []
    if (typeof segments !== 'undefined' && segments) {
      ob._custom = {segments}
    }

    this.toRequestQueue({ crash: JSON.stringify(ob) })
  }

  getBatteryInfo() {
    return new Promise((resolve) => {
      wx.getBatteryInfo({
        success: (res) => {
          resolve(res.level)
        },
        fail: () => {
          resolve()
        }
      })
    })
  }

  getNetworkType() {
    return new Promise((resolve) => {
      wx.getNetworkType({
        success: (res) => {
          if (res && res.networkType === 'none') {
            resolve(false)
          }
          resolve(true)
        },
        fail: () => {
          resolve(true)
        }
      })
    })
  }

  /**
    * Provide information about user
    * @param {Object} user - Countly {@link UserDetails} object
    * @param {string=} user.name - user's full name
    * @param {string=} user.username - user's username or nickname
    * @param {string=} user.email - user's email address
    * @param {string=} user.organization - user's organization or company
    * @param {string=} user.phone - user's phone number
    * @param {string=} user.picture - url to user's picture
    * @param {string=} user.gender - M value for male and F value for femail
    * @param {number=} user.byear - user's birth year used to calculate current age
    * @param {Object=} user.custom - object with custom key value properties you want to save with user
    */
  user_details(user) {
    this.log('Adding userdetails: ', user)
    const props = ['name', 'username', 'email', 'organization', 'phone', 'picture', 'gender', 'byear', 'custom']
    this.toRequestQueue({ user_details: JSON.stringify(this.getProperties(user, props)) })
  }

  /**************************
    * Modifying custom property values of user details
    * Possible modification commands
    *  - inc, to increment existing value by provided value
    *  - mul, to multiply existing value by provided value
    *  - max, to select maximum value between existing and provided value
    *  - min, to select minimum value between existing and provided value
    *  - setOnce, to set value only if it was not set before
    *  - push, creates an array property, if property does not exist, and adds value to array
    *  - pull, to remove value from array property
    *  - addToSet, creates an array property, if property does not exist, and adds unique value to array, only if it does not yet exist in array
    **************************/
  changeCustomProperty (key, value, mod) {
    debugger
    if (!this.customData[key]) {
      this.customData[key] = {}
    }
    if (mod === '$push' || mod === '$pull' || mod === '$addToSet') {
      if (!this.customData[key][mod]) {
        this.customData[key][mod] = []
      }
      this.customData[key][mod].push(value)
    } else {
      this.customData[key][mod] = value
    }
  }

  /**
    * Control user related custom properties. Don't forget to call save after finishing manipulation of custom data
    * @namespace Countly.userData
    * @name Countly.userData
    * @example
    * //set custom key value property
    * Countly.userData.set("twitter", "ar2rsawseen");
    * //create or increase specific number property
    * Countly.userData.increment("login_count");
    * //add new value to array property if it is not already there
    * Countly.userData.push_unique("selected_category", "IT");
    * //send all custom property modified data to server
    * Countly.userData.save();
    */
  userData = {
    /**
    * Sets user's custom property value
    * @param {string} key - name of the property to attach to user
    * @param {string|number} value - value to store under provided property
    **/
    set: (key, value) => {
      this.customData[key] = value
    },
    /**
    * Unset's/delete's user's custom property
    * @param {string} key - name of the property to delete
    **/
    unset: (key) => {
      this.customData[key] = ''
    },
    /**
    * Sets user's custom property value only if it was not set before
    * @param {string} key - name of the property to attach to user
    * @param {string|number} value - value to store under provided property
    **/
    set_once: (key, value) => {
      this.changeCustomProperty(key, value, '$setOnce')
    },
    /**
    * Increment value under the key of this user's custom properties by one
    * @param {string} key - name of the property to attach to user
    **/
    increment: (key) => {
      this.changeCustomProperty(key, 1, '$inc')
    },
    /**
    * Increment value under the key of this user's custom properties by provided value
    * @param {string} key - name of the property to attach to user
    * @param {number} value - value by which to increment server value
    **/
    increment_by: (key, value) => {
      this.changeCustomProperty(key, value, '$inc')
    },
    /**
    * Multiply value under the key of this user's custom properties by provided value
    * @param {string} key - name of the property to attach to user
    * @param {number} value - value by which to multiply server value
    **/
    multiply: (key, value) => {
      this.changeCustomProperty(key, value, '$mul')
    },
    /**
    * Save maximal value under the key of this user's custom properties
    * @param {string} key - name of the property to attach to user
    * @param {number} value - value which to compare to server's value and store maximal value of both provided
    **/
    max: (key, value) => {
      this.changeCustomProperty(key, value, '$max')
    },
    /**
    * Save minimal value under the key of this user's custom properties
    * @param {string} key - name of the property to attach to user
    * @param {number} value - value which to compare to server's value and store minimal value of both provided
    **/
    min: (key, value) => {
      this.changeCustomProperty(key, value, '$min')
    },
    /**
    * Add value to array under the key of this user's custom properties. If property is not an array, it will be converted to array
    * @param {string} key - name of the property to attach to user
    * @param {string|number} value - value which to add to array
    **/
    push: (key, value) => {
      this.changeCustomProperty(key, value, '$push')
    },
    /**
    * Add value to array under the key of this user's custom properties, storing only unique values. If property is not an array, it will be converted to array
    * @param {string} key - name of the property to attach to user
    * @param {string|number} value - value which to add to array
    **/
    push_unique: (key, value) => {
      this.changeCustomProperty(key, value, '$addToSet')
    },
    /**
    * Remove value from array under the key of this user's custom properties
    * @param {string} key - name of the property
    * @param {string|number} value - value which to remove from array
    **/
    pull: (key, value) => {
      this.changeCustomProperty(key, value, '$pull')
    },
    /**
    * Save changes made to user's custom properties object and send them to server
    **/
    save: () => {
      this.toRequestQueue({ user_details: JSON.stringify({ custom: this.customData }) })
      this.customData = {}
    }
  }

  /**
  * Overwrite serialization function for extending SDK with encryption, etc
  * @param {any} value - value to serialize
  * @return {string} serialized value
  */
  static serialize(value) {
    // Convert object values to JSON
    if (typeof value === 'object') {
      value = JSON.stringify(value)
    }
    return value
  }

  /**
  * Overwrite deserialization function for extending SDK with encryption, etc
  * @param {string} data - value to deserialize
  * @return {varies} deserialized value
  */
  static deserialize(data) {
    try {
      data = JSON.parse(data)
    } catch (e) {
    }
    return data
  }
}

/**
 * 小程序页面路由管理
 */
class PageLoadingManager {
  constructor() {
    this.pageStack = []
  }

  onPageStart(page) {
    this.pageStack.push({
      name: page,
      startTime: Date.now()
    })
  }

  onPageEnd(page) {
    if (this.pageStack.length <= 0 || this.pageStack[this.pageStack.length - 1].name !== page) {
      return
    }
    const currentPage = this.pageStack.pop()
    const duration = Date.now() - currentPage.startTime
    const event = {
      key: '页面加载',
      dur: duration / 1000,
      segmentation: {
        页面名称: currentPage.name,
        加载耗时: duration + '',
        终端类型: '微信小程序'
      }
    }
    Countly.q.push(['add_event', event])
    if (Countly.city_code) {
      this.putIfKeyValueValid(event.segmentation, '城市编码', Countly.city_code)
      this.putIfKeyValueValid(event.segmentation, '城市名称', Countly.city_name)
      Countly.q.push(['add_event', event])
    }
  }

  putIfKeyValueValid(obj, key, value) {
    if (key && (value || !isNaN(parseInt(value, 10)))) {
      obj[key] = value + ''
    }
  }
}

const pageLoadingManager = new PageLoadingManager()

/**
 * 注意：在小程序配置插件的时候，开发工具上会提示重写失败，测试的时候可以先关闭插件的引用
 */
try {
  const oldApp = App
  App = function App(appOptions) {
    rewriteFn(appOptions, 'onLaunch', function () {
      onAppLaunch(appOptions)
    })
    rewriteFn(appOptions, 'onShow', onAppShow)
    rewriteFn(appOptions, 'onHide', onAppHide)
    rewriteFn(appOptions, 'onError', onAppError)
    rewriteFn(appOptions, 'onPageNotFound', onPageNotFound)
    rewriteFn(appOptions, 'onUnhandledRejection', onUnhandledRejection)
    oldApp(appOptions)
  }
} catch (e) {
  console.log('App重写异常')
}

/** 重写微信小程序app onLaunch方法 */
function onAppLaunch(appOptions) {
  Countly.q = Countly.q || []
}

/** 重写微信小程序app onShow方法 */
function onAppShow() {
  appInBackground = false
  Countly.q.push(['begin_session'])
}

/** 重写微信小程序app onHide方法 */
function onAppHide() {
  appInBackground = true
  Countly.q.push(['end_session'])
}

function onAppError(err) {
  if (Countly.track_errors) {
    Countly.q.push(['log_error', err])
  }
}
function onPageNotFound(res) {
  if (Countly.track_errors) {
    Countly.q.push(['log_error', res])
  }
}

function onUnhandledRejection(res) {
  if (Countly.track_errors) {
    Countly.q.push(['log_error', res])
  }
}

try {
  const oldPage = Page
  Page = function Page(pageOptions) {
    rewriteFn(pageOptions, 'onShow', onPageShow)
    rewriteFn(pageOptions, 'onHide', onPageHide)
    rewriteFn(pageOptions, 'onUnload', onPageHide)
    return oldPage(pageOptions)
  }
} catch (e) {
  console.error('Page重写异常')
}

/** 重写微信小程序Page onShow方法 */
function onPageShow() {
  if (Countly.track_page) {
    pageLoadingManager.onPageStart(this.route)
  }
}

/** 重写微信小程序app onHide方法 */
function onPageHide() {
  if (Countly.track_page) {
    pageLoadingManager.onPageEnd(this.route)
  }
}

/** 重写对象方法 */
function rewriteFn(obj, name, newFn) {
  const oldFn = obj[name]

  obj[name] = function (e) {
    newFn.call(this, e)
    oldFn && oldFn.call(this, e)
  }
}

export default Countly
