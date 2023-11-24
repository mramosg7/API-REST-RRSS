const express = require('express')
const router = express.Router()
const publicationController = require('../controllers/publication')
const {auth} = require("../middlewares/auth")
const multer = require("multer")

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"./uploads/publications")
    },
    filename:(req,file,cb)=>{
        cb(null,"publication-" + Date.now() + "-" + file.originalname)
    }
})

const uploads = multer({storage})

router.post("/save",[auth,uploads.single("file0")],publicationController.save)
router.get("/detail/:id",auth,publicationController.detail)
router.delete("/delete/:id",auth,publicationController.deletePublication)
router.get("/user/:nick/:page?",auth,publicationController.userPublications)
router.get("/image/:file",publicationController.image)
router.get("/feed/noFollow/:page?",auth,publicationController.feedFollow)
router.get("/feed/user/:page?",auth,publicationController.feedUser)
router.get("/feed/:page?",publicationController.feed)

module.exports = router