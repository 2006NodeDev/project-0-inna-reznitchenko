import session, { SessionOptions } from 'express-session'

const sessionConfig:SessionOptions = {
    secret: 'secret',
    cookie:{
        secure:false
    },
    resave:false,
    saveUninitialized:false
}

//call session with our session config
export const sessionMiddleware = session(sessionConfig)