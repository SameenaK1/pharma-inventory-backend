import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import validate from 'validator';
import Medicine from '../models/medicine';
import createToken from '../token';

export const addmedicine = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const idnum = req.body.idnum;
    const name = req.body.name;
    const manufacturer_name = req.body.manufacturer_name;
    const type = req.body.type;
    const pack_size_label = req.body.pack_size_label;
    const composition1 = req.body.composition1;
    const composition2 = req.body.composition2;


    try {
        // Encrypt password
        
        const new_medicine = new Medicine(idnum, name, manufacturer_name, type, pack_size_label, composition1, composition2);

        const response: any = await new_medicine.addmedicine();
       const insertId = response[0]?.insertId || response.insertId; // Safe check for insertId structure
        
        // Return success response with the new insert ID
        return res.status(201).json({ 
            success: true, 
            message: "Medicine added successfully", 
            insertedId: insertId 
        });
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};
