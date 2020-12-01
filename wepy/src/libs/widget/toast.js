export function toast(title, icon = 'none', duration = 1500, image) {
  /* eslint-disable */
  wx.showToast({
    title: title || '',
    icon: icon,
    duration: duration,
    image: image || ''
  })
}

export function toastErr(title) {
  /* eslint-disable */
  wx.showToast({
    title: title || '',
    icon: 'none',
    duration: 5000,
  })
}