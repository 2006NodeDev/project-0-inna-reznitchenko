import { HttpError } from './HttpError'

export class UnauthorizedEndPointError extends HttpError{
    constructor(){
        super(401, 'The incoming token has expired')
    }
}