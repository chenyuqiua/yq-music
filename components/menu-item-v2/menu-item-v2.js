import menuStore from "../../storge/menuStore"

// components/menu-item-v2/menu-item-v2.js
const db = wx.cloud.database()
const cHistory = db.collection("c_menu")
const cMenu = db.collection("c_menu")

Component({
  properties: {
    itemData: {
      type: Object,
      value: {}
    }
  },
  methods: {
    async onDeleteTap() {
      const _id = this.data.itemData._id
      const res = await cHistory.doc(_id).remove()
      console.log(res);
      if (res) {
        wx.showToast({
          title: '删除成功',
        })
        menuStore.dispatch("fetchMenuListAction")
      }
    },
    async onMenuItemTap() {
      const _id = this.data.itemData._id
      wx.navigateTo({
        url: `/pages/detail-song/detail-song?type=menuitem&id=${_id}`,
      })
    }
  }
})
