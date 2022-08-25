// pages/main-music/main-music.js
import { getMusicBanner, getSongMenuList } from "../../services/music"
import querySelect from "../../utils/query-select"
import throttle from "../../utils/throttle"
import rankingStore from "../../storge/rankingStore"
import playStore from "../../storge/playStore"

// 添加节流函数
const querySelectThrottle = throttle(querySelect)

Page({
  data: {
    searchValue: "",
    banners: [],
    bannerHeight: 0,
    recommendSongs: [],

    // 歌单数据
    hotMenuList: [],
    recMenuList: [],

    // 排行榜数据
    rankingInfos: {},

    // 当前播放歌曲数据
    currentSong: {},
    isPlaying: false
  },

  onLoad() {
    // 调用封装网络请求的函数
    this.fetchMusicBanner()
    this.fetchSongMenuList()
    
    // 监听store中的数据
    rankingStore.onState("recommendSongInfo", this.handelRecommendStore)
    rankingStore.onState("newRanking", this.handelNewRanking)
    rankingStore.onState("originRanking", this.handelOriginRanking)
    rankingStore.onState("upRanking", this.handelUpRanking)
    
    // 发起action
    rankingStore.dispatch("fetchRecommendSongsAction")
    rankingStore.dispatch("fetchRankingDataAction")

    playStore.onStates(["currentSong", "isPlaying"], this.handelPlayInfos)
  },

  // -----------------------网络请求-----------------------
  // 封装发送网络请求函数
  async fetchMusicBanner() {
    const res = await getMusicBanner()
    this.setData({
      banners: res.banners
    })
  },
  fetchSongMenuList() {
    getSongMenuList().then(res => {
      this.setData({ hotMenuList: res.playlists })
    })
    getSongMenuList("华语").then(res => {
      this.setData({ recMenuList: res.playlists })
    })
  },
  // -----------------------事件监听-----------------------
  // 监听input跳转页面
  onSearchClick() {
    wx.navigateTo({ url: '../detail-search/detail-search' })
  },
  // 监听图片加载完成
  onBannerImageLoad() {
    // 获取image组件高度
    querySelectThrottle(".banner-image").then(res => {
      this.setData({ bannerHeight: res[0].height })
    })
  },
  // 监听组件传出的点击事件
  onRecommendMoreClick() {
    wx.navigateTo({
      // url: "/pages/detail-song/detail-song?type=recommend",
      url: "/pages/detail-song/detail-song?type=recommend",
    })
  },
  // 监听热门推荐的
  onSongItemTap(event) {
    const index = event.currentTarget.dataset.index
    console.log(index);
    playStore.setState("playSongList", this.data.recommendSongs)
    playStore.setState("playSongIndex", index)
  },
  onPlayOrPauseTap() {
    playStore.dispatch("changeMusicStatus")
  },
  onNextMusicTap() {
    playStore.dispatch("playNewMusic")
  },
  onPlayBarAlbumTap() {
    wx.navigateTo({
      url: '/pages/music-player/music-player',
    })
  },

  // -----------------------从store获取数据的函数-----------------------
  handelRecommendStore(value) {
    if (!value.tracks) return
    this.setData({ recommendSongs: value.tracks.slice(0, 6) })
  },
  handelNewRanking(value) {
    const newRankingInfos = { ...this.data.rankingInfos, newRanking: value}
    this.setData({
      rankingInfos: newRankingInfos
    })
  },
  handelOriginRanking(value) {
    const newRankingInfos = { ...this.data.rankingInfos, originRanking: value }
    this.setData({
      rankingInfos: newRankingInfos
    })
  },
  handelUpRanking(value) {
    const newRankingInfos = { ...this.data.rankingInfos, upRanking: value }
    this.setData({
      rankingInfos: newRankingInfos
    })
  },
  handelPlayInfos({currentSong, isPlaying}) {
    if (currentSong) {
      this.setData({ currentSong })
    }
    if (isPlaying !== undefined) {
      this.setData({ isPlaying })
    }
  },

  // 取消监听store中的数据
  onunload() {
    rankingStore.offState("recommendSongs", this.handelRecommendStore)
    rankingStore.offState("newRanking", this.handelNewRanking)
    rankingStore.offState("originRanking", this.handelOriginRanking)
    rankingStore.offState("upRanking", this.handelUpRanking)
    playStore.offStates(["currentSong", "isPlaying"], this.handelPlayInfos)
  }
})