const jwt = require("jwt-simple")
const moment = require("moment")

const {key} = require('../services/jwt')

//Funcion de autenticacion
exports.auth = (req, res, next) =>{
    // Comprobar si me llega la cabecera de auth
        if (!req.headers.authorization){
            return res.status(403).send({
                status: "error",
                message: "La peticion no tiene la cabecera de autenticación"
            })
        }
    //Limpiar token

        let token = req.headers.authorization.replace(/['"]+/g, '')

    // Decodificar el token
        try{
            let payload = jwt.decode(token,key);
            //Comprobar expiracion del token
                if(payload.exp <= moment().unix()){
                    return res.status(401).send({
                        status: "error",
                        message: "Token expirado"
                    })
                }
            // Agregar datos de usuario a request
                req.user = payload;

        }catch(error){
            return res.status(404).send({
                status: "error",
                message: "Token invalido"
            })
        }
    

    // Pasar a ejecucion de accion  
    next();
}
