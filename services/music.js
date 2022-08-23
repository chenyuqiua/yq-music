import { yqRequest } from "./index"

export function getMusicBanner() {
  return yqRequest.get({ url: "/banner" })
}

export function getPlaylistDetail(id) {
  return yqRequest.get({
    url: "/playlist/detail",
    data: { id }
  })
}

export function getSongMenuList(cat = "全部", limit = 6, offset = 0) {
  return yqRequest.get({
    url: "/top/playlist",
    data: {
      cat,
      limit,
      offset
    }
  })
}

export function getSongMenuTags() {
  return yqRequest.get({ url: "/playlist/hot" })
}