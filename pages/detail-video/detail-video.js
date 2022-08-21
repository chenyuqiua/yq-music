// pages/detail-video/detail-video.js
import { getMVUrl, getMVInfo, getMVRelate,  } from "../../services/video"

Page({
  data: {
    id: "",
    mvUrl: "",
    mvInfo: {},
    relatedVideo: [],
    danmuList: [
      {text: "真好听, 听完就可以找到工作啦", color: "skyblue", time: 2 },
      {text: "听完就可以毕业进大厂啦", color: "#f00", time: 5 },
      {text: "努力学习进大厂", color: "#0f0", time: 7 }
    ]
  },
  onLoad(options) {
    this.setData({ id: options.id })

    // 调用发生网络请求函数
    this.fetchMVUrl()
    this.fetchMVInfo()
    this.fetchMVRelated()
  },

  // 发送网络请求获取的函数
  async fetchMVUrl() {
    const res = await getMVUrl(this.data.id)
    this.setData({ mvUrl: res.data.url })
  },
  async fetchMVInfo() {
    const res = await getMVInfo(this.data.id)
    this.setData({ mvInfo: res.data })
  },
  async fetchMVRelated() {
    const res = await getMVRelate(this.data.id )
    this.setData({ relatedVideo: res.data })
  }
})