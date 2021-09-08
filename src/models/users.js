const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const Task = require('./task.js')

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },

    age : {
        type : Number,
        validate(value) {
            if(value < 0){
                throw new Error('Age must be a positive')
            }
        },
        default : 0
    },

    email : {
        type : String,
        unique : true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid...')
            }
        },
        required : true,
        trim : true,
        lowercase : true
    },

    password : {
        type : String,
        trim : true,
        required : true,
        minlength : 7,
        validate(value){
            if(value.toString().toLowerCase().includes('password')){
                throw new Error('invalid password...')
            }
        }
    },

    avatar : {
        type : Buffer
    },

    tokens : [{
        token : {
            type : String,
            required : true
        }
    }]
},{
    timestamps : true,
})

userSchema.virtual('tasks', {
    ref : 'Task',
    localField : '_id',
    foreignField : 'userId',
})

userSchema.set('toObject', { virtuals : true })
userSchema.set('toJSON', { virtuals : true })

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id : user._id.toString() },process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token  })

    await user.save()

    return token

}

userSchema.statics.findByCredentials  = async (email,password) => {
    const user = await User.findOne({ email })

    if(!user){
        throw new Error('Unable to Login...')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Unable to Login...')
    }

    return user
}


// Hash the password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

//delete the user task when user removed

userSchema.pre('remove', async function (next) {
    const user = this

    await Task.deleteMany({ userId : user._id })

    next()

})

const User = mongoose.model('User', userSchema)

module.exports = User