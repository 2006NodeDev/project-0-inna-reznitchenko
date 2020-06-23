import express, {Request, Response } from 'express'
import {User} from './models/User'


const app = express()

app.listen(2006, ()=>{
    console.log('Server has started');
})

app.get('/users', (req:Request, res:Response) => {
    res.json(users)
})

let users:User[] =[
    {
        userId: 6209,
        username: 'innarez',
        password: 'password',
        firstName: 'Inna',
        lastName: 'Reznitchenko', 
        email: 'innavrez@gmail.com',
        role: [{
            roleId: 1,
            role: 'finance-manager'
        }]
    },
    {
        userId: 2011,
        username: 'sjf54',
        password: 'password',
        firstName: 'Sam',
        lastName: 'Flynn', 
        email: 'sflynn@gmail.com',
        role: [{
            roleId: 1,
            role: 'finance-manager'
        }]
    },
    {
        userId: 1984,
        username: 'maxrez',
        password: 'password',
        firstName: 'Max',
        lastName: 'Reznitchenko', 
        email: 'maxrez@gmail.com',
        role: [{
            roleId: 2,
            role: 'admin'
        }]
    }
]