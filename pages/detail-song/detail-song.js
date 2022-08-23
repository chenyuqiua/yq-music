// pages/detail-song/detail-song.js
import rankingStore from "../../storge/rankingStore"

Page({
  data: {
    songs: []
  },
  // 获取store中的共享数据
  onLoad() {
    rankingStore.onState("recommendSongs", this.handelSongs)
  },

  // 从store获取数据的函数
  handelSongs(value) {
    this.setData({ songs: value })
  },

  // 取消监听store中的数据
  onUnload() {
    rankingStore.offState("recommendSongs", this.handelSongs)
  }
})