const sql = require("mysql2/promise");

const connectionConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'RRSS'
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
