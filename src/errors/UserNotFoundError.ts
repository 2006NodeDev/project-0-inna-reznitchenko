import { HttpError } from './HttpError'

export class UserNotFoundError extends HttpError{
    constructor(){
        super(404, 'That User Does Not Exist')
    }
}