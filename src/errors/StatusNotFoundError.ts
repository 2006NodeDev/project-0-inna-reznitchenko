import { HttpError } from './HttpError'

export class StatusNotFoundError extends HttpError{
    constructor(){
        super(404, 'That Status Does Not Exist')
    }
}