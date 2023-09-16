// Conexion a la bbdd

const express = require("express")
const cors = require("cors")
const modeloUsers = require("./models/user")
const {getConnection} = require("../database/connection")

const router = express.Router()


// Crear servidor node
const app = express()
const port = 3900;

//Configurar el cors
app.use(cors());


// Convertir los datos del body a objetos js
app.use(express.json());
app.use(express.urlencoded({extended : true}));

router.get("/",async(req,res)=>{
    try{
        const connection = await getConnection()
        return res.status(200).send({
            "hola":"hola con base de datos"
            })
    }catch{
        return res.status(200).send({
        "hola":"hola sin base de datos "
        })
    }
})

// Cargar conf rutas
const UserRoutes = require('./routes/user')
const FollowRoutes = require('./routes/follow')
const PublicationRoutes = require('./routes/publication')

app.use("/api",router)
app.use("/api/user", UserRoutes);
app.use("/api/follow", FollowRoutes);
app.use("/api/publication", PublicationRoutes)
// Poner servidor a escuchar peticiones http



app.listen(port, ()=>{
    console.log("servidor de node corriendo en el puerto: " + port)

})
