const moment = require("moment")
const md5 = require("md5")
const request = require('request')



/**
 * делает запрос на url с параметрами и возвращает промис с результатом
 * @param {Object} params 
 * @return {Promise}
 */
function sendSite(params) {
	if (!params.strictSSL) params.strictSSL = false
	params.url = encodeURI(params.url)
	const send = params.method == "POST" ? request.post : request.get

	return new Promise((resolve, reject) => {
		send(params, function (error, response) {
			if (error) return reject(error)
			return resolve(response)
		})
	}).catch(err => {
		return reject({error, params})
	})
}





// https://docs.google.com/document/d/1OFS-3ocSx-1Rvg4afAnEHlT3917MAK_6eJTR6rzr-BM/edit#
class Hirez {
	#id; #key;

	constructor(id, key, game='paladins') {
		this.#id = id
		this.#key = key
		this.game = game
	}

	get game() {
		return this.game
	}

	set game(val) {
		val = val.toLowerCase()
		if ( val == 'paladins' ) {
			this.gameUrl = 'http://api.paladins.com/paladinsapi.svc/'
		} else if ( val == 'smite' ) {
			this.gameUrl = 'http://api.paladins.com/paladinsapi.svc'
		} else {
			throw `The "game" parameter is not correct! Only "paladins" or "smite"`
		}
	}

	createSession = () => {
		// console.log("createSession")
	    return new Promise((resolve, reject) => {
	        const timestamp = moment().utc().format("YYYYMMDDHHmmss")
	        const signature = md5( this.#id + "createsession" + this.#key + timestamp )
	        const urlCreateSession = `${this.gameUrl}createsessionJson/${this.#id}/${signature}/${timestamp}`
	        sendSite({url: urlCreateSession, json: true})
	        .then(response => {
	            const body =  response.body
	            const ret_msg = body.ret_msg
				if (ret_msg !== "Approved") return reject(ret_msg)
				const session = body.session_id
				this.session = session
				this.timeStartSession = +new Date()
				// console.log(session)
	            return resolve(session)
	        })
	    })
	}

	testSession = () => { // проверяет валидность сессии, если не валидна то создает новую
	    return new Promise(resolve => {
			const checkTime = new Date() - 840000 < this.timeStartSession // 900000
			// console.log(`Минут с последнего теста сессии: ${(new Date() - this.timeStartSession) / 60000}`)
			if (checkTime) return resolve({result: true, msg: "all ok, time has not run out"})
			// console.log("время вышло, мы проверим валидность сессии и если она 'не катит' то создадим новую")

			this.createSession()
			.then(session => {
				return resolve({result: false, session, msg: "created a new session"})
			})
	    })
	}

	ex = (format, ...params) => {
		// console.log(`ex: ${format}`)
	    return new Promise((resolve, reject) => {
			if (!format) return reject(false)

			const testing = format !== "testsession" ? this.testSession : () => {return new Promise(resolve => {return resolve()})}
			testing()
			.then((res) => {
				const timestamp = moment().utc().format("YYYYMMDDHHmmss")
				const signature = md5( this.#id + format + this.#key + timestamp )
				const strParams = params.length > 0 ? `/${params.join("/")}` : ''
				const url = `${this.gameUrl}${format}Json/${this.#id}/${signature}/${this.session}/${timestamp}${strParams}`
				sendSite({url, json:true})
				.then(res => {
					this.timeStartSession = +new Date()
					return resolve(res.body)
				})
			})
	    })
	}
}





module.exports = {
	Hirez
}