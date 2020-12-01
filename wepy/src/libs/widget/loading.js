export const openLoading = title => {
  /* eslint-disable */
  wx.showLoading({
    title: title || '加载中...',
    mask: true
  })
}

export const closeLoading = () => {
  /* eslint-disable */
  wx.hideLoading()
}
