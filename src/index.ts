import express from 'express'
import { userRouter } from './routers/user-router'
import { loggingMiddleware } from './middleware/logging-middleware'
import { sessionMiddleware } from './middleware/session-middleware'
import { reimbursementRouter } from './routers/reimbursement-router'
// mport { reimbursementRouter } from './routers/reimbursement-router'

const app = express()

app.use(express.json())

app.use(loggingMiddleware);
app.use(sessionMiddleware);

app.use('/users', userRouter);
app.use('/reimbursements', reimbursementRouter);

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