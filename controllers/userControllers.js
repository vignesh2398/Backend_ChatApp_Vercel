const generateToken = require("../config/generateToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

const registerUser=asyncHandler(async(req,res)=>{
const{name,email,password,pic}=req.body;

if(!name|| !email || !password)
{
    res.status(400);
    throw new Error("Please Enter all The Data")
}
const userExist= await User.findOne({email})


if(userExist)
{
    res.status(400);
    throw new Error("User already exists")
}

const user = await User.create({
    name,email,password,pic
});

if(user){
    res.status(201).json({
        _id:user._id,
        name:user.name,
        email:user.email,
        pic:user.pic,
        token:generateToken(user._id)
    })
}else{
    res.status(400)
    throw new Error("Failed to Create the User")
}
})

const  authUser= asyncHandler(async(req,res)=>{
    const {email,password}= req.body;
  
    const userExist= await User.findOne({email})

if(userExist && (await userExist.matchPassword(password)))
{
    res.status(200).json({userExist,token:generateToken(userExist._id)})

}
else{
    res.status(401);
    throw new Error("Invalid Email or Password");
}

})

const allUsers=asyncHandler(async(req,res)=>{
    const keyword=req.query.search?{$or:[{name:{$regex:req.query.search,$options:"i"}},
    {email:{$regex:req.query.search,$options:"i"}}]}:{};

    const users= await User.find(keyword).find({_id:{$ne:req.user._id}}).select("-password")
    res.send(users)
    
})


module.exports={registerUser,authUser,allUsers}