// pages/music-player/music-player.js
import playStore, { audioContext } from "../../storge/playStore"
import throttle from "../../utils/throttle"

const app = getApp()
const modeNames = ["order", "repeat", "random"]

Page({
  data: {
    stateKeys: ["id", "currentSong", "currentTime", "durationTime", "lyricInfos", "currentLyricText", "currentLyricIndex", "sliderValue", "isPlaying", "playModeIndex"],

    id: 0,
    currentSong: {},
    currentTime: 0,
    durationTime: 0,
    lyricInfos: [],
    currentLyricText: "",
    currentLyricIndex: -1,

    isPlaying: true,
    isFirstPlay: true,

    playSongList: [],
    playSongIndex: 0,
    playModeName: "order",

    currentPage: 0,
    contentHeight: 0,
    pageTitles: [ "歌曲", "歌词" ],
    sliderValue: 0,
    
    lyricScrollTop: 0
  },
  onLoad(options) {
    // 0.获取设备信息
    this.setData({
      contentHeight: app.globalData.contentHeight
    })

    // 1.获取歌曲的id
    const id = options.id
    // 根据id播放歌曲
    if (id) {
      playStore.dispatch("playMusicWithSong", id)
    }

    // 5.获取store中的共享数据
    playStore.onStates(["playSongList", "playSongIndex"], this.getPlaySongInfosHandler)
    playStore.onStates(this.data.stateKeys, this.getPlayerInfosHandler)
  },


  // ---------------------事件监听函数---------------------
  // 轮播图改变
  onSwiperChange(event) {
    this.setData({ currentPage: event.detail.current })
  },
  // 导航栏切换点击
  onNavTabTap(event) {
    const index = event.currentTarget.dataset.index
    this.setData({ currentPage: index })
  },
  // 导航栏返回按钮
  onNavBackTap() {
    wx.navigateBack()
  },
  // 滑块拖动完成的监听
  onSliderChange(event) {
    // 拖动完成, 恢复歌曲进度的监听
    playStore.dispatch("timeUpDate")
    // 展示播放的图标(解决歌曲播放显式暂停图标)
    this.setData({ isPlaying: true })

    // 获取点击后, 滑块位置的值
    const value = event.detail.value

    const currentTime = value / 100 * this.data.durationTime
    audioContext.seek(currentTime / 1000)
    this.setData({ currentTime, sliderValue: value })
  },
  // 滑块拖动过程的监听(对滑块拖动监听函数节流)
  onSliderChanging: throttle(function (event) {
    // 滑块拖动的时候, 取消监听歌曲进度的改变
    audioContext.offTimeUpdate()

    // 获取拖动滑块后位置的值
    const value = event.detail.value

    const currentTime = value / 100 * this.data.durationTime
    this.setData({ currentTime })
  }, 100),
  // 监听播放暂停
  onPlayOrPause() {
    playStore.dispatch("changeMusicStatus")
  },
  // 上一首按钮
  onPrevtBtnTap() {
    // 展示播放的图标(解决歌曲播放显式暂停图标)
    this.setData({ isPlaying: true })

    playStore.dispatch("playNewMusic", false)
  },
  // 下一首按钮
  onNextBtnTap() {
    // 展示播放的图标(解决歌曲播放显式暂停图标)
    this.setData({ isPlaying: true })

    playStore.dispatch("playNewMusic")
  },
  // 播放模式的监听
  onModeBtnTap() {
    playStore.dispatch("changePlayMode")
  },

  // ---------------------store共享数据处理函数---------------------
  getPlaySongInfosHandler({ playSongIndex, playSongList }) {
    if (playSongIndex !== undefined) {
      this.setData({ playSongIndex })
    }
    if (playSongList) {
      this.setData({ playSongList })
    }
  },
  getPlayerInfosHandler({
    id, currentSong, currentTime, durationTime, lyricInfos, currentLyricText, currentLyricIndex, sliderValue, isPlaying, playModeIndex
  }) {
    if (id !== undefined) {
      this.setData({ id })
    }
    if (currentSong) {
      this.setData({ currentSong })
    }
    if (currentTime !== undefined) {
      this.setData({ currentTime })
    }
    if (durationTime !== undefined) {
      this.setData({ durationTime })
    }
    if (lyricInfos) {
      this.setData({ lyricInfos })
    }
    if (currentLyricText) {
      this.setData({ currentLyricText })
    }
    if (currentLyricIndex !== undefined) {
      this.setData({ currentLyricIndex, lyricScrollTop: currentLyricIndex * 35 })
    }
    if (sliderValue !== undefined) {
      this.setData({ sliderValue })
    }
    if (isPlaying !== undefined) {
      this.setData({ isPlaying })
    }
    if (playModeIndex !== undefined) {
      this.setData({ playModeName: modeNames[playModeIndex] })
    }
  },

  // ---------------------取消store中的监听---------------------
  onUnload() {
    playStore.offStates(["playSongList", "playSongIndex"], this.getPlaySongInfosHandler)
    playStore.offStates(this.data.stateKeys, this.getPlayerInfosHandler)
  }
})