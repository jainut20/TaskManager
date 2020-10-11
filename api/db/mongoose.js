//This file will handle working with mongo db

const mongoose = require('mongoose')
mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGODB_URI || "", { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('Mongodb connection established')
}).catch((e) => {
    console.log(e)
})

mongoose.set('useCreateIndex', true)
mongoose.set('useFindAndModify', false)

module.exports = { mongoose };
