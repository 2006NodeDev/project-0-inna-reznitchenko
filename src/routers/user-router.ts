import express, { Request, Response, NextFunction} from 'express'
import { UserIdInputError } from '../errors/UserIdInputError'
import { User } from '../models/User'
import { getAllUsers, getUserById, patchUser } from '../daos/users-dao'


export let userRouter = express.Router()

//will need to get users and confirm that they are finance-managers
userRouter.get('/', async  (req:Request, res:Response, next:NextFunction) => {
    try{
        let allUsers = await getAllUsers()
        res.json(allUsers)
    }
    catch(e){
        next(e)
    }
    //res.json(users);
})

// will need to get user by ID and confirm that the ID is valid
userRouter.get('/:id', async (req:Request, res:Response, next:NextFunction) => {
    let {id} = req.params;
    if(isNaN(+id)){
        throw new UserIdInputError();
    }
    else{
        try{
            let user = await getUserById(+id)
            res.json(user)
        } catch (e){
            next(e)
        }
        // let found = 0
        // for(const user of users){
        //     if(+id === user.userId){
        //         res.json(user)
        //         found=1
        //     }
        // }
        // if(!found){
        //     res.status(404).send("User Not Found.")
        // }
    }
})

userRouter.patch('/', async (req:Request, res:Response, next:NextFunction) => {
    let id = req.body.userId;
    console.log(req.body);
    if(isNaN(+id)){
        throw new UserIdInputError();
    }
    else if(!id){
        res.status(404).send("User Not Found.")
    }
    else{
        let user: User = {
            userId: req.body.userId,
            username: req.body.username, // not null, unique
            password: req.body.password, // not null
            firstName: req.body.firstName, // not null
            lastName: req.body.lastName, // not null
            email: req.body.email,// not null
            role: req.body.role
        }
        try{
            let updatedUser = await patchUser(user)
            res.json(updatedUser)
        } catch (e){
            next(e)
        } 
    }
    //     for(const user of users){
    //         if(+id === user.userId){
    //             let {username, password, firstName, lastName, email, role} = req.body;

    //             if(username != undefined){
    //                 user.username = username;
    //             }
    //             if(password != undefined){
    //                 user.password = password;
    //             }
    //             if(firstName != undefined){
    //                 user.firstName = firstName;
    //             }
    //             if(lastName != undefined){
    //                 user.lastName = lastName;
    //             }

    //             if(email != undefined){
    //                 user.email = email;
    //             }

    //             if(role != undefined){
    //                 user.role = role;
    //             }
    //             res.json(user);
    //         }
    //     }
    // }
})
    
    // if(!id){
    //     throw new Error("Id not found");
    // }
    // else if(isNaN(+id)){
    //     throw new UserIdInputError();
    // }
    // else{
    //     try{
    //         let user = await patchUser(+id)

    //     } catch(e){
    //         next(e)
    //     }
    // }
//})

// userRouter.post('/', (req:Request, res:Response) =>{
//     console.log(req.body);
//     let {userId,
//         username,
//         password,
//         firstName,
//         lastName,
//         email,
//         role} = req.body;
    
//     if(userId && username && password && firstName && lastName && email && role){
//         users.push({userId, username, password, firstName, lastName, email, role});
//         res.sendStatus(201); //created a new object
//     }
//     else{
//         throw new UserInputError();
//     }
// })

export let users:User[] =[
    {
        userId:1,
        username:'innarez',
        password:'password',
        firstName:'Inna',
        lastName:'Reznitchenko',
        email:'innarez@gmail.com',
        role:{
            roleId: 1,
            role: 'admin'
        }
    }, 
    {
        userId:2,
        username:'maxrez',
        password:'password',
        firstName:'Max',
        lastName:'Reznitchenko',
        email:'maxrez@gmail.com',
        role:{
            roleId:2,
            role:'finance-manager'
        }
    },
    {
        userId:3,
        username:'kristiroz',
        password:'password',
        firstName:'Kristi',
        lastName:'Rozum',
        email:'kroz@gmail.com',
        role:{
            roleId:2,
            role:'finance-manager'
        }
    },
    {
        userId:4,
        username:'samf',
        password:'password',
        firstName:'Sam',
        lastName:'Flynn',
        email:'samflynn90@gmail.com',
        role:{
            roleId:3,
            role:'user'
        }
    },
    {
        userId:5,
        username:'kelseyb123',
        password:'password',
        firstName:'Kelsey',
        lastName:'Bechtel',
        email:'kelsey.b@gmail.com',
        role:{
            roleId:3,
            role:'user'
        }
    }
]
 
