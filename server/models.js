// numbers models to be operated

// connect to database
const mongoose = require('mongoose')
//mongoose.connect('mongodb://localhost:27017/gboss', { useNewUrlParser: true })
// connect to database on mLab
mongoose.connect(process.env.PROD_MONGODB, { useNewUrlParser: true })
const conn = mongoose.connection
conn.on('connected', function(){
    console.log('connect successfully')
})

// define user Model
const userSchema = mongoose.Schema({
    'name': {type: String, 'required': true},
    'pwd': {type: String, 'required': true},
    'type': {'type': String, 'required': true},
    'avatar': {'type': String},
    // description
    'desc': {'type': String},
    'title': {'type': String},
    // if you're company employer, should have below
    'company': {'type': String},
    'money': {'type': String}
})

// define Model
mongoose.model('user', userSchema)

//define chats Model
const chatSchema = mongoose.Schema({
    from: {type: String, required: true},
    to: {type: String, required: true},
    chat_id: {type: String, required: true},
    content: {type: String, required: true},
    read: {type: Boolean, required: false},
    create_time: {type: Number}
})

mongoose.model('chat', chatSchema)

// expose Models
module.exports = {
    getModel(name){
        return mongoose.model(name)
    }
}



