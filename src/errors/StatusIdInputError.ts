import { HttpError } from './HttpError'

export class StatusIdInputError extends HttpError{
    constructor(){
        super(400, "Id must be a number")
    }
}