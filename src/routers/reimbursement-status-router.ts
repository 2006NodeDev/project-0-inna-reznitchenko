import express, { Request, Response, NextFunction } from 'express'
import { StatusIdInputError } from '../errors/StatusIdInputError';
import { getReimbursementByStatus } from '../daos/reimbursements-dao';
import { authorizationMiddleware } from '../middleware/authorization-middleware';

export let reimbursementStatusRouter = express()

reimbursementStatusRouter.get('/:statusId', authorizationMiddleware(['admin','finance-manager']), async (req:Request, res:Response, next:NextFunction) => {
    let {statusId} = req.params;
    if(isNaN(+statusId)){
        next(new StatusIdInputError)
    }
    try{
        let allReimbursements = await getReimbursementByStatus(+statusId)
        res.json(allReimbursements)
    }
    catch(e){
        next(e)
    }
})