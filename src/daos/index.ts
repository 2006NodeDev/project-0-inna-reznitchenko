//entry point for all of the db files
import { Pool } from 'pg'

export const connectionPool:Pool = new Pool({
    host: process.env['LB_HOST'], // public ip address of sql instance
    user: process.env['LB_USER'], //user on db
    password: process.env['LB_PASSWORD'], // password
    database: process.env['LB_DATABASE'], // name of db
    port:5432, // the db port
    max:5 // max number of connections
})