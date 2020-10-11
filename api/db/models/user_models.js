const mongoose = require('mongoose')
const _ = require('lodash')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')



//JWT Secret
const jwtSecret = '237918212shxvshbxhv287w87982182892uxhsh'

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    sessions: [{
        token: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Number,
            required: true
        }
    }]
});

userSchema.statics.getJWTSecret = () => {
    return jwtSecret
}

//Instance Method

userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject();

    return _.omit(userObject, ['password', 'sessions'])
}

userSchema.methods.generateAccessAuthToken = function() {
    const user = this
    return new Promise((resolve, reject) => {
        jwt.sign({ _id: user._id.toHexString() }, jwtSecret, { expiresIn: "15m" }, (err, token) => {
            if (!err) {
                resolve(token)
            } else {
                reject();
            }
        })
    })
}

userSchema.methods.generateRefreshAuthToken = function() {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, buf) => {
            if (!err) {
                let token = buf.toString('hex')
                return resolve(token)
            }
        })

    })
}

userSchema.methods.createSession = function() {
    let user = this

    return user.generateRefreshAuthToken().then((refreshToken) => {
        return saveSessionToDatabase(user, refreshToken)
    }).then((refreshToken) => {
        return refreshToken
    }).catch(e => {
        return Promise.reject(e)
    })
}

userSchema.statics.hasRefreshTokenExpired = (expiresAt) => {
    let secondsinceEpoch = Date.now() / 1000;
    if (expiresAt > secondsinceEpoch) {
        return false
    } else {
        return true
    }
}

userSchema.statics.findbyIdandToken = function(_id, token) {
    const user = this
    return user.findOne({
        _id,
        'sessions.token': token
    })
}

userSchema.statics.findbyCredentials = function(email, password) {
    const user = this
    return user.findOne({
        email
    }).then(user => {
        if (!user) {
            return new Promise.reject();
        } else {
            return new Promise((resolve, reject) => {
                bcrypt.compare(password, user.password, (err, res) => {
                    if (res) {
                        resolve(user)
                    } else {
                        reject();
                    }
                })
            })
        }
    })
}

userSchema.pre('save', function(next) {
    let user = this
    let costFactor = 10;
    if (user.isModified('password')) {
        //If the password field has been edited then run this code
        bcrypt.genSalt(costFactor, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }
})

let saveSessionToDatabase = (user, refreshToken) => {
    return new Promise((resolve, reject) => {
        let expiresAt = generateRefreshTokenExpiryTime()
        user.sessions.push({ token: refreshToken, expiresAt })

        user.save().then(() => {
            return resolve(refreshToken)
        }).catch((e) => {
            reject(e)
        })
    })
}

let generateRefreshTokenExpiryTime = () => {
    let daysUntilExpire = '10'
    let secondsUntilExpire = (daysUntilExpire * 24 * 60 * 60)

    return (Date.now() / 1000 + secondsUntilExpire)
}


const User = mongoose.model('User', userSchema);

module.exports = User