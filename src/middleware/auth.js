const jwt = require('jsonwebtoken')
const User = require('../models/users.js')

const auth = async (req,res,next) => {
    try{
        const token = req.header('Authorization').replace('Bearer', '').replace(' ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({ _id : decoded._id, 'tokens.token' : token })

        if(!user){
            throw new Error()
        }

        req.token = token
        req.user = user
        next()

    }catch(e){
        res.status(400).send({ error : "Authentication Failed..." })
    }
}

module.exports = auth