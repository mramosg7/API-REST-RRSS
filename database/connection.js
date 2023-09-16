const sql = require("mysql2/promise");

const connectionConfig = {
    host: 'bnchkyqjspmyzou0ownk-mysql.services.clever-cloud.com',
    port: 3306,
    user: 'ur5hiqsv4w8xlock',
    password: 'MmHvZbIhBhSQQHXcCXpZ',
    database: 'bnchkyqjspmyzou0ownk'
  };

const getConnection = async() =>{
    try{
        const connection = await sql.createConnection(connectionConfig)
        console.log('Conexion exitosa');
        return connection;
    }catch(error){
        console.error('Error al conectar la base de datos :', error.message)
        throw error
    }
}

module.exports = {
    getConnection
}
