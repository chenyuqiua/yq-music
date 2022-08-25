// pages/main-video/main-video.js
import { getTopMVList } from "../../services/video"
import { audioContext } from "../../storge/playStore"

Page({
  data: {
    videoList: [],
    hasMore: true
  },
  onLoad() {
    // 调用网络请求方法
    this.fetchTopMVlist()
  },

  // 发送网络请求的方法
  async fetchTopMVlist() {
    // 1.获取网络请求的数据
    const res = await getTopMVList(20, this.data.videoList.length)
    // 2.将原来的数据和新数据合并到一个新数组中
    const newVideoList = [...this.data.videoList, ...res.data]
    // 3.设置全新的数据
    this.setData({ 
      videoList: newVideoList,
      hasMore: res.hasMore
    })
  },

  // 监听上拉加载更多
  onReachBottom() {
    if (!this.data.hasMore) return
    this.fetchTopMVlist()
  },

  // 监听下拉刷新
  async onPullDownRefresh() {
    // 1.清空数据以及其他数据恢复默认值
    this.setData({
      videoList: [],
      hasMore: true
    })
    // 2.重新请求数据
    await this.fetchTopMVlist()

    // 3.请求完数据停止下拉刷新
    wx.stopPullDownRefresh()

  },

  // 监听播放视频暂停歌曲
  onMusicPlayOrPause() {
    audioContext.pause()
  }
})