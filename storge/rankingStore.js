import { HYEventStore } from "hy-event-store"
import { getPlaylistDetail } from "../services/music"

const rankingMap = {
  newRanking: 3779629,
  originRanking: 2884035,
  upRanking: 19723756
}
const rankingStore = new HYEventStore({
  state: {
    recommendSongInfo: {}, 
    newRanking: {},
    originRanking: {},
    upRanking: {}
  },
  actions: {
    async fetchRecommendSongsAction(ctx) {
      const res = await getPlaylistDetail(3778678)
      ctx.recommendSongInfo = res.playlist
    },
    fetchRankingDataAction(ctx) {
      for (const key in rankingMap) {
        const id = rankingMap[key]
        getPlaylistDetail(id).then(res => {
          ctx[key] = res.playlist
        })
      }
    }
  }
})

export default rankingStore