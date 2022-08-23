// pages/detail-menu/detail-menu.js
import { getSongMenuTags, getSongMenuList } from "../../services/music"

Page({
  data: {
    songMenus: []
  },

  onLoad() {
    this.fetchAllMenuList()
  },

  async fetchAllMenuList() {
    // 获取tags
    const res = await getSongMenuTags()
    const tags = res.tags

    const allPromise = []
    // 根据tags获取对应的歌单, for循环为了获取所有的歌单
    for (let tag of tags) {
      const promise = getSongMenuList(tag.name)
      allPromise.push(promise)
    }
    // 等待所有promise有结果后添加数据
    Promise.all(allPromise).then(res => {
      this.setData({
        songMenus: res
      })
    })
  }
})