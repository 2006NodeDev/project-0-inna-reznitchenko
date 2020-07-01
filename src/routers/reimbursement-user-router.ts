import express, { Request, Response, NextFunction } from 'express'
import { UserIdInputError } from "../errors/UserIdInputError";
import { getReimbursementByUser } from '../daos/reimbursements-dao';
import { authorizationMiddleware } from '../middleware/authorization-middleware';
import { UnauthorizedEndPointError } from '../errors/UnathorizedEndPointError';

export let reimbursementUsersRouter = express()

reimbursementUsersRouter.get('/:userId', authorizationMiddleware(['admin','finance-manager', 'user']), async (req:Request, res:Response, next:NextFunction) => {
    let {userId} = req.params;
    if(isNaN(+userId)){
        next(new UserIdInputError)
    }
    else if(req.session.user.role === "user" && req.session.user.userId !== +userId){
        next(new UnauthorizedEndPointError)
    }
    try{
        let allReimbursements = await getReimbursementByUser(+userId)
        res.json(allReimbursements)
    }
    catch(e){
        next(e)
    }
})

