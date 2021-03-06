// 参考angularjs实现
import wepy from 'wepy'

let cacheServerUrl
let _countlyRequestListener = null


function prepareParams(params) {
  const str = []
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      str.push(`${key}=${encodeURIComponent(params[key])}`)
    }
  }
  return str.join('&')
}

const HTTP = {
  ajax(requestParam) {
    const startTime = new Date().getTime();
    if (requestParam.start) {
      requestParam.start()
    }
    if (!requestParam.params) {
      requestParam.params = {}
    }
    if (!requestParam.method) {
      requestParam.method = 'POST'
    }
    let completeFunc = (res) => {
      if (typeof _countlyRequestListener === 'function') {
        _countlyRequestListener({
          methodName: requestParam.url || requestParam.methodName,
          resultInfo: res,
          duration: new Date().getTime() - startTime
        })
      }
    }
    let newUrl = requestParam.url || (`${cacheServerUrl}/${requestParam.methodName}`)
    const data = prepareParams(requestParam.params || {})
    if (requestParam.method === 'GET') {
      newUrl = `${newUrl}?${data}`
    }
    wepy.request({
      url: newUrl,
      data: requestParam.method === 'POST' ? requestParam.params : '',
      header: { 'content-type': 'application/json' },
      method: requestParam.method,
    }).then(res => {
      if (requestParam.success) {
        requestParam.success(res.data)
      }
      if (requestParam.complete) {
        requestParam.complete(res)
      }
      completeFunc(res)
    }).catch(res => {
      if (requestParam.fail) {
        requestParam.fail(res)
      }
      if (requestParam.complete) {
        requestParam.complete(res)
      }
      completeFunc(res)
    })
  },
  setServerUrl(url) {
    if (url) {
      cacheServerUrl = url
    } else {
      throw new Error('服务器地址设置失败')
    }
  },
  setCountlyRequestListener(cb) {
    _countlyRequestListener = cb
  }
}

export default HTTP
