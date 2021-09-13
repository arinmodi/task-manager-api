const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/users')
const Task = require('../../src/models/task')

const userOneId = new mongoose.Types.ObjectId()

const userOne = {
    _id : userOneId,
    name : 'mike',
    email : 'mikemodi2306@gmail.com',
    password : 'mike@2306',
    tokens : [{
        token : jwt.sign({ _id : userOneId },process.env.JWT_SECRET)
    }]
}

const userTwoId = new mongoose.Types.ObjectId()

const userTwo = {
    _id : userTwoId,
    name : 'andrew',
    email : 'andrewmodi2306@gmail.com',
    password : 'andrew--hello',
    tokens : [{
        token : jwt.sign({ _id : userTwoId },process.env.JWT_SECRET)
    }]
}

const taskOne = {
    _id : new mongoose.Types.ObjectId(),
    description : 'First User Task',
    completed : false,
    userId : userOne._id
}

const taskTwo = {
    _id : new mongoose.Types.ObjectId(),
    description : 'First User second Task',
    completed : true,
    userId : userOne._id
}

const taskThree = {
    _id : new mongoose.Types.ObjectId(),
    description : 'second User Task',
    completed : true,
    userId : userTwo._id
}

const setUpdatabase = async  () => {
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports = {
    userOneId,
    userOne,
    userTwo,
    setUpdatabase,
    taskOne
}