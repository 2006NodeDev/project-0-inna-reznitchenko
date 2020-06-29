import { HttpError } from './HttpError'

export class NewReimbursementInputError extends HttpError{
    constructor(){
        super(400, "Incorrect Reimbursement Arguments Entered.")
    }
}