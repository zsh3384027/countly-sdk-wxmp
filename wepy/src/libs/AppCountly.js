import Countly from '@egova/countly-sdk-wxmp'
import Http from './Http'

// 需要记录的接口地址
const INCLUDES = [
  '.*'
]

// 不需要记录的接口地址（优先级高于INCLUDES）
const EXCLUDES = []

const RESULT_CODE = {
  SUCCESS: 0,
  FAIL: -1
}

export default class AppCountly {
  constructor(app) {
    this._app = app
    this.hasInit = false
    this._instanceCountly = new Countly()
    Http.setCountlyRequestListener((params) => {
      this.handleCountlyRequestRecord(params)
    })
  }

  getountly() {
    return this._instanceCountly
  }

  init() {
    if (this.hasInit) {
      return
    }
    console.log('countly init')
    const appKey = 'YOUR_APP_KEY'
    const url = 'https://try.count.ly'

    this.hasInit = true
    Countly.q = Countly.q || []
    Countly.app_key = appKey
    Countly.url = url
    Countly.debug = true
    Countly.track_page = true
    Countly.track_errors = true
    Countly.q.push(['track_session'])
    this._instanceCountly.init()
  }

  handleCountlyRequestRecord(params) {
    const {methodName, resultInfo, duration} = params
    if (!resultInfo) {
      return
    }
    if (!this.shouldRecord(methodName)) {
      return
    }
    let newMethod = methodName
    if (isUrl(newMethod)) {
      const temp = newMethod.split('//')
      if (temp.length > 1) {
        const subTemp = temp[1]
        const arrayStr = subTemp.split('/')
        newMethod = arrayStr.slice(2).join('/')
      }
    }
    newMethod = newMethod.indexOf('/') === 0 ? newMethod.substring(1) : newMethod
    // 去掉method"?"后面的部分
    newMethod = newMethod.includes('?') ? newMethod.substring(0, newMethod.indexOf('?')) : newMethod

    this.requestRecord({
      method: newMethod,
      success: resultInfo.data && resultInfo.data.code === '200',
      code: resultInfo.statusCode || RESULT_CODE.FAIL,
      message: (resultInfo.data && resultInfo.data.message) || resultInfo.errMsg,
      duration: duration
    })
  }

  recordUserDetial({name, username, email = '', organization = '', phone, picture, gender, age, custom}) {
    let byear
    if (age >= 0) {
      byear = new Date().getFullYear() - age
    }
    Countly.q.push(['user_details', {
      name,
      username,
      email,
      organization,
      phone,
      picture,
      gender,
      byear: byear || '',
      custom
    }])
  }

  /** 接口请求收集 */
  requestRecord({
    method, success, code, message, duration
  }) {
    const event = {
      key: '接口请求',
      dur: duration / 1000,
      segmentation: {
        接口地址: method,
        请求结果: success ? '成功' : '失败',
        状态码: code + '',
        请求耗时: Number(duration / 1000).toFixed(1)
      }
    }
    if (message) {
      event.segmentation.返回消息 = message
    }
    this.recordCustomEvent(event)
  }

  recordCustomEvent(event) {
    if (!this.hasInit) {
      return
    }
    this.addCustomEventCommonParams(event)
    this._instanceCountly.add_event(event)
    const cityEvent = Object.assign({isCity: true}, event)
    cityEvent.segmentation = Object.assign({}, event.segmentation)
    this.addCustomEventCommonParams(cityEvent)
    this._instanceCountly.add_event(cityEvent)
  }

  addCustomEventCommonParams(event) {
    if (!event.segmentation) {
      event.segmentation = {}
    }
    this.putIfKeyValueValid(event.segmentation, '终端类型', '微信小程序')
  }

  putIfKeyValueValid(obj, key, value) {
    if (key && (value || !isNaN(parseInt(value, 10)))) {
      obj[key] = value + ''
    }
  }

  shouldRecord(method) {
    if (!method) {
      return false
    }

    for (let i = 0; i < EXCLUDES.length; i++) {
      const re = new RegExp(EXCLUDES[i])
      if (method.match(re)) {
        return false
      }
    }

    for (let i = 0; i < INCLUDES.length; i++) {
      const re = new RegExp(INCLUDES[i])
      if (method.match(re)) {
        return true
      }
    }

    return false
  }
}

function isUrl (url) {
  /* eslint-disable */
  let reg = /(http|ftp|https)?:\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/
  return reg.test(url)
}
