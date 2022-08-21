import { yqRequest } from "./index"

export function getTopMVList(limit = 20, offset = 0) {
  return yqRequest.get({
    url: "/top/mv",
    data: {
      limit,
      offset
    }
  })
}

export function getMVUrl(id) {
  return yqRequest.get({
    url: "/mv/url",
    data: { id }
  })
}

export function getMVInfo(id) {
  return yqRequest.get({
    url: "/mv/detail",
    data: { mvid: id }
  })
}

export function getMVRelate(id) {
  return yqRequest.get({
    url: "/related/allvideo",
    data: { id }
  })
}