// components/area-header/area-header.js
Component({
  properties: {
    title: {
      type: String,
      value: "默认标题"
    },
    more: {
      type: String,
      value: "更多"
    },
    hasMore: {
      type: Boolean,
      value: true
    }
  },
  methods: {
    onMoreTap() {
      this.triggerEvent("moreTap")
    }
  }
})
