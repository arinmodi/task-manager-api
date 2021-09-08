const express = require('express')
const app = new express.Router()
const User = require('../models/users.js')
const auth = require('../middleware/auth.js')
const multer = require('multer')
const sharp = require('sharp')
const { welcomeEmail, CancelEmail } = require('../emails/accout.js')

const uploads = multer({
    limits : {
        fileSize : 2000000
    },
    fileFilter(req,file,cb) {
        if(file.originalname.match(/\.(png|jpg|jpeg)$/)){
            cb(undefined,true)
        }else{
            cb(new Error("Please Provide a PNG OR JPG File"))
        }
    }
})

// creating user
app.post('/users', async (req,res) => {
    const user = new User(req.body)
    try{
        await user.save()
        welcomeEmail(user.email,user.name)
        const token = await user.generateAuthToken()
        res.status(200).send({ user, token })
    }catch(e) {
        res.status(400).send(e)
    }
})

// uploading profile pic
app.post('/users/me/avatar', auth, uploads.single('avatar'), async (req,res) => {
    const buffer = await sharp(req.file.buffer).resize({ width : 250, height : 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error,req,res,next) => {
    res.status(400).send({ error : error.message })
})

// deleting profile pic
app.delete('/users/me/avatar',auth,async (req,res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

// fetching avatar
app.get('/users/:id/avatar', async (req,res) => {
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error("Avatar Not Found or User not Exist!...")
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)


    }catch(e) {
        res.status(400).send({ error : e.message })
    }
})

// checking user login
app.post('/users/login', async (req,res) => {
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({ status : "Login Successful..." , token :  token.toString() })
    }catch(e){
        console.log(e)
        res.status(400).send("error")
    }
})

// fetching a profile
app.get('/users/me', auth , async (req,res) => {
    res.send(req.user)
})

//logout
app.post('/users/logout', auth , async (req,res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
        await req.user.save()
        res.status(200).send("Logout...")
    }catch(e){
        res.status(400).send("Logout unsucceful...")
    }
})

// logout from all devices
app.post('/users/logoutAll', auth , async (req,res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.status(200).send("Logout from all ...")
    }catch(e){
        res.status(400).send("Logout from all unsucceful...")
    }
})

// update the user
app.patch('/users/me', auth , async (req,res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','email','password','age']
    const isValidOpration = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOpration){
        return res.status(400).send({ error : 'Invalid Update Opration' })
    }

    try{

        const user = req.user

        updates.forEach((update) => {
            user[update] = req.body[update]
        })

        await user.save()

        res.status(200).send(user)
    }catch(e) {
        res.status(500).send(e)
    }
})

// delete user
app.delete('/users/me', auth ,async (req,res) => {
    try{
        await req.user.remove()
        CancelEmail(req.user.email,req.user.name)
        res.status(200).send(req.user)
    }catch(e) {
        res.status(500).send(e)
    }
})

module.exports = app
