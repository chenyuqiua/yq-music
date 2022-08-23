// pages/detail-song/detail-song.js
import rankingStore from "../../storge/rankingStore"
import { getPlaylistDetail } from "../../services/music"

Page({
  data: {
    type: "ranking",
    key: "recommendSongInfo",

    // 所有类型要展示数据的存放处
    songInfo: {},
    // menu类型数据
    id: 0
  },
  onLoad(options) {
    // 确定类型: 1.recommend, 2.ranking
    const type = options.type
    console.log(type);
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
    }
  },

  // 发送网络请求
  async fetchMenuSong() {
    const res = await getPlaylistDetail(this.data.id)
    console.log(res);
    this.setData({ songInfo: res.playlist })
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
  }
})