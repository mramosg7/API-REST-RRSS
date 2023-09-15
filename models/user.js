function FabricaUsers(params){
    const { name, nick, email, password ,role,image} = params
    this.nick = nick.toLowerCase()
    this.name = name.toLowerCase()
    this.password = password
    this.email = email.toLowerCase()
    
    !role ? this.role="role_user" : this.role=role

    !image ? this.image="default.png" : this.image=image

    
}

module.exports = FabricaUsers