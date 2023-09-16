const {getConnection} = require("../database/connection")
const path1= require("path")
const fs = require("fs")


const save = async(req,res) =>{
    const params = req.body
    let text = null
    let image = null;
    if(params.text) text = params.text
    if (req.file){
        image = req.file.filename;
        const imageSplit = await req.file.originalname.split("\.");
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
        
    }
    
    if (!params.text && image === null) {
        return res.status(404).send({
            status:"Error",
            message:"Publicacion vacia"
        })
    }
    const querry = "insert into PUBLICATION(TEXT,FILE,CREATED_AT,USER) VALUES (?,?,NOW(),?)"
    try{
        const connection = await getConnection();

        await connection.execute(querry,[text,image,req.user.nick])
        await connection.end()
        return res.status(200).send({
            status:"succes",
            message:"save"
        })
    }catch{
        return res.status(500).send({
            status:"Error",
            message:"Error en la consulta"
        })
    }
}

const detail = async(req,res) =>{
    const id = parseInt(req.params.id);
    const querry = `SELECT P.ID, P.TEXT, P.FILE,P.CREATED_AT,U.NICK,U.IMAGE
                    FROM PUBLICATION P JOIN USER U ON P.USER = U.NICK
                    WHERE P.ID = ?`
    try{
        const connection = await getConnection();
        const [row] = await connection.execute(querry,[id])
        
        return res.status(200).send({
            status:"succes",
            message:"mostrar publicacion",
            publication: row[0],
        
        })
    }catch{
        return res.status(500).send({
            status:"Error",
            message:"Error en la consulta"
        })
    }
   
}

const deletePublication = async(req,res)=>{
    const id = parseInt(req.params.id)
    const querry = "DELETE FROM PUBLICATION WHERE ID = ?" 
    const querrySelect="SELECT count(*) as con FROM PUBLICATION WHERE ID = ? and USER = ?"

    try{
        const connection = await getConnection()
        const [row] = await connection.execute(querrySelect,[id,req.user.nick])
        if (row[0].con) {
            await connection.execute(querry,[id])
        }else{
            return res.status(404).send({
                status : "Error",
                message : "La publicacion no coincide con el usuario"
            })
        }
        
        await connection.end();
        return res.status(200).send({
            status : "succes",
            message : "delete"
        })
    }catch{
        return res.status(500).send({
            status : "Error",
            message : "Error en la consulta"
        })
    }

}
const userPublications = async(req,res) =>{
    const nick = req.params.nick
    let page = 1;

    if(req.params.page) page = req.params.page;

    const itemsPerPage = 5
    page = parseInt(page)

    const offset = (page - 1) * itemsPerPage
    const querry = "SELECT * FROM PUBLICATION p WHERE p.USER = ? ORDER BY p.CREATED_AT DESC LIMIT ? ,?"

    try{
        const connection = await getConnection()
        const [row] = await connection.execute(querry,[nick,offset.toString(),itemsPerPage.toString()])
        return res.status(200).send({
            status: "succes",
            publications: row
        })
    }catch{
        return res.status(500).send({
            status : "Error",
            message : "Error en la consulta"
        })
    }
}

const image = async(req,res)=>{
    const file = req.params.file
    const path = "./uploads/publications/" + file

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


const feedFollow = async(req,res)=>{
    let page = 1;
    if(req.params.page){
        page = req.params.page
    }
    const itemsPerPage = 10
    page = parseInt(page)

    const offset = (page - 1) * itemsPerPage

    const nick = req.user.nick
    const querry = `SELECT P.TEXT text, P.FILE file, U.NICK nick,U.IMAGE avatar
                    FROM PUBLICATION P JOIN USER U ON P.USER = U.NICK
                    WHERE USER IN (
                        SELECT FOLLOWED
                        FROM FOLLOW
                        WHERE NICK = ?
                    )
                    ORDER BY P.CREATED_AT DESC 
                    LIMIT ? , ?`
    try{
        const connection = await getConnection()
        const [rows] = await connection.execute(querry,[nick,offset.toString(),itemsPerPage.toString()])
        await connection.end()
        return res.status(200).send({
            status: "succes",
            feed: rows
        })
    }catch{
        return res.status(500).send({
            status : "Error",
            message : "Error en la consulta",
            
        })
    }
}
const feed = async(req,res)=>{
    let page = 1;
    if(req.params.page){
        page = req.params.page
    }
    const itemsPerPage = 5
    page = parseInt(page)

    const offset = (page - 1) * itemsPerPage

    const nick = req.user.nick
    const querry = `SELECT P.TEXT text, P.FILE file, U.NICK nick,U.IMAGE avatar
                    FROM PUBLICATION P JOIN USER U ON P.USER = U.NICK
                    WHERE USER not IN (
                        SELECT FOLLOWED
                        FROM FOLLOW
                        WHERE NICK = ?
                    )
                    ORDER BY P.CREATED_AT DESC 
                    LIMIT ? , ?`
    try{
        const connection = await getConnection()
        const [rows] = await connection.execute(querry,[nick,offset.toString(),itemsPerPage.toString()])
        await connection.end()
        return res.status(200).send({
            status: "succes",
            feed: rows
        })
    }catch{
        return res.status(500).send({
            status : "Error",
            message : "Error en la consulta",
            
        })
    }
}
module.exports = {
    save,
    detail,
    deletePublication,
    userPublications,
    image,
    feedFollow,
    feed
}