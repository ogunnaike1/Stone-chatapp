
const mongoose = require("mongoose")
const userModel = require("../Model/UserModel")
const bcrypt = require ("bcrypt")
const jwt = require("jsonwebtoken");


const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const SignUpUser = async(req,res) =>{
    
    try {
        const {username, email, password} = req.body
        if(!username || !email || !password){
            return res.status(400).json({ message: "All fields are required", status: false });
        }

        const hashedpassword = await bcrypt.hash(password, 10);
        const newUser = await userModel.create({
            username, 
            email, 
            password:hashedpassword

        })

        if (newUser){
           return res.status(201).json({
            message:'user created succesfully',
            status:true,
            user:{
                id:newUser._id,
                username: newUser.username,
                email: newUser.email,
            }
           })
        }
        
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ message: "Server error", status: false });
        
    }

}

const LoginUser = async(req,res)=>{

    try {
        const {email, password} = req.body
        if(!email || !password){
            return res.status(400).json({ message: "All fields are required", status: false });
        }
        const user = await userModel.findOne({email});

        if(!user){
            return res.status(400).json({ message: "user does not exist", status: false });
        }
        const isMatch = await  bcrypt.compare(password, user.password)

        if(!isMatch){
            return res.status(400).json({ message: "invalid password", status: false });

        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        )


        return res.status(201).json({ token, message: "Login successful", status: true,  user : {id: user._id, username:user.username, email:user.email } });
        
    } catch (error) {
        console.error("login error:", error);
        return res.status(500).json({ message: "Server error", status: false });
    }

}



module.exports = { SignUpUser, LoginUser };