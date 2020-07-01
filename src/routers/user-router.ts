import express, { Request, Response, NextFunction} from 'express'
import { UserIdInputError } from '../errors/UserIdInputError'
import { User } from '../models/User'
import { getAllUsers, getUserById, patchUser } from '../daos/users-dao'
import { authorizationMiddleware } from '../middleware/authorization-middleware'
import { authenticationMiddleware } from '../middleware/authentication-middleware'
import { UnauthorizedEndPointError } from '../errors/UnathorizedEndPointError'

export let userRouter = express.Router()

userRouter.use(authenticationMiddleware);

userRouter.get('/', authorizationMiddleware(['admin','finance-manager']), async  (req:Request, res:Response, next:NextFunction) => {
    try{
        let allUsers = await getAllUsers()
        res.json(allUsers)
    }
    catch(e){
        next(e)
    }
})

userRouter.get('/:id', authorizationMiddleware(['admin','finance-manager','user']), async (req:Request, res:Response, next:NextFunction) => {
    let {id} = req.params;
    if(isNaN(+id)){
        next(new UserIdInputError)
    }
    else if(req.session.user.role === "user" && req.session.user.userId !== +id){
        next(new UnauthorizedEndPointError)
    }
    else{
        try{
            let user = await getUserById(+id)
            res.json(user)
        } catch (e){
            next(e)
        }
    }
})

userRouter.patch('/', authorizationMiddleware(['admin']), async (req:Request, res:Response, next:NextFunction) => {
    let id = req.body.userId;
    console.log(req.body);
    console.log(id)
    if(isNaN(+id)){
        next(new UserIdInputError)
    }
    else{
        let user: User = {
            userId: req.body.userId,
            username: req.body.username, 
            password: req.body.password, 
            firstName: req.body.firstName, 
            lastName: req.body.lastName, 
            email: req.body.email,
            role: req.body.role
        }
        console.log("in the router, just set the user")
        console.log(user)
        try{
            let updatedUser = await patchUser(user)
            res.json(updatedUser)
        } catch (e){
            next(e)
        } 
    }
})
    

 
