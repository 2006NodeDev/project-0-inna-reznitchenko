import { PoolClient, QueryResult } from "pg";
import { connectionPool } from ".";
import { StatusNotFoundError } from "../errors/StatusNotFoundError";
import { ReimbursementDTOToReimbursementConvertor } from "../utils/reimbursementDTO-to-remibursement-convertor";
import { Reimbursement } from "../models/Reimbursement";
import { NewReimbursementInputError } from "../errors/NewReimbursementInputError";

export async function getReimbursementByStatus(statusId: number){
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
        console.log(results.rows)
        if(results.rowCount === 0){
            throw new Error('Status Not Found')
        }
        console.log(results.rows.map(ReimbursementDTOToReimbursementConvertor))
        return results.rows.map(ReimbursementDTOToReimbursementConvertor);
    } catch(e){
        if(e.message === 'User Not Found'){
            throw new StatusNotFoundError()
        }
        console.log(e);
        throw new Error('Unhandled Error Occured')
    } finally {
        client && client.release()
    }
}

export async function getReimbursementByUser(userId: number){
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
            throw new Error('Status Not Found')
        }
        return results.rows.map(ReimbursementDTOToReimbursementConvertor);
    } catch(e){
        if(e.message === 'User Not Found'){
            throw new StatusNotFoundError()
        }
        console.log(e);
        throw new Error('Unhandled Error Occured')
    } finally {
        client && client.release()
    }
}

export async function saveNewReimbursement(newReimbursement:Reimbursement){
    console.log("in save new reimbursement")
    console.log(newReimbursement)
    let client:PoolClient
    try{
        client = await connectionPool.connect()
        await client.query('BEGIN;')
        //check if the status_ID, type_ID, author, and resolver are valid users
        let statusId = await client.query(`select rs.status_id 
        from user_reimbursement.reimbursement_status rs
        where rs.status_id = $1`, [newReimbursement.status])

        if(statusId.rowCount === 0){
            throw new Error('Status Not Found.')
        }
        statusId = statusId.rows[0].status_id

        let typeId = await client.query(`select rt.type_id 
        from user_reimbursement.reimbursement_types rt
        where rt.type_id = $1`, [newReimbursement.type])
        
        if(typeId.rowCount === 0){
            throw new Error('Type Not Found.')
        }
        typeId = typeId.rows[0].type_id
        
        let author = await client.query(`select u.user_id
        from user_reimbursement.users u
        where u.user_id = $1`, [newReimbursement.author])
        
        if(author.rowCount === 0){
            throw new Error('Author Not Found.')
        }
        //author = author.rows[0].author

        let resolver = await client.query(`select u.user_id
        from user_reimbursement.users u
        where u.user_id = $1`, [newReimbursement.resolver])
        
        if(resolver.rowCount === 0){
            throw new Error('Resolver Not Found.')
        }
        //resolver = resolver.rows[0].resolver

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