// pages/detail-song/detail-song.js
import rankingStore from "../../storge/rankingStore"
import playStore from "../../storge/playStore"
import menuStore from "../../storge/menuStore"
import { getPlaylistDetail } from "../../services/music"

const db = wx.cloud.database()
const cMenu = db.collection("c_menu")

Page({
  data: {
    type: "ranking",
    key: "recommendSongInfo",

    // 所有类型要展示数据的存放处
    songInfo: {},
    // menu类型数据
    id: 0,
    menuList: []  
  },
  onLoad(options) {
    // 确定类型: 1.recommend, 2.ranking
    const type = options.type
    this.setData({ type })

    // 根据类型获取store中的共享数据
    if (type === "ranking") {
      const key = options.key
      this.data.key = key
      rankingStore.onState(key, this.handelRanking)
    } else if(type === "recommend") {
      rankingStore.onState("recommendSongInfo", this.handelRanking)
    } else if (type === "menu") {
      this.data.id = options.id
      this.fetchMenuSong()
    } else if (type === "profile") {
      const tabname = options.tabname
      const title = options.title
      this.handleProfileTabInfos(tabname, title)
    } else if (type === "menuitem") {
      const _id = options.id
      cMenu.doc(_id).get({
        success: (res) => {
          const songList = res.data.songList
          const name = res.data.name
          this.setData({
            songInfo: {
              name,
              tracks: { ...songList }
            }
          })
        }
      })
    }

    // 歌单数据
    menuStore.onState("menuList", this.handleMenuList)
  },

  // 发送网络请求
  async fetchMenuSong() {
    wx.showLoading({
      title: '加载中'
    })
    const res = await getPlaylistDetail(this.data.id)
    wx.hideLoading()
    this.setData({ songInfo: res.playlist })
  },

  async handleProfileTabInfos(tabname, title) {
    const collection = db.collection(`c_${tabname}`)
    const res = await collection.where({ _openid: wx.getStorageSync('openid') }).get()

    this.setData({
      songInfo: {
        name: title,
        tracks: res.data
      }
    })
  },

  // 从store获取数据的函数
  handelRanking(value) {
    if (this.data.type === "recommend") {
      value.name = "推荐歌曲"
    }
    this.setData({ songInfo: value })
    wx.setNavigationBarTitle({
      title: value.name,
    })
  },

  // 取消监听store中的数据
  onUnload() {
    if (this.data.type === "ranking") {
      rankingStore.offState(this.data.key, this.handelRanking)
    } else if (this.data.type === "recommend") {
      rankingStore.offState("recommendSongInfo", this.handelRanking)
    }
  },

  // 事件监听
  onSongItemTap(value) {
    const index = value.currentTarget.dataset.index
    playStore.setState("playSongList", this.data.songInfo.tracks)
    playStore.setState("playSongIndex", index)
  },
  handleMenuList(value) {
    this.setData({ menuList: value })
  }
})