// pages/main_profile/main_profile.js
import menuStore from "../../storge/menuStore"

const db = wx.cloud.database()
const cMenu = db.collection("c_menu")

Page({
  data: {
    isLogin: false,
    userInfo: {},
    tabs: [
      {name: "我的收藏", type: "favor"},
      {name: "我的喜欢", type: "like"},
      {name: "历史记录", type: "history"},
    ],
    isShowDialog: false,
    menuName: "",
    menuList: []
  },
  onLoad() {
    // 判断用户是否登录
    const openid = wx.getStorageSync('openid')
    const userInfo = wx.getStorageSync('userinfo')
    this.setData({ isLogin: !!openid })
    if (this.data.isLogin) {
      this.setData({ userInfo })
    }

    // 共享歌单数据
    menuStore.onState("menuList", this.handleMenuList)
  },

  // --------------------------事件监听--------------------------
  async onUserInfoTap() {
    if (!this.data.isLogin) {
      // 1.获取用户头像和昵称
      const profile = await wx.getUserProfile({
        desc: '获取您的头像和昵称',
      })

      // 2.获取openid
      const loginRes = await wx.cloud.callFunction({
        name: "music-login"
      })
      const openid = loginRes.result.openid;

      // 3.保存在本地
      wx.setStorageSync('openid', openid)
      wx.setStorageSync('userinfo', profile.userInfo)
      this.setData({ 
        isLogin: true,
        userInfo: profile.userInfo 
      })
    }
  },
  onTabItemClick(event) {
    const item = event.currentTarget.dataset.item
    wx.navigateTo({
      url: `/pages/detail-song/detail-song?type=profile&tabname=${item.type}&title=${item.name}`,
    })
  },
  onPlusTap() {
    this.setData({ isShowDialog: true })
  },
  async onConfrimTap() {
    const menuName = this.data.menuName

    const menuRecord = {
      name: menuName,
      songList: []
    }

    const res = await cMenu.add({ data: menuRecord })
    if (res) {
      wx.showToast({
        title: '添加成功',
      })
      menuStore.dispatch("fetchMenuListAction")
    }
  },
  onInputChange() {},

  // --------------------------数据共享--------------------------
  handleMenuList(value) {
    this.setData({ menuList: value })
  }
})