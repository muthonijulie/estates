const View = require('../models/Viewing');


exports.createViewing = async (req, res) => {
    try {
        const view = await View.create(req.body);
          
        res.status(201).json({
            success: true,
            data: view
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
          });
        
    }
}