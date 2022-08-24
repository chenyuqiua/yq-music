import { yqRequest } from "./index"

export function getSongDetail(ids) {
  return yqRequest.get({
    url: "/song/detail",
    data: { ids }
  })
}

export function getSongLyric(id) {
  return yqRequest.get({
    url: "/lyric",
    data: { id }
  })
}