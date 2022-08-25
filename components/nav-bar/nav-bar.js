// components/nav-bar/nav-bar.js
const app = getApp()

Component({
  options: {
    multipleSlots: true
  },
  properties: {
    title: {
      type: String,
      value: "导航标题"
    }
  },
  data: {
    statusHeight: 0
  },
  lifetimes: {
    attached() {
      // 获取设备信息
      this.setData({ statusHeight: app.globalData.statusBarHeight })
    }
  },
  methods: {
    onLeftClick() {
      this.triggerEvent("leftClick")
    }
  }
})
