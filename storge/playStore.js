import { HYEventStore } from "hy-event-store"
import { parseLyric } from "../utils/parse-lyric"
import { getSongDetail, getSongLyric } from "../services/player"

export const audioContext = wx.createInnerAudioContext()
const db = wx.cloud.database()
const cHistory = db.collection("c_history")

const playStore = new HYEventStore({
  state: {
    playSongList: [],
    playSongIndex: 0,

    id: 0,
    currentSong: {},
    currentTime: 0,
    durationTime: 0,
    lyricInfos: [],
    currentLyricText: "",
    currentLyricIndex: -1,

    isFirstPlay: true,
    isPlaying: false,

    sliderValue: 0,
    playModeIndex: 0
  },
  actions: {
    // 播放歌曲核心逻辑
    playMusicWithSong(ctx, id) {
      // 0.播放新歌之前, 恢复数据默认值(防止切歌有残影)
      ctx.currentSong = {}
      ctx.sliderValue = 0
      ctx.currentTime = 0
      ctx.durationTime = 0
      ctx.currentLyricIndex = 0
      ctx.currentLyricText = ""
      ctx.lyricInfos = []

      // 1.保存id
      ctx.id = id
      ctx.isPlaying = true
  
      // 2.1根据id获取歌曲的详细数据
      getSongDetail(id).then(res => {
        ctx.currentSong = res.songs[0],
        ctx.durationTime = res.songs[0].dt

        cHistory.add({
          data: ctx.currentSong
        })
      })
      // 2.2根据id获取歌曲的歌词数据
      getSongLyric(id).then(res => {
        const lyricString = res.lrc.lyric;
        const lyricInfos = parseLyric(lyricString)
        ctx.lyricInfos = lyricInfos
      })
  
      // 3.播放当前的歌曲
      audioContext.stop()
      audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
      audioContext.autoplay = true
  
      // 第一次进入才需要监听
      if (ctx.isFirstPlay) {
        ctx.isFirstPlay = false
  
        // 4.监听歌曲播放进度
        // 4.1调用监听播放进度的函数
        this.dispatch("timeUpDate")
  
        // 4.2当歌曲没有缓存, 正在加载时, 暂停播放
        // audioContext.onWaiting(() => {
        //   console.log("111");
        //   audioContext.pause()
        // })
  
        // 4.3当歌曲缓存完成时, 继续播放
        audioContext.onCanplay(() => {
          console.log("222");
          audioContext.play()
        })
  
        // 4.4监听歌曲播放完成
        audioContext.onEnded(() => {
          this.dispatch("playNewMusic")
        })
      }
    },
    // 监听歌曲实时播放进度
    timeUpDate(ctx) {
      audioContext.onTimeUpdate(() => {
        // 设置当前时间
        ctx.currentTime = audioContext.currentTime * 1000
  
        // 设置滑块进度
        const sliderValue = ctx.currentTime / ctx.durationTime * 100
        ctx.sliderValue = sliderValue
  
        // 匹配正确歌词
        if (!ctx.lyricInfos.length) return
        let index = ctx.lyricInfos.length - 1
        for (let i = 0; i < ctx.lyricInfos.length; i++) {
          const info = ctx.lyricInfos[i]
          if (info.time > audioContext.currentTime * 1000) {
            index = i - 1
            break
          }
        }
  
        // 获取歌词的索引和文本, 并且改变歌词滚动页面的位置
        if (ctx.currentLyricIndex === index || index === -1) return
        ctx.currentLyricText = ctx.lyricInfos[index].text
        ctx.currentLyricIndex = index
        ctx.lyricScrollTop = 35 * index
      })
    },
    // 改变播放状态
    changeMusicStatus(ctx) {
      const isPlaying = audioContext.paused
      ctx.isPlaying = isPlaying
      if (isPlaying) {
        audioContext.play()
      } else {
        audioContext.pause()
      }
    },
    // 改变播放模式
    changePlayMode(ctx) {
      // 设置新的播放模式
      let modeIndex = ctx.playModeIndex
      modeIndex ++
      if (modeIndex === 3) modeIndex = 0

      // 保存当前播放模式
      ctx.playModeIndex = modeIndex
    },
    // 上一首下一首的切换
    playNewMusic(ctx, isNext = true) {
      // 获取之前的数据
      let index = ctx.playSongIndex
      const length = ctx.playSongList.length

      // 根据不同的模式, 将索引重新赋值
      switch (ctx.playModeIndex) {
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
      const newSong = ctx.playSongList[index]
      
      // 调用函数播放新的歌曲
      this.dispatch("playMusicWithSong", newSong.id)

      // 将最新的索引保存到共享store中
      ctx.playSongIndex = index
    }
  }
})

export default playStore