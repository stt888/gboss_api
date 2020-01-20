// test using mongoose to operate mongodb database

// import mongoose
const mongoose = require('mongoose')

// connect to database
mongoose.connect('mongodb://localhost:27017/bossz_test', {useNewUrlParser: true})

// obtain the connection object
const conn = mongoose.connection

// binding listener
conn.on('connected', function(){
    console.log('connect database successfully!')
})

// define Schema
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
const UserModel = mongoose.model('user', userSchema)

// use Model's instance object to add data
function testSave(){
    const userModel = new UserModel({
        name: 'Bob',
        pwd: '123',
        type: 'company',
        avatar: 'man'
    })
    userModel.save(userModel, function(err,user){
        console.log('save()', err, user)
    })
}

//testSave()

//use Model's function find()/findOne() to search
function testFind(){
    UserModel.find(function(err, users){
        console.log('find', err, users)
    })
    UserModel.findOne({_id:'5c016964c01b2f04cc7e514d'}, function(err, user){
        console.log('findOne', err, user)
    })
}

//testFind()

// use Model's function findByIdAndUpdate() to update one data
function testUpdate(){
    UserModel.findByIdAndUpdate({_id:'5c016964c01b2f04cc7e514d'}, {name: 'John'}, {new: true},function(err, user){
        console.log('findByIdAndUpdate', err, user)
    })
}

//testUpdate()

// use Model's function remove() to delete date
function testRemove(){
    UserModel.remove({_id: '5c016964c01b2f04cc7e514d'}, function(err, result){
        console.log('remove', err, result)
    })
}
testRemove()


