import { HYEventStore } from "hy-event-store"

const db = wx.cloud.database()
const cMenu = db.collection("c_menu")

const menuStore = new HYEventStore({
  state: {
    menuList: []
  },
  actions: {
    async fetchMenuListAction(ctx) {
      const res = await cMenu.get()
      ctx.menuList = res.data
    }
  }
})

menuStore.dispatch("fetchMenuListAction")

export default menuStore