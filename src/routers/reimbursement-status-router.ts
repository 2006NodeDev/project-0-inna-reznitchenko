import express, { Request, Response, NextFunction } from 'express'
import { StatusIdInputError } from '../errors/StatusIdInputError';
import { getReimbursementByStatus } from '../daos/reimbursements-dao';

export let reimbursementStatusRouter = express()


reimbursementStatusRouter.get('/:statusId', async (req:Request, res:Response, next:NextFunction) => {
    console.log("in the router")
    let {statusId} = req.params;
    if(isNaN(+statusId)){
        throw new StatusIdInputError();
    }
    try{
        let allReimbursements = await getReimbursementByStatus(+statusId)
        res.json(allReimbursements)
    }
    catch(e){
        next(e)
    }
    // }
    // let {statusId} = req.params
    // let statusReimbursements = []

    // console.log(req.params)
    // console.log(+statusId)
    // if(isNaN(+statusId)){
    //     throw new StatusIdInputError();
    // }
    // else{
    //     let found = 0
    //     for(const r of reimbursements){
    //         if(+statusId === r.status){
    //             statusReimbursements.push(r)
    //             found=1
    //         }
    //     }
    //     if(!found){
    //         res.status(404).send("Reimbursement With Status ID Not Found.")
    //     }
    //     else{
    //         var sortedReimbursements= statusReimbursements.sort(sortBy('dateResolved'));
    //         res.send(sortedReimbursements);
    //     }
    // }

})