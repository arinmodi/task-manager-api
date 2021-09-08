require('../src/db/mongoose')
const Task = require('../src/models/task')

Task.deleteOne({ _id : "612b7101522572385e8c7ffd" }).then((data) => {
    console.log("Removed Data : ", data)
    return Task.count({ completed : false })
}).then((count) => {
    console.log(count)
}).catch((e) => {
    console.log(e)
})