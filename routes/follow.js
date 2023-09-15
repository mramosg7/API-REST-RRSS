const express = require('express')
const router = express.Router()
const followController = require('../controllers/follow')
const {auth} = require("../middlewares/auth")

//Definir rutas
router.post("/save", auth,followController.save)
router.delete("/unfollow", auth,followController.unfollow )
router.get("/following/:nick?/:page?",auth,followController.following)
router.get("/followers/:nick?/:page?",auth,followController.followers)

module.exports = router