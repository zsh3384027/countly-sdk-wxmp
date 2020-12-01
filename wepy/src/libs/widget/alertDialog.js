export const showAlertDialog = (option) => {
  wx.showModal({
    title: option.title || '提示',
    content: option.content,
    confirmText: option.confirmText || '确定',
    cancelText: option.cancelText || '取消',
    confirmColor: '#1d9ded',
    showCancel: option.hasOwnProperty('showCancel') ? option.showCancel : true,
    success: function (res) {
      if (res.confirm) {
        if (option.confirm) {
          option.confirm()
        }
      } else if (res.cancel) {
        if (option.cancel) {
          option.cancel()
        }
      }
    }
  })
}
