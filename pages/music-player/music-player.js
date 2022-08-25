// pages/music-player/music-player.js
import { getSongDetail, getSongLyric } from "../../services/player"
import { parseLyric } from "../../utils/parse-lyric"
import playStore from "../../storge/playStore"

const app = getApp()
const audioContext = wx.createInnerAudioContext()
const modeNames = ["order", "repeat", "random"]

Page({
  data: {
    id: 0,
    currentSong: {},
    lyricInfos: [],
    currentPage: 0,
    contentHeight: 0,
    pageTitles: [ "歌曲", "歌词" ],

    currentTime: 0,
    durationTime: 0,
    sliderValue: 0,
    isPlaying: true,
    currentLyricText: "",
    currentLyricIndex: -1,
    lyricScrollTop: 0,
    playSongList: [],
    playSongIndex: 0,
    isFirstPlay: true,
    playModeIndex: 0,
    playModeName: "order"
  },
  onLoad(options) {
    // 0.获取设备信息
    this.setData({
      contentHeight: app.globalData.contentHeight
    })

    // 1.获取歌曲的id
    const id = options.id
    // 根据id播放歌曲
    this.setupPlaySong(id)

    // 5.获取store中的共享数据
    playStore.onStates(["playSongList", "playSongIndex"], this.getPlaySongInfosHandler)
  },

  // ---------------------发送网络请求---------------------
  async fetchSongDetail() {
    const res = await getSongDetail(this.data.id)
    this.setData({ 
      currentSong: res.songs[0],
      durationTime: res.songs[0].dt
    })
  },
  async fetchSongLyric() {
    const res = await getSongLyric(this.data.id)
    const lyricString = res.lrc.lyric;
    const lyricInfos = parseLyric(lyricString)
    this.setData({ lyricInfos })
  },
  // ---------------------封装函数相关---------------------
  // 封装监听歌曲实时播放进度的函数
  timeUpDate() {
    audioContext.onTimeUpdate(() => {
      // 设置当前时间
      this.setData({ currentTime: audioContext.currentTime * 1000 })

      // 设置滑块进度
      const sliderValue = this.data.currentTime / this.data.durationTime * 100
      this.setData({ sliderValue })

      // 匹配正确歌词
      if (!this.data.lyricInfos.length) return
      let index = this.data.lyricInfos.length - 1
      for (let i = 0; i < this.data.lyricInfos.length; i++) {
        const info = this.data.lyricInfos[i]
        if (info.time > audioContext.currentTime * 1000) {
          index = i - 1
          break
        }
      }

      // 获取歌词的索引和文本, 并且改变歌词滚动页面的位置
      if (this.data.currentLyricIndex === index) return
      this.setData({ 
        currentLyricText: this.data.lyricInfos[index].text,
        currentLyricIndex: index,
        lyricScrollTop: 35 * index
      })
    })
  },
  // 封装播放歌曲核心逻辑
  setupPlaySong(id) {
    // 保存id
    this.setData({ id })

    // 2.1根据id获取歌曲的详细数据
    this.fetchSongDetail()
    // 2.2根据id获取歌曲的歌词数据
    this.fetchSongLyric()

    // 3.播放当前的歌曲
    audioContext.stop()
    audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
    audioContext.autoplay = true

    // 第一次进入才需要监听
    if (this.data.isFirstPlay) {
      this.setData({ isFirstPlay: false })

      // 4.监听歌曲播放进度
      // 4.1调用监听播放进度的函数
      this.timeUpDate()

      // 4.2当歌曲没有缓存, 正在加载时, 暂停播放
      audioContext.onWaiting(() => {
        audioContext.pause()
      })

      // 4.3当歌曲缓存完成时, 继续播放
      audioContext.onCanplay(() => {
        audioContext.play()
      })

      // 4.4监听歌曲播放完成
      audioContext.onEnded(() => {
        this.changeNewSong()
      })
    }
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
    this.timeUpDate()
    // 展示播放的图标(解决歌曲播放显式暂停图标)
    this.setData({ isPlaying: true })

    // 获取点击后, 滑块位置的值
    const value = event.detail.value

    const currentTime = value / 100 * this.data.durationTime
    audioContext.seek(currentTime / 1000)
    this.setData({ currentTime, sliderValue: value })
  },
  // 滑块拖动过程的监听
  onSliderChanging(event) {
    // 滑块拖动的时候, 取消监听歌曲进度的改变
    audioContext.offTimeUpdate()

    // 获取拖动滑块后位置的值
    const value = event.detail.value

    const currentTime = value / 100 * this.data.durationTime
    this.setData({ currentTime })
  },
  // 监听播放暂停
  onPlayOrPause() {
    const isPlaying = audioContext.paused
    this.setData({ isPlaying })
    if (isPlaying) {
      audioContext.play()
    } else {
      audioContext.pause()
    }
  },
  // 上一首按钮
  onPrevtBtnTap() {
    // 展示播放的图标(解决歌曲播放显式暂停图标)
    this.setData({ isPlaying: true })

    this.changeNewSong(false)
  },
  // 下一首按钮
  onNextBtnTap() {
    // 展示播放的图标(解决歌曲播放显式暂停图标)
    this.setData({ isPlaying: true })

    this.changeNewSong()
  },
  // 控制上一首或下一首封装的函数
  changeNewSong(isNext = true) {
    // 获取之前的数据
    let index = this.data.playSongIndex
    const length = this.data.playSongList.length

    // 根据不同的模式, 将索引重新赋值
    switch (this.data.playModeIndex) {
      case 0: // 顺序播放
        index = isNext ? index + 1 : index - 1
        if (index === length) index = 0
        if (index === -1) index = length - 1
        break;
      case 1: // 单曲循环
        break;
      case 2: // 随机播放
        index = Math.floor(Math.random() * length)
        break;
    }    

    // 根据索引获取歌曲
    const newSong = this.data.playSongList[index]
    // 播放新歌之前, 清楚数据恢复默认值(防止切换有残影)
    this.setData({ currentSong: {}, sliderValue: 0, currentTime: 0, durationTime: 0 })
    // 调用函数播放新的歌曲
    this.setupPlaySong(newSong.id)

    // 将最新的索引保存到共享store中
    playStore.setState("playSongIndex", index)
  },
  // 播放模式的监听
  onModeBtnTap() {
    let modeIndex = this.data.playModeIndex
    modeIndex ++
    if (modeIndex === 3) modeIndex = 0
    this.setData({ 
      playModeIndex: modeIndex,
      playModeName: modeNames[modeIndex]
    })
    console.log(modeIndex);
  },

  // ---------------------store共享数据---------------------
  getPlaySongInfosHandler({ playSongIndex, playSongList }) {
    if (playSongIndex !== undefined) {
      this.setData({ playSongIndex })
    }
    if (playSongList) {
      this.setData({ playSongList })
    }
  },

  onUnload() {
    playStore.offStates(["playSongList", "playSongIndex"], this.getPlaySongInfosHandler)
  }
})