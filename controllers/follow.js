
const {getConnection} = require("../database/connection")


const save = async (req,res) =>{
    //Conseguir datos por body
    const params = req.body
    if (!params.follow){
        return res.status(404).send({
            status: "Error",
            message: "Peticion no incluye el follow"
        })
    }
    //Sacar nick del usuario identificado
    const identity = req.user
    //Guardar objeto 
    try{
        const querry = "insert into FOLLOW values (?,?,NOW())"
        const connection = await getConnection()
        await connection.execute(querry,[identity.nick,params.followed.toLowerCase()])
        await connection.end()
    }catch{
        return res.status(500).send({
            status : "error",
            message : "Fallo en la consulta"
        })  
    }

    return res.status(200).send({
        status : "succes",
        
    })
}
const unfollow = async(req,res) =>{
    
    const params = req.body
    if (!params.unfollow){
        return res.status(404).send({
            status: "Error",
            message: "Peticion no incluye el unfollow"
        })
    }
    const identity = req.user

    try {
        const querry = "delete from FOLLOW where USUARIO = ? and FOLLOWED = ?"
        const connection = await getConnection();
        await connection.execute(querry,[identity.nick,params.unfollow])
        await connection.end()
    }catch{
        return res.status(500).send({
            status: "Error",
            message: "Error en la consulta"
        })
    }
    return res.status(200).send({
        status: "succes",
        message: "follow eliminado correctamente"
    })
}

const following= async(req,res) =>{
    let userNick = req.user.nick;

    if(req.params.nick) userNick = req.params.nick;

    let page = 1;

    if(req.params.page) page = req.params.page;

    const itemsPerPage = 5
    page = parseInt(page)

    const offset = (page - 1) * itemsPerPage
    let querry = `SELECT U.NICK,U.NAME,U.IMAGE,
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM FOLLOW
                        WHERE NICK = U.NICK AND FOLLOWED = ?
                    ) THEN 1
                    ELSE 0
                END AS FOLLOWING 
                FROM USER U
                WHERE U.NICK IN (
                    SELECT FOLLOWED
                    FROM FOLLOW
                    WHERE NICK = ?
                )
                LIMIT ?, ?`
    try{
        const connection = await getConnection();
        const [row] = await connection.execute(querry,[req.user.nick,userNick.toLowerCase(),offset.toString(),itemsPerPage.toString()])
        connection.end()
        return res.status(200).send({
            status: "succes",
            usuarios: row
        })
        
    }catch{
        return res.status(500).send({
            status: "error",
            message: "error en la consulta"
            
        })
    }
    
}

const followers= async(req,res) =>{
    let userNick = req.user.nick;

    if(req.params.nick) userNick = req.params.nick;

    let page = 1;

    if(req.params.page) page = req.params.page;

    const itemsPerPage = 5
    page = parseInt(page)

    const offset = (page - 1) * itemsPerPage
    let querry = `SELECT U.NICK,U.NAME,U.IMAGE,
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM FOLLOW
                        WHERE NICK = ? AND FOLLOWED = U.NICK
                    ) THEN 1
                    ELSE 0
                END AS FOLLOWER
                FROM USER U
                WHERE U.NICK IN (
                    SELECT NICK
                    FROM FOLLOW
                    WHERE FOLLOWED = ?
                )
                LIMIT ?, ?`
    try{
        const connection = await getConnection();
        const [row] = await connection.execute(querry,[req.user.nick,userNick.toLowerCase(),offset.toString(),itemsPerPage.toString()])
        await connection.end()
        return res.status(200).send({
            status: "succes",
            usuarios: row
        })
        
    }catch{
        return res.status(500).send({
            status: "error",
            message: "error en la consulta"
            
        })
    }
}
module.exports = {
    save,
    unfollow,
    followers,
    following
}