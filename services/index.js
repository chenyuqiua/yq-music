// 网络请求封装成类
class YQRequest {
	// 传入配置的baseurl
	constructor(baseUrl) {
		this.baseUrl = baseUrl
	}

	request(options) {
		const { url } = options
		return new Promise((resolve, reject) => {
			wx.request({ 
				...options,
				url: this.baseUrl + url,
				success: (res) => {
					resolve(res.data)
				},
				fail: reject
			})
		})
	}

	get(options) {
		return this.request({ ...options, method: "get" })
	}

	post(options) {
		return this.request({ ...options, method: "post" })
	}
}

export const yqRequest = new YQRequest("http://codercba.com:9002")
// export const yqRequest = new YQRequest("https://coderwhy-music.vercel.app")