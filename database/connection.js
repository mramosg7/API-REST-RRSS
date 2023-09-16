const sql = require("mysql2/promise");

const connectionConfig = {
    host: 'containers-us-west-209.railway.app',
    port: 6595,
    user: 'root',
    password: 'wfzlZ6I3fdvihqBTj6Uy',
    database: 'railway'
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
