import express, { Request, Response, NextFunction } from "express"
import { reimbursementStatusRouter } from "./reimbursement-status-router"
import { reimbursementUsersRouter } from "./reimbursement-user-router"
import { NewReimbursementInputError } from "../errors/NewReimbursementInputError"
import { Reimbursement } from "../models/Reimbursement"
import { saveNewReimbursement } from "../daos/reimbursements-dao"
//import { Reimbursement } from "../models/Reimbursement"
//import { ReimbursementStatus } from "../models/ReimbursementStatus"
//import { ReimbursementType } from "../models/ReimbursementType"

export let reimbursementRouter = express.Router()

reimbursementRouter.use('/status', reimbursementStatusRouter)
reimbursementRouter.use('/author/userId', reimbursementUsersRouter)

reimbursementRouter.post('/', async (req:Request, res:Response, next:NextFunction) => {
    console.log(req.body);
    let {author,
        amount,
        dateSubmitted,
        dateResolved,
        description,
        resolver,
        status,
        type} = req.body;

        if(!author || !amount || !dateSubmitted || !dateResolved || !description || !resolver || !status || !type){
            throw new NewReimbursementInputError();
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
        
//     if(userId && username && password && firstName && lastName && email && role){
//         users.push({userId, username, password, firstName, lastName, email, role});
//         res.sendStatus(201); //created a new object
//     }
//     else{
//         throw new UserInputError();
//     }


// reimbursementRouter.get('/', (req:Request, res:Response, next:NextFunction) => {
//     res.json(reimbursements);
// })


// export let reimbursements:Reimbursement[] = [
//     {
//         reimbursementId: 1,
//         author: 2,
//         amount: 45.00,
//         dateSubmitted: 5.23,
//         dateResolved: 5.31,
//         description: 'okay',
//         resolver: 4,
//         status: 2,
//         type: 4
//     },
//     {
//         reimbursementId: 2,
//         author: 1,
//         amount: 90.00,
//         dateSubmitted: 6.2,
//         dateResolved: 6.21,
//         description: 'good',
//         resolver: 3,
//         status: 1,
//         type: 2
//     },
//     {
//         reimbursementId: 3,
//         author: 1,
//         amount: 100.00,
//         dateSubmitted: 4.30,
//         dateResolved: 5.5,
//         description: 'good',
//         resolver: 5,
//         status: 3,
//         type: 1
//     },
//     {
//         reimbursementId: 3,
//         author: 1,
//         amount: 100.00,
//         dateSubmitted: 4.15,
//         dateResolved: 5.25,
//         description: 'good',
//         resolver: 2,
//         status: 2,
//         type: 1
//     },
//     {
//         reimbursementId: 3,
//         author: 2,
//         amount: 100.00,
//         dateSubmitted: 5.24,
//         dateResolved: 6.15,
//         description: 'good',
//         resolver: 3,
//         status: 2,
//         type: 4
//     }

// ]

// export let reimbursementStatus:ReimbursementStatus[]=[
//     {
//         statusId:1,
//         status:'Pending'
//     },
//     {
//         statusId:2,
//         status:'Approved'
//     },
//     {
//         statusId:3,
//         status:'Denied'
//     }
// ]

// export let reimbursementType:ReimbursementType[]=[
//     {
//         typeId:1,
//         type:'Maintenance'
//     },
//     {
//         typeId:2,
//         type:'Inventory'
//     },
//     {
//         typeId:3,
//         type:'Food'
//     },
//     {
//         typeId:4,
//         type:'Payroll'
//     }
// ]


