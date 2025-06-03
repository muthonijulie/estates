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

const deleteContact = async(req, res) => {
    try {
        const contactId = req.params.id;
        const deletedContact = await Contact.findByIdAndDelete(contactId);
        
        if (!deletedContact) {
            return res.status(404).json({ error: "Contact not found" });
        }
        
        res.status(200).json({ message: "Contact deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

const getContactById = async (req, res) => {
    try {
        const contactId = req.params.id;
        const contact = await Contact.findById(contactId);
        
        if (!contact) {
            return res.status(404).json({ error: "Contact not found" });
        }
        
        res.status(200).json(contact);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports={createContact,getContact, deleteContact, getContactById};