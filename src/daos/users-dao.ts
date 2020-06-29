import { PoolClient, QueryResult } from "pg";
import { connectionPool } from ".";
import { UserDTOtoUserConvertor } from "../utils/userDTO-to-user-convertor";
import { UserNotFoundError } from "../errors/UserNotFoundError";
import { User } from "../models/User";

export async function getAllUsers(){
    let client:PoolClient;
    try{
        client = await connectionPool.connect()
        let results:QueryResult = await client.query(`select u.user_id, 
        u.username , 
        u."password" , 
        u.first_name, 
        u.last_name, 
        u.email , 
        r.role_id , 
        r."role" from user_reimbursement.users u left join user_reimbursement.roles r on u."role" = r.role_id;`)
        return results.rows.map(UserDTOtoUserConvertor);
    }
    catch(e){
        console.log(e);
        throw new Error('Unhandeled Error Occured')
    }
    finally{
        client && client.release();
    }
}

export async function getUserById(id: number){
    let client:PoolClient;
    try{
        client = await connectionPool.connect()
        let results:QueryResult = await client.query(`select u.user_id, 
        u.username , 
        u."password" , 
        u.email ,
        r.role_id , 
        r."role" 
        from user_reimbursement.users u left join user_reimbursement.roles r on u."role" = r.role_id 
        where u.user_id = $1;`,
        [id])

        if(results.rowCount === 0){
            throw new Error('User Not Found')
        }
        return UserDTOtoUserConvertor(results.rows[0])
    } catch(e){
        if(e.message === 'User Not Found'){
            throw new UserNotFoundError()
        }
        console.log(e);
        throw new Error('Unhandled Error Occured')
    } finally {
        client && client.release()
    }
}

export async function patchUser(user:User){
    let client:PoolClient;
    try{
        client = await connectionPool.connect()
        await client.query('BEGIN;')

        //check if the user to update exists
        let userId = await client.query(`select u.user_id 
        from user_reimbursement.users u 
        where u.user_id = $1`, [user.userId])

        if(userId.rowCount === 0){
            throw new Error('User Not Found.')
        }
        userId = userId.rows[0].user_id
        // results:QueryResult = await client.query(`update users set $1 where user_id = $2 returning user_id;`,[updateStr, id])
        //console.log(results)
        if(user.username != undefined){
            let userUpdate = await client.query(`update user_reimbursement.users set "username" = $1 where user_id = $2;`,[user.username, userId])
            console.log(userUpdate.rows)
            return userUpdate
        }
        // if(password != undefined){
        //     user.password = password;
        // }
        // if(firstName != undefined){
        //     user.firstName = firstName;
        // }
        // if(lastName != undefined){
        //     user.lastName = lastName;
        // }
        // if(email != undefined){
        //     user.email = email;
        // }
        // if(role != undefined){
        //     user.role = role;
        // }
        return "hello"
    }
    catch(e){
        throw new Error('Unhandled Error Occured')
    }
    finally{

    }
}