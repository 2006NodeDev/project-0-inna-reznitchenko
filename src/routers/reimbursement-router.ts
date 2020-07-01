import express, { Request, Response, NextFunction } from "express"
import { reimbursementStatusRouter } from "./reimbursement-status-router"
import { reimbursementUsersRouter } from "./reimbursement-user-router"
import { NewReimbursementInputError } from "../errors/NewReimbursementInputError"
import { Reimbursement } from "../models/Reimbursement"
import { saveNewReimbursement, patchReimbursement, getAllReimbursements } from "../daos/reimbursements-dao"
import { ReimbursementIdInputError } from "../errors/ReimbursementIdInputError"
import { authorizationMiddleware } from "../middleware/authorization-middleware"
import { authenticationMiddleware } from "../middleware/authentication-middleware"

export let reimbursementRouter = express.Router()

reimbursementRouter.use(authenticationMiddleware);
reimbursementRouter.use('/status', reimbursementStatusRouter)
reimbursementRouter.use('/author/userId', reimbursementUsersRouter)

reimbursementRouter.get('/', authorizationMiddleware(['admin','finance-manager']), async  (req:Request, res:Response, next:NextFunction) => {
    try{
        let allReimbursements = await getAllReimbursements()
        res.json(allReimbursements)
    }
    catch(e){
        next(e)
    }
})

reimbursementRouter.post('/', authorizationMiddleware(['admin','finance-manager','user']), async (req:Request, res:Response, next:NextFunction) => {
    let {author,
        amount,
        dateSubmitted,
        dateResolved,
        description,
        resolver,
        status,
        type} = req.body;
        
        if(!author || !amount || !dateSubmitted || !dateResolved || !description || !resolver || !status || !type){
            next(new NewReimbursementInputError)
        }
        else{
            console.log("in the else")
            let newReimbursement: Reimbursement = {
                reimbursementId: 0,
                author,
                amount,
                dateSubmitted,
                dateResolved,
                description,
                resolver,
                status,
                type}
            try{
                let savedReimbursement = await saveNewReimbursement(newReimbursement)
                res.status(201).send("Created")
                res.json(savedReimbursement)
            } catch (e){
                next(e)
            }   
        }
})

reimbursementRouter.patch('/', authorizationMiddleware(['admin','finance-manager']), async (req:Request, res:Response, next:NextFunction) => {
    let id = req.body.reimbursementId;
    if(isNaN(+id)){
        next(new ReimbursementIdInputError);
    }
    else{
        let reimbursement: Reimbursement = {
            reimbursementId: req.body.reimbursementId,
            author: req.body.author, 
            amount: req.body.amount, 
            dateSubmitted: req.body.dateSubmitted, 
            dateResolved: req.body.dateResolved, 
            description: req.body.description, 
            resolver: req.body.resolver, 
            status: req.body.status, 
            type: req.body.type
        }
        console.log("in the router, just set the reimbursement")
        console.log(reimbursement)
        try{
            let updatedReimbursement = await patchReimbursement(reimbursement)
            res.json(updatedReimbursement)
        } catch (e){
            next(e)
        } 
    }
})
        
