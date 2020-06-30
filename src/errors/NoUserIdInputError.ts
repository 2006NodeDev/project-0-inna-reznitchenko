import { HttpError } from './HttpError'

export class NoUserIdInputError extends HttpError{
    constructor(){
        super(400, 'Please Enter a User Id')
    }
}