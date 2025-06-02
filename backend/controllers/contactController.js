const Contact=require("../models/Contact");

const createContact=async(req,res)=>{
    try{
        const newContact=await Contact(req.body);
        await newContact.save();
        res.status(201).json(newContact);
    }catch(error){
        res.status(400).json({error:"Bad request"});
    }

}
const getContact=async(req,res)=>{
    const contacts=await Contact.find();
    res.json(contacts);
};
module.exports={createContact,getContact};