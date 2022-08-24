const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/

export function parseLyric(lrcString) {
  const lyricInfos = []
  const lyricLines = lrcString.split("\n")

  for(const lineString of lyricLines) {
    const result = timeReg.exec(lineString)
    if (!result) continue

    const minute = result[1] * 60 * 1000
    const second = result[2] * 1000
    const mSecond = result[3].length === 2 ? result[3] * 10 : result[3] * 1
    const time = minute + second + mSecond
    const text = lineString.replace(timeReg, "")

    if (text) {
      lyricInfos.push({ time, text })
    }
  }
  return lyricInfos
}