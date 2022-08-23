// components/menu-area/menu-area.js

// 获取app
const app = getApp()

Component({
  properties: {
    title: {
      type: String,
      value: "默认标题"
    },
    menuList: {
      type: Object,
      value: {}
    }
  },
  data: {
    screenWidth: 375
  },
  lifetimes: {
    attached() {
      // 获取屏幕的宽度
      this.setData({ screenWidth: app.globalData.screenWidth })
    }
  },
  methods: {
    onMenuMoreClick() {
      wx.navigateTo({
        url: '/pages/detail-menu/detail-menu',
      })
    }
  }
})
