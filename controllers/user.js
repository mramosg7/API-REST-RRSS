const modeloUsers = require("../models/user")
const {getConnection} = require("../database/connection")

const argon = require("argon2")
const jwt = require("../services/jwt")
const fs = require("fs")
const path1= require("path")
const prueba = async(req,res)=>{
    return res.status(200).json({
        status: "success",
        message: "prueba",
        user: req.user
        
    })
}
const register = async(req,res) =>{
    //Recoger datos de la peticion
    let params = req.body;
    
    // Comprobar que me llegan bien (+validacion)
    if(!params.name || !params.nick || !params.email || !params.password){
        return res.status(400).json({
            status:"error",
            message:"Faltan datos por enviar",
            params
        })
    }
    user = new modeloUsers(params)
    // Control usuarios duplicados

    const querry = 'select * from USER where EMAIL = ? and NICK = ?'
    const insertQuerry = 'insert into USER(NICK,NAME,EMAIL,PASSWORD,ROLE,IMAGE,CREATED_AT) values(?,?,?,?,?,?,NOW())'
    try{
        
        const connection = await getConnection();
        
        const [rows, fields] = await connection.execute(querry, [user.email, user.nick])
        
        if ( rows.length ){
            return res.status(409).json({
                status: "error",
                message: "Usuario ya existente"
            })
        }
        
        // Cifrar la contraseña
        passwordHas = await argon.hash(user.password)
        // Guardar usuario en la base de datos
        
        await connection.execute(insertQuerry, [user.nick,user.name,user.email,passwordHas,user.role,user.image])
        

        await connection.end()
        return res.status(200).json({
            status:"succes",
            message: "Usuario registrado",
            
        })
    }catch(error){
        return res.status(500).json({
            status: "error",
            message: "Error en la consulta de registro",
        })
    }
    
   

   
}

const login = async(req, res) =>{
    //recoger parametros
    let params = req.body;
    if (!params.email || !params.password){
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        })
    }

    //buscar en la base de datos si existe el usuario
    querryBuscar = 'select * from USER where EMAIL = ?'
    let user;
    try{
        const connection = await getConnection();
        const [rows, fields] = await connection.execute(querryBuscar, [params.email.toLowerCase()])
        if (!rows.length){
            return res.status(404).json({
                status: "error",
                message: "el usuario no existe"
            })
        }
        
        //Comprobar la contraseña
        let pwd = await argon.verify(params.password,rows[0].PASSWORD)

        if (!pwd){
            return res.status(400).send({
                status : "error",
                message : "contraseña incorrecta"
            })
        }
        user = rows[0]
        
        await connection.end()
        
        
    }catch(error){
            return res.status(500).json({
                status: "error",
                message: "Error en el login",
            })
    }

    // token
    const token = jwt.createToken(user);
    
    //Datos del usuario
    return res.status(200).json({
        status: "success",
        user: {
            name: user.NAME,
            nick: user.NICK,
            image: user.IMAGE
        },
        token
    }) 
}

const profile = async(req,res) =>{
    //Recibir el parametro del id de usuario por la url
    const nick = req.params.nick

    //Consulta para sacar los datos del usuario
    const querry = `select U.NICK, U.NAME, U.IMAGE, U.CREATED_AT, U.BIO,
                        CASE 
                            WHEN EXISTS(
                                SELECT 1
                                FROM FOLLOW 
                                WHERE NICK = ? and FOLLOWED = U.NICK
                            ) THEN 1
                            ELSE 0
                        END AS FOLLOWING
                    from USER U
                    where U.NICK = ?`
    try{
        const connection = await getConnection();
        const [rows] = await connection.execute(querry,[req.user.nick,nick.toLowerCase()])
        //Devolver el usuario
        //TODO: posterior mente devolver informacion de follows
        await connection.end()
        return res.status(200).send({
            status:"success",
            user : rows[0]
        })
    }catch(error){
        return res.status(500).send({
            status: "error",
            message: "No se ha podido encontrar al usuario"
        })
    }
    
}


const list = async(req,res)=>{
    //Controlar la pagina
    let page = 1
    const itemPerPage = 5
    
    if (req.params.page){
        page = req.params.page
    }
    page = parseInt(page)
    const offset = (page - 1) * itemPerPage
    let querry = "Select * from USER limit ? , ?"
    let querrytotal = "select count(NICK) total from USER"
    let users 
    // Consulta
    try{
        const connector = await getConnection();

        const [rows] = await connector.execute(querry, [offset.toString(), itemPerPage.toString()])
        if (rows.length <= 0){
            throw new Error()
        }
        
        //Devolver el resultado(posteriormente info de follows)
        const [rows2] = await connector.execute(querrytotal)
        await connector.end()
        return res.status(200).send({
            status:"success",
            users : rows,
            pages : Math.ceil(parseInt(rows2[0].total)/itemPerPage),
        })

    }catch(error){
        return res.status(500).send({
            status: "error",
            message: "No hay usuarios disponibles",
        })
    }


    
}
const update = async(req, res) => {
    // Recoger info del usuario a actualizar
    const userIdentity = req.user;
    const userToUpdate = req.body;
    //eliminar campos sobrantes 

    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.image;
    // Comprobar si el usuario ya existe 
    if (!userToUpdate.email && !userToUpdate.password && !userToUpdate.nick && !userToUpdate.bio){
        return res.status(500).send({
            status:"Error",
            message: "Datos no enviados"
        })
    }
    if (userToUpdate.bio){
        const querry = "update USER set BIO = ? where NICK = ?"
        try{
            const connection = await getConnection()
            await connection.execute(querry,[userToUpdate.bio,userIdentity.nick.toLowerCase()])
            await connection.end()
        }catch{
            return res.status(500).send({
                status:"Error",
                message: "Error en la consulta"
            })
        }
    }

    if (userToUpdate.nick){
        const querry = "select * from USER where NICK = ?"
        const querryUpdate = "update USER set NICK = ? where NICK = ?" 
        try{
            const connection = await getConnection()
            const [row] = await connection.execute(querry, [userToUpdate.nick.toLowerCase()])
            if (row.length >= 1 ){
                return res.status(404).send({
                    status : "Error",
                    message : "Nick en uso",
                    row
                })
            }
            await connection.execute(querryUpdate, [userToUpdate.nick.toLowerCase(), userIdentity.nick.toLowerCase()])
            await connection.end()
        }catch{
            return res.status(500).send({
                status:"Error",
                message: "Error en la consulta"
            })
        }
    }
    if (userToUpdate.email){ 
    const querry = "select * from USER where EMAIL = ?" 
    const querryUpdate = "update USER set EMAIL = ? where NICK = ?"
    try {
        const connection = await getConnection();
        const [row] = await connection.execute(querry,[userToUpdate.email.toLowerCase()])
        if (row.length >= 1 ){
            return res.status(404).send({
                status : "Error",
                message : "Email en uso"
            })
        }
        await connection.execute(querryUpdate,[userToUpdate.email.toLowerCase(), userIdentity.nick.toLowerCase()])
        await connection.end()
    }catch(error){
        return res.status(500).send({
            status:"Error",
            message: "Error en la consulta"
        })
    }
    }
     // Si me llega la passwd cifrarla
    if (userToUpdate.password){
        const querryUpdate = "update USER set PASSWORD = ? where NICK = ?"
        userToUpdate.password = await argon.hash(userToUpdate.password)
        try{
            const connection = await getConnection();
            await connection.execute(querryUpdate,[userToUpdate.password, userIdentity.nick])
            await connection.end()
        }catch{
            return res.status(500).send({
                status:"Error",
                message: "Error en la consulta"
            })
        }
    }
    
    
    //Buscar y actualizar
    return res.status(200).send({
        status: "success",
    })
}

const upload = async (req, res) =>{

    //Recoger el fichero de imagen 
    if(!req.file){
        return res.status(404).send({
            status: "Error",
            message: " Peticion no incluye la imagen"
        })
    }
    //Nombre del archivo
    let image = req.file.originalname
    //Sacar la extension del archivo
    const imageSplit = image.split("\.");
    const extension = imageSplit[1]

    //Comprobar si es correcta
    if (extension != "png"  && extension !="jpg" && extension != "jpeg" && extension != "gif"){
        const filePath = req.file.path
        fs.unlinkSync(filePath);

        return res.status(400).send({
            status: "error",
            message: "Extesion del fichero invalida"
        })
    }
    const querry = "update USER set IMAGE = ? where NICK = ?"
    try {
        const connection = await getConnection();
        await connection.execute(querry,[req.file.filename, req.user.nick.toLowerCase()])
        await connection.end()
    }catch{
        return res.status(500).send({
            status:"Error",
            message: "Error en la consulta"
        })
    }
    return res.status(200).send({
        status: "success",
        
    })
}

const avatar = (req,res) =>{
    const file = req.params.file
    const path = "./uploads/avatars/" + file

    fs.stat(path,(error,existe) =>{
        if(!existe) {
            return res.status(404).send({
                status:"error", 
                message: "No existe la imagen"
            })
        }
        return res.sendFile(path1.resolve(path))
    })
    
}
module.exports = {
    register,
    login,
    prueba,
    profile,
    list,
    update,
    upload,
    avatar
}