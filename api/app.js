const express = require('express')
const { moongose } = require('./db/mongoose')
const bodyParser = require('body-parser');
const app = express()
const jwt = require('jsonwebtoken')
    //app.use(bodyParser.urlencoded({ extended: true }));
    //Load Middleware
app.use(bodyParser.json());

//CORS Middle ware
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");

    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token'
    );

    next();
});

//MIDDLE WARE
let verifySession = (req, res, next) => {
    // grab the refresh token from the request header
    let refreshToken = req.header('x-refresh-token');

    // grab the _id from the request header
    let _id = req.header('_id');

    user.findbyIdandToken(_id, refreshToken).then((User) => {
        if (!User) {
            // user couldn't be found
            return Promise.reject({
                'error': 'User not found. Make sure that the refresh token and user id are correct'
            });
        }


        // if the code reaches here - the user was found
        // therefore the refresh token exists in the database - but we still have to check if it has expired or not

        req.user_id = User._id;
        req.userObject = User;
        req.refreshToken = refreshToken;

        let isSessionValid = false;

        User.sessions.forEach((session) => {
            if (session.token === refreshToken) {
                // check if the session has expired
                if (user.hasRefreshTokenExpired(session.expiresAt) === false) {
                    // refresh token has not expired
                    isSessionValid = true;
                }
            }
        });

        if (isSessionValid) {
            // the session is VALID - call next() to continue with processing this web request
            next();
        } else {
            // the session is not valid
            return Promise.reject({
                'error': 'Refresh token has expired or the session is invalid'
            })
        }

    }).catch((e) => {
        res.status(401).send(e);
    })
}



//Moongose models
const list = require('./db/models/list_model')
const task = require('./db/models/task_models')
const user = require('./db/models/user_models')



//If request have valid jwt
let authenticate = (req, res, next) => {
    let token = req.header('x-access-token')

    jwt.verify(token, user.getJWTSecret(), (err, decoded) => {
        if (err) {

            res.status(401).send(err)
        } else {
            req.user_id = decoded._id
            next()
        }
    })
}



/* USER ROUTES */
//SIGN UP ROUTE

/*POST /users
 *
 */

app.get('/hello', (req, res) => {
    res.send('Hello')
})
app.post('/users', (req, res) => {
    // User sign up

    let body = req.body;
    let newUser = new user(body);

    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        // Session created successfully - refreshToken returned.
        // now we geneate an access auth token for the user

        return newUser.generateAccessAuthToken().then((accessToken) => {
            // access auth token generated successfully, now we return an object containing the auth tokens
            return { accessToken, refreshToken }
        });
    }).then((authTokens) => {
        // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
        res
            .header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .send(newUser);
    }).catch((e) => {
        res.status(400).send(e);
    })
})


/*Post : /users/Login
 * 
 */
app.post('/users/login', (req, res) => {
        let email = req.body.email;
        let password = req.body.password;

        user.findbyCredentials(email, password).then((user) => {
            return user.createSession().then((refreshToken) => {
                // Session created successfully - refreshToken returned.
                // now we geneate an access auth token for the user

                return user.generateAccessAuthToken().then((accessToken) => {
                    // access auth token generated successfully, now we return an object containing the auth tokens
                    return { accessToken, refreshToken }
                });
            }).then((authTokens) => {
                // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
                res
                    .header('x-refresh-token', authTokens.refreshToken)
                    .header('x-access-token', authTokens.accessToken)
                    .send(user);
            })
        }).catch((e) => {
            res.status(400).send(e);
        });
    })
    /**
     * GET /users/me/access-token
     * Purpose: generates and returns an access token
     */
app.get('/users/me/access-token', verifySession, (req, res) => {
    // we know that the user/caller is authenticated and we have the user_id and user object available to us
    req.userObject.generateAccessAuthToken().then((accessToken) => {
        res.header('x-access-token', accessToken).send({ accessToken });
    }).catch((e) => {
        res.status(400).send(e);
    });
})



/* List Routes */
/*
 *GET /lists
 *Pupose: Get all lists in the database
 */
app.get('/lists', authenticate, (req, res) => {
    //return array of lists in db for that user
    list.find({
        _userId: req.user_id
    }).then((list) => {
        res.send(list)
    })
})

/*
 *POST /lists
 *Pupose: Create new list
 */
app.post('/lists', authenticate, (req, res) => {
    //Create new list and return new list document back to user

    console.log(req.body.title)
    let title = req.body.title
    let newList = new list({
        title,
        _userId: req.user_id
    })
    newList.save().then((listDoc) => {
        res.send(listDoc)
    })

})

/*
 *Patch /lists
 *Pupose: Update a list
 */
app.patch('/lists/:id', authenticate, (req, res) => {
    //we want to update the specified list
    list.findOneAndUpdate({
        _id: req.params.id,
        _userId: req.user_id
    }, {
        $set: req.body
    }).then(() => {
        res.send({ 'message': 'Updated Successfully' })
    }).catch((e) => {
        console.log(e)
    })
})

/*
 *Delete /lists
 *Pupose: Delete a list
 */
app.delete('/lists/:id', authenticate, (req, res) => {
    list.findByIdAndRemove({
        _id: req.params.id,
        _userId: req.user_id
    }).then((removedListDoc) => {
        res.send(removedListDoc)
        deleteTaskFromList(removedListDoc._id)
    })
})


/*
 *GET /tasks
 *Pupose: Get Tasks of a list
 */
app.get('/lists/:listId/tasks', authenticate, (req, res) => {
    task.find({
        _listId: req.params.listId
    }).then((tasks) => {
        res.send(tasks)
    })
})

/*
 *Post /tasks
 *Pupose: Put new Tasks of a list
 */
app.post('/lists/:listId/tasks', authenticate, (req, res) => {

        list.findOne({
            _id: req.params.listId,
            _userId: req.user_id
        }).then(list => {
            if (list) {
                return true
            }
            return false
        }).then((canCreateTask) => {
            if (canCreateTask) {
                let newTask = new task({
                    title: req.body.title,
                    _listId: req.params.listId
                })
                newTask.save().then((taskDoc) => {
                    res.send(taskDoc)
                })
            } else {
                res.sendStatus(404)
            }
        })

    })
    //     /*
    //      *Get /list/:listId/Task/:taskId
    //      *Pupose: Get a Task in a list
    //      */
    // app.get('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {
    //     //we want to update the specified task in a list
    //     list.findOne({
    //         _id: req.params.listId,
    //         _userId: req.params.listId
    //     })
    //     task.findOne({
    //         _id: req.params.taskId,
    //         _listId: req.params.listId
    //     }).then((task) => {
    //         res.send(task)
    //     }).catch((e) => {
    //         console.log(e)
    //     })
    // })


/*
 *Patch /list/:listId/Task/:taskId
 *Pupose: Update a Task in a list
 */
app.patch('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {
    //we want to update the specified task in a list

    list.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if (list) {
            return true;
        }
        return false;
    }).then((canUpdateTasks) => {
        if (canUpdateTasks) {
            task.findOneAndUpdate({
                _id: req.params.taskId,
                _listId: req.params.listId
            }, {
                $set: req.body
            }).then(() => {
                res.send({ message: 'Updated title of task Succesfully' })
            }).catch((e) => {
                console.log(e)
            })
        } else {
            res.sendStatus(404);
        }
    })

})

/*
 *Delete /list/:listId/Task/:taskId
 *Pupose: Delete a Task in a list
 */
app.delete('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {
    list.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if (list) {
            // list object with the specified conditions was found
            // therefore the currently authenticated user can make updates to tasks within this list
            return true;
        }
        // else - the list object is undefined
        return false;
    }).then((canDeleteTask) => {
        if (canDeleteTask) {
            task.findByIdAndRemove({
                _id: req.params.taskId,
                _listId: req.params.listId
            }).then((removedTaskDoc) => {
                res.send(removedTaskDoc)
            })
        } else {
            res.sendStatus(404)
        }
    })
})


/*HELPER METHODS */


let deleteTaskFromList = (_listId) => {
    task.deleteMany({
        _listId
    }).then(() => {
        console.log(`Task deleted from ${listId}`)
    })
}


const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log('Server listening on the port' + PORT)
})