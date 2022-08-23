export default function querySelect(select) {
  return new Promise((resolve, reject) => {
    const query = wx.createSelectorQuery()
    query.select(select).boundingClientRect()
    query.exec(res => {
      resolve(res)
    })
  })
}