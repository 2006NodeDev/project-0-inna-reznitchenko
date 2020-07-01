import { PoolClient, QueryResult } from "pg";
import { connectionPool } from ".";
import { StatusNotFoundError } from "../errors/StatusNotFoundError";
import { ReimbursementDTOToReimbursementConvertor } from "../utils/reimbursementDTO-to-remibursement-convertor";
import { Reimbursement } from "../models/Reimbursement";
import { NewReimbursementInputError } from "../errors/NewReimbursementInputError";
import { UserNotFoundError } from "../errors/UserNotFoundError";

export async function getAllReimbursements():Promise<Reimbursement[]>{
    let client:PoolClient;
    try{
        client = await connectionPool.connect()
        let results:QueryResult = await client.query(`select r.reimbursement_id,
        u1.user_id as author, 
        r.amount, 
        r.date_submitted, 
        r.date_resolved, 
        r.description, 
        u2.user_id as resolver, 
        rs.status, 
        rs.status_id, 
        rt."type", 
        rt.type_id 
        from user_reimbursement.reimbursements r
        left join user_reimbursement.reimbursement_types rt on r."type" = rt.type_id
        left join user_reimbursement.reimbursement_status rs on r.status = rs.status_id
        left join user_reimbursement.users u1 on r.author = u1.user_id
        left join user_reimbursement.users u2 on r.resolver = u2.user_id`,)
        return results.rows.map(ReimbursementDTOToReimbursementConvertor);
    }
    catch(e){
        console.log(e);
        throw new Error('Unhandeled Error Occured')
    }
    finally{
        client && client.release();
    }
}


export async function getReimbursementByStatus(statusId: number):Promise<Reimbursement[]>{
    console.log("in the dao")
    let client:PoolClient;
    try{
        client = await connectionPool.connect()
        let results:QueryResult = await client.query(`select r.reimbursement_id,
        u1.user_id as author, 
        r.amount, 
        r.date_submitted, 
        r.date_resolved, 
        r.description, 
        u2.user_id as resolver, 
        rs.status, 
        rs.status_id, 
        rt."type", 
        rt.type_id 
        from user_reimbursement.reimbursements r
        left join user_reimbursement.reimbursement_types rt on r."type" = rt.type_id
        left join user_reimbursement.reimbursement_status rs on r.status = rs.status_id
        left join user_reimbursement.users u1 on r.author = u1.user_id
        left join user_reimbursement.users u2 on r.resolver = u2.user_id
        where r.status = $1
        order by r.date_submitted;`,
        [statusId])

        if(results.rowCount === 0){
            throw new Error('Status Not Found')
        }
        console.log(results.rows.map(ReimbursementDTOToReimbursementConvertor))
        return results.rows.map(ReimbursementDTOToReimbursementConvertor);
    } catch(e){
        if(e.message === 'Status Not Found'){
            throw new StatusNotFoundError()
        }
        console.log(e);
        throw new Error('Unhandled Error Occured')
    } finally {
        client && client.release()
    }
}

export async function getReimbursementByUser(userId: number):Promise<Reimbursement[]>{
    let client:PoolClient;
    try{
        client = await connectionPool.connect()
        let results:QueryResult = await client.query(`select r.reimbursement_id, 
        u1.user_id as author, 
        r.amount, 
        r.date_submitted, 
        r.date_resolved, 
        r.description, 
        u2.user_id as resolver, 
        rs.status, 
        rs.status_id, 
        rt."type", 
        rt.type_id 
        from user_reimbursement.reimbursements r
        left join user_reimbursement.reimbursement_types rt on r."type" = rt.type_id
        left join user_reimbursement.reimbursement_status rs on r.status = rs.status_id
        left join user_reimbursement.users u1 on r.author = u1.user_id
        left join user_reimbursement.users u2 on r.resolver = u2.user_id
        where u1.user_id = $1
        order by r.date_submitted;`,
        [userId])
        console.log(results.rows)
        if(results.rowCount === 0){
            throw new Error('User Not Found')
        }
        return results.rows.map(ReimbursementDTOToReimbursementConvertor);
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

export async function saveNewReimbursement(newReimbursement:Reimbursement):Promise<Reimbursement>{
    console.log("in save new reimbursement")
    console.log(newReimbursement)
    let client:PoolClient
    try{
        client = await connectionPool.connect()
        await client.query('BEGIN;')
        
        let author = await client.query(`select u.user_id
        from user_reimbursement.users u
        where u.user_id = $1`, [newReimbursement.author])
        
        if(author.rowCount === 0){
            throw new Error('Author Not Found.')
        }

        let resolver = await client.query(`select u.user_id
        from user_reimbursement.users u
        where u.user_id = $1`, [newReimbursement.resolver])
        
        if(resolver.rowCount === 0){
            throw new Error('Resolver Not Found.')
        }
        let statusId = await client.query(`select s.status_id from user_reimbursement.reimbursement_status s 
        where s.status = $1`, [newReimbursement.status])
            
        if(statusId.rowCount === 0){
            throw new Error('Status Not Found.')
        }
        
        statusId = statusId.rows[0].status_id

        let typeId = await client.query(`select t.type_id from user_reimbursement.reimbursement_types t 
        where t.type = $1`, [newReimbursement.type])
            
        if(typeId.rowCount === 0){
            throw new Error('Type Not Found.')
        }
        typeId = typeId.rows[0].type_id

        let results = await client.query(` insert into user_reimbursement.reimbursements 
        ("author", "amount", "date_submitted", "date_resolved", "description", "resolver", "status", "type")
        values($1,$2,$3,$4,$5,$6,$7,$8) returning "reimbursement_id";`, 
        [newReimbursement.author, newReimbursement.amount, newReimbursement.dateSubmitted, newReimbursement.dateResolved, newReimbursement.description, newReimbursement.resolver, statusId, typeId])
        
        newReimbursement.reimbursementId = results.rows[0].reimbursement_id
        await client.query('COMMIT;')
        console.log(newReimbursement)
        return newReimbursement

    }catch(e){
        client && client.query('ROLLBACK;')
        if(e.message === 'Role Not Found'){
            throw new NewReimbursementInputError()
        }
        console.log(e)
        throw new Error('Unhandled Error Occured')
    }finally{
        client && client.release();
    }
}

export async function patchReimbursement(reimbursement:Reimbursement):Promise<Reimbursement[]>{
    let client:PoolClient;
    try{
        client = await connectionPool.connect()
        await client.query('BEGIN;')

        //check if the reimbursement to update exists
        let reimbursementId = await client.query(`select r.reimbursement_id from user_reimbursement.reimbursements r 
        where r.reimbursement_id = $1`, [reimbursement.reimbursementId])

        if(reimbursementId.rowCount === 0){
            throw new Error('Reimbursement Not Found.')
        }
        reimbursementId = reimbursementId.rows[0].reimbursement_id
        console.log(reimbursementId)

        if(reimbursement.author != undefined){
            console.log("in the author")

            //might have to verify if the author is a valid userid

            let updateResults = await client.query(`update user_reimbursement.reimbursements
            set "author" = $1 where reimbursement_id = $2;`,[reimbursement.author, reimbursementId])
            console.log(updateResults.rows[0])
        }
        if(reimbursement.amount != undefined){
            console.log("in the amount")
            let updateResults = await client.query(`update user_reimbursement.reimbursements 
            set "amount" = $1 where reimbursement_id = $2;`,[reimbursement.amount, reimbursementId])
            console.log(updateResults.rows[0])
        }
        if(reimbursement.dateSubmitted != undefined){
            console.log("in the dateSubmitted")
            let updateResults = await client.query(`update user_reimbursement.reimbursements 
            set "date_submitted" = $1 where reimbursement_id = $2;`,[reimbursement.dateSubmitted, reimbursementId])
            console.log(updateResults.rows[0])
        }
        if(reimbursement.dateResolved != undefined){
            console.log("in the dateResolved")
            let updateResults = await client.query(`update user_reimbursement.reimbursements 
            set "date_resolved" = $1 where reimbursement_id = $2;`,[reimbursement.dateResolved, reimbursementId])
            console.log(updateResults.rows[0])
        }
        if(reimbursement.description != undefined){
            console.log("in the description")
            let updateResults = await client.query(`update user_reimbursement.reimbursements 
            set "description" = $1 where reimbursement_id = $2;`,[reimbursement.description, reimbursementId])
            console.log(updateResults.rows[0])
        }
        if(reimbursement.resolver != undefined){
            console.log("in the description")

            //might have to make sure the resolver is a valid user
            let updateResults = await client.query(`update user_reimbursement.reimbursements 
            set "resolver" = $1 where reimbursement_id = $2;`,[reimbursement.resolver, reimbursementId])
            console.log(updateResults.rows[0])
        }
        if(reimbursement.status != undefined){
            console.log("in the status")

            //need to confirm that the status exists 
            let statusId = await client.query('select s.status_id from user_reimbursement.reimbursement_status s where s.status = $1', [reimbursement.status])
            
            if(statusId.rowCount === 0){
                throw new Error('Status Not Found.')
            }
            statusId = statusId.rows[0].status_id

            let updateResults = await client.query(`update user_reimbursement.reimbursements
            set "status" = $1 where reimbursement_id = $2;`,[statusId, reimbursementId])
            console.log(updateResults.rows[0])
        }
        if(reimbursement.type != undefined){
            console.log("in the type")
            let typeId = await client.query('select t.type_id from user_reimbursement.reimbursement_types t where t.type = $1', [reimbursement.type])
            
            if(typeId.rowCount === 0){
                throw new Error('Type Not Found.')
            }
            typeId = typeId.rows[0].type_id

            let updateResults = await client.query(`update user_reimbursement.reimbursements 
            set "type" = $1 where reimbursement_id = $2;`,[typeId, reimbursementId])
            console.log(updateResults.rows[0])
        }

        let result:QueryResult = await client.query(`select r.reimbursement_id, 
            u1.user_id as author, 
            r.amount, 
            r.date_submitted, 
            r.date_resolved, 
            r.description, 
            u2.user_id as resolver, 
            rs.status, 
            rs.status_id, 
            rt."type", 
            rt.type_id 
            from user_reimbursement.reimbursements r
            left join user_reimbursement.reimbursement_types rt on r."type" = rt.type_id
            left join user_reimbursement.reimbursement_status rs on r.status = rs.status_id
            left join user_reimbursement.users u1 on r.author = u1.user_id
            left join user_reimbursement.users u2 on r.resolver = u2.user_id
            where r.reimbursement_id = $1;`,
            [reimbursementId])
        await client.query('COMMIT;')
        return result.rows.map(ReimbursementDTOToReimbursementConvertor);
    }
    catch(e){
        client && client.query('ROLLBACK;')
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