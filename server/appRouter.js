
// import express, md5, models
const express = require('express')
const md5 = require('blueimp-md5')
const models = require('./models')
const UserModel = models.getModel('user')
const ChatModel = models.getModel('chat')


// obtain router
const router = express.Router()
const _filter = {'pwd': 0, '_v': 0}


// register number n route
//register route
router.post('/register', function(req, res){
    // obtain request data
    const {name, pwd, type} = req.body
    // operate database
    UserModel.findOne({name}, function(err, user){
        if(user){
            return res.send({code:1, msg: 'user name exist!'})
        }else {
            const userModel = new UserModel({name, pwd: md5(pwd), type})
            userModel.save(function (err, user) {
                res.cookie('userid', user._id)
                res.send({code:0, data: {_id: user._id, name, type}})
            })
        }
    })
})

// login route
router.post('/login', function(req, res){
    const {name, pwd} = req.body

    UserModel.findOne({name, pwd: md5(pwd)}, _filter, function(err, user){
        if(user){
            res.cookie('userid', user._id)
            res.json({code:0, data:user})
        }else{
            res.json({code:1, msg: 'user name and password do not exist.'})
        }
    } )
})

// update user information route
router.post('/update', function(req, res){
    const userid = req.cookies.userid
    if(!userid){
        return res.send({code:1, msg: 'Please login first.'})
    }
    UserModel.findByIdAndUpdate({_id: userid}, req.body, function(err, user){
        if(!user){
            res.clearCookie('userid')
            res.send({code:1, msg: 'Please login.'})
        }else{
            const {_id, name, type} = user
            user = Object.assign({}, req.body, {_id, name, type}) //for merging objects and return target object
            res.send({code:0, data: user})
        }

    })

})

// according to cookie saved to get users information
router.get('/user', function(req, res){
    const userid = req.cookies.userid
    if(!userid){
        return res.send({code:1, msg: 'please login'})
    }
    UserModel.findOne({_id: userid}, _filter, function(err,user){
        if(!user){
            res.clearCookie('userid')
            res.send({code:1, msg:'Please login'})
        }else{
            res.send({code:0, data:user})
        }
    })
})

// according to user's type to get user list
router.post('/list', function(req, res){
    const {type} = req.body
    UserModel.find({type}, _filter, function(err, users) {
        if (users) {
            return res.json({code: 0, data: users})
        }
    })
})


// get current user's chat list
router.get('/msglist', function(req, res){
    const userid = req.cookies.userid
    // find all users' data
    UserModel.find(function(err, userDocs){
        // save user's data in an object: key is user's _id, val is user's name and avatar
        const users = {}
        userDocs.forEach(doc => {
            users[doc._id] = {name: doc.name, avatar: doc.avatar}
        })
        // find current user chat msg list
        ChatModel.find({'$or': [{from: userid}, {to: userid}]}, _filter, function(err, chatMsgs){
            res.send({code:0, data: {users, chatMsgs}})  // send back all users' data and current user's msg list
        })

    })
})

// update new msg as read
router.post('/readmsg', function(req, res){
    const from = req.body.from
    const to = req.cookies.userid 
    ChatModel.update({from, to, read:false}, {read:true},{multi:true}, function(err, doc){
        console.log('/readmsg', doc)
        res.send({code:0, data: doc.nModified})
    } )

})

// expose router
module.exports = router

