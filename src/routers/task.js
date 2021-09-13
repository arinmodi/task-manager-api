const express = require('express')
const app = new express.Router()
const Task = require('../models/task.js')
const auth = require('../middleware/auth.js')

// creating task
app.post('/tasks', auth, async (req,res) => {

    const task = new Task({
        ...req.body,
        userId : req.user._id
    })

    try{
        await task.save()
        res.status(200).send(task)
    }catch(e){
        res.status(400).send(e)
    }
})

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
app.get('/tasks', auth, async (req,res) => {
    const match = {};
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try{
        const returndata = await req.user.populate({
            path : 'tasks',
            match,
            options : {
                limit : parseInt(req.query.limit) || 0,
                skip : parseInt(req.query.skip) || 0,
                sort
            }
        })

        res.status(200).send(returndata.tasks)
    }catch(e){
        console.log(e)
        res.status(500).send(e)
    }
})

// feching a single task
app.get('/tasks/:id', auth , async (req,res) => {
    const _id = req.params.id

    try{
        const data = await Task.findOne({ _id, userId : req.user._id })
        if(!data){
            return res.status(404).send("Task Not Found")
        }
        res.status(200).send(data)
    }catch(e){
        res.status(500).send(e)
    }
})

// update the task
app.patch('/tasks/:id', auth , async (req,res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOpration = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOpration){
        return res.status(400).send({ error : 'Invalid Update Opration' })
    }

    try{
        const task = await Task.findOne({ _id : req.params.id, userId : req.user._id })

        if(!task){
            return res.status(404).send("Task Not Exist")
        }

        updates.forEach((update) => task[update] = req.body[update])

        await task.save()

        res.status(200).send(task)
    }catch(e) {
        res.status(500).send(e)
    }
})

//delete the task
app.delete('/tasks/:id', auth, async (req,res) => {
    try{
        const task = await Task.findOneAndDelete({ _id : req.params.id, userId : req.user._id })

        if(!task){
            return res.status(404).send("Task Not Exist")
        }

        res.status(200).send(task)
    }catch(e) {
        res.status(500).send(e)
    }
})

module.exports = app