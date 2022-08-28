import menuStore from "../../storge/menuStore"

// components/song-item-v2/song-item-v2.js
const db = wx.cloud.database()
const cFavor = db.collection("c_favor")
const cLike = db.collection("c_like")
const cMenu = db.collection("c_menu")

Component({
  properties: {
    itemData: {
      type: Object,
      value: {}
    },
    index: {
      type: Number,
      value: -1
    },
    menuList: {
      type: Array,
      value: []
    }
  },
  methods: {
    onSongItemTap() {
      const id = this.properties.itemData.id
      wx.navigateTo({
        url: `/pages/music-player/music-player?id=${id}`,
      })
    },
    onMoreIconTap() {
      wx.showActionSheet({
        itemList: ["收藏", "喜欢", "添加到歌单"],
        success: (res) => {
          const index = res.tapIndex
          this.handleOperationResult(index)
        }
      })
    },
    async handleOperationResult(index) {
      let res = null
      switch(index) {
        case 0:
          res =  await cFavor.add({
            data: this.properties.itemData
          })
          console.log(res);
          break
        case 1:
          res = await cLike.add({
            data: this.properties.itemData
          })
          console.log(res);
          break
        case 2:
          const menuName = this.properties.menuList.map(item => item.name)
          wx.showActionSheet({
            itemList: menuName,
            success: (res) => {
              const menuIndex = res.tapIndex
              this.handleMenuIndex(menuIndex)
            }
          })
          return
      }
      if (res) {
        const title = index === 0 ? "收藏" : "喜欢"
        wx.showToast({
          title: title + "成功",
        })
      }
    },
    async handleMenuIndex(index) {
      // 获取要添加的歌单
      const menuItem = this.properties.menuList[index]

      const data = this.properties.itemData
      const cmd = db.command
      const res = await cMenu.doc(menuItem._id).update({
        data: {
          songList: cmd.push(data)
        }
      })
      if (res) {
        wx.showToast({
          title: '添加成功',
        })
        menuStore.dispatch("fetchMenuListAction")
      }
    }
  }
})
