class Bus {
  constructor() {
    this.list = []
  }

  emit(functionName, args = null) {
    console.log(`====== emit ${functionName}=========`)
    this.list.forEach((obj) => {
      if (obj.name === functionName && !obj.used) {
        obj.callback && obj.callback(args)
        obj.used = true
      }
    })
  }

  on(functionName, callback = null) {
    console.log(`======== on ${functionName}=========`)
    this.list.push({
      name: functionName,
      callback: callback,
      used: false
    })
  }
}

export default Bus
