const jwt = require('jwt-simple')
const moment = require('moment')

const key = "CLAVE_SECRETA_del_proyecto_DE_LA_RED_SOCIAL_134567";

const createToken = (user) =>{
    const payload = {
        nick: user.NICK,
        name: user.NAME,
        email: user.EMAIL,
        role: user.ROLE,
        image: user.IMAGE,
        iat: moment().unix(), // fecha en el que se genera el token
        exp: moment().add(30, "days").unix() // fecha en el que expira el token
    } 

    return jwt.encode(payload,key);
}

module.exports = {
    createToken,
    key
};
