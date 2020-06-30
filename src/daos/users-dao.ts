import { PoolClient, QueryResult } from "pg";
import { connectionPool } from ".";
import { UserDTOtoUserConvertor } from "../utils/userDTO-to-user-convertor";
import { UserNotFoundError } from "../errors/UserNotFoundError";
import { User } from "../models/User";
import { BadCredentialsError } from "../errors/BadCredentialsError";

export async function getAllUsers():Promise<User[]>{
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

export async function getUserById(id: number):Promise<User>{
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
        console.log(results.rowCount)
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

export async function patchUser(user:User):Promise<User>{
    console.log("in patch")
    let client:PoolClient;
    try{
        client = await connectionPool.connect()
        await client.query('BEGIN;')

        //check if the user to update exists
        let userId = await client.query(`select u.user_id from user_reimbursement.users u 
        where u.user_id = $1`, [user.userId])

        if(userId.rowCount === 0){
            throw new Error('User Not Found.')
        }
        userId = userId.rows[0].user_id
  

        if(user.username != undefined){
            console.log("in the username")
            let updateResults = await client.query(`update user_reimbursement.users 
            set "username" = $1 where user_id = $2;`,[user.username, userId])
            console.log(updateResults.rows[0])
        }
        if(user.password != undefined){
            console.log("in the password")
            let updateResults = await client.query(`update user_reimbursement.users 
            set "password" = $1 where user_id = $2;`,[user.password, userId])
            console.log(updateResults.rows[0])
        }
        if(user.firstName != undefined){
            console.log("in the firstName")
            let updateResults = await client.query(`update user_reimbursement.users 
            set "first_name" = $1 where user_id = $2;`,[user.firstName, userId])
            console.log(updateResults.rows[0])
        }
        if(user.lastName != undefined){
            console.log("in the lastName")
            let updateResults = await client.query(`update user_reimbursement.users 
            set "last_name" = $1 where user_id = $2;`,[user.lastName, userId])
            console.log(updateResults.rows[0])
        }
        if(user.email != undefined){
            console.log("in the email")
            let updateResults = await client.query(`update user_reimbursement.users 
            set "last_name" = $1 where user_id = $2;`,[user.email, userId])
            console.log(updateResults.rows[0])
        }
        if(user.role != undefined){
            console.log("in the role")
            let roleId = await client.query('select r.role_id from user_reimbursement.roles r where r.role = $1', [user.role])
            
            if(roleId.rowCount === 0){
                throw new Error('Role Not Found.')
            }
            roleId = roleId.rows[0].role_id

            let updateResults = await client.query(`update user_reimbursement.users 
            set "role" = $1 where user_id = $2;`,[roleId, userId])
            console.log(updateResults.rows[0])
        }

        let result:QueryResult = await client.query(`select u.user_id, 
        u.username , 
        u."password" , 
        u.email ,
        r.role_id , 
        r."role" 
        from user_reimbursement.users u left join user_reimbursement.roles r on u."role" = r.role_id 
        where u.user_id = $1;`,
        [userId])
        await client.query('COMMIT;')
        return UserDTOtoUserConvertor(result.rows[0])
    }
    catch(e){
        client && client.query('ROLLBACK;')
        if(e.message === 'User Not Found'){
            throw new UserNotFoundError()
        }
        if(e.message === 'Role Not Found'){
            throw new Error('Rollback Error')
        }
        console.log(e)
        throw new Error('Unhandled Error Occured')
    }
    finally{
        client && client.release()
    }
}

export async function getUsernameAndPassword(username:string, password:string):Promise<User>{
    let client: PoolClient
    try{
        client = await connectionPool.connect()
        let results = await client.query(`select u.user_id, 
        u.username, 
        u."password", 
        u.first_name, 
        u.last_name, 
        u.email , 
        r.role_id , 
        r."role" 
        from user_reimbursement.users u left join user_reimbursement.roles r on u."role" = r.role_id
        where u.username = $1 and u.password = $2;`,[username, password])
        if(results.rowCount === 0 ){
            throw new Error('User Not Found')
        }
        return UserDTOtoUserConvertor(results.rows[0])
    }
    catch(e){
        if(e.message === 'User Not Found'){
            throw new BadCredentialsError()
        }
        console.log(e)
        throw new Error('Unhandled Error Occured')
    }
    finally{
        client && client.release()
    }
}