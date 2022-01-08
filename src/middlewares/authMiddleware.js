const jwt = require('jsonwebtoken')


const userAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization', 'Bearer Token')


        if (!token) {
            return res.status(403).send({ status: false, message: `Missing authentication token in request` })
        }

        let T = token.split(' ')
        //console.log(T)
        let timeOut = jwt.decode(T[1], 'HerculesProject6')


        if (!timeOut) {
            return res.status(403).send({ status: false, message: `Invalid authentication token in request ` })
        }

        if (Date.now() > (timeOut.exp) * 1000) {
            return res.status(404).send({ status: false, message: `Session Expired, please login again` })
        }

        req.userId = timeOut.userId

        next()
    } catch (error) {
        console.error(`Error! ${error.message}`)
        res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = {
    userAuth
}