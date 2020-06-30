import express, { Request, Response, NextFunction } from 'express'
import { userRouter } from './routers/user-router'
import { loggingMiddleware } from './middleware/logging-middleware'
import { sessionMiddleware } from './middleware/session-middleware'
import { reimbursementRouter } from './routers/reimbursement-router'
import { BadCredentialsError } from './errors/BadCredentialsError'
//import { AuthFailureError } from './errors/AuthFailureError'
//import { authenticationMiddleware } from './middleware/authentication-middleware'
import { getUsernameAndPassword } from './daos/users-dao'
// mport { reimbursementRouter } from './routers/reimbursement-router'

const app = express()

app.use(express.json())

app.use(loggingMiddleware);
app.use(sessionMiddleware);


app.use('/users', userRouter);
app.use('/reimbursements', reimbursementRouter);

app.post('/login', async (req:Request, res:Response, next:NextFunction) =>{
    let username = req.body.username
    let password = req.body.password

    if(!username || !password){
        throw new BadCredentialsError()
    } else {
        try{
            let user = await getUsernameAndPassword(username, password)
            req.session.user = user
            res.json(user)
        }
        catch(e){
            next(e)
        }
    }
})

//app.use(authenticationMiddleware);

app.use((err, req, res, next) => {
    if(err.statusCode){
        res.status(err.statusCode).send(err.message)
    }
    else{
        console.log(err)
        res.status(500).send("something went wrong")
    }
})

app.listen(2006, ()=>{
    console.log('Server has started');
})