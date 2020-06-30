import express, { Request, Response, NextFunction } from 'express'
import { UserIdInputError } from "../errors/UserIdInputError";
import { getReimbursementByUser } from '../daos/reimbursements-dao';
import { authorizationMiddleware } from '../middleware/authorization-middleware';

export let reimbursementUsersRouter = express()

reimbursementUsersRouter.get('/:userId', authorizationMiddleware(['admin','finance-manager']), async (req:Request, res:Response, next:NextFunction) => {
    console.log("in the router")
    let {userId} = req.params;
    if(isNaN(+userId)){
        throw new UserIdInputError();
    }
    try{
        let allReimbursements = await getReimbursementByUser(+userId)
        res.json(allReimbursements)
    }
    catch(e){
        next(e)
    }
})