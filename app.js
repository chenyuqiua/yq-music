// app.js
App({
  globalData: {
    screenWidth: 375,
    screenHeight: 667,
    statusBarHeight: 20,
    contentHeight: 300
  },
  onLaunch() {
    // 1.获取设备信息
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.screenWidth = res.screenWidth
        this.globalData.screenHeight = res.screenHeight
        this.globalData.statusBarHeight = res.statusBarHeight
        this.globalData.contentHeight = res.screenHeight - res.statusBarHeight - 44
      },
    })

    // 2.云开发能力进行初始化
    wx.cloud.init({
      env: "cloud1-0g75nm8011e44998"
    })
  }
})
