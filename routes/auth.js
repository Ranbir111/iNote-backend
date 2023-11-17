const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchUser');

const JWT_SECRET_KEY = "RanbirG$123";

//Route 1: create a user using: POST "/api/auth/createuser". No login required
router.post('/createuser', [
    body('name').isLength(5),
    // body['email'].exists(),
    body('password').isLength(8)
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({success, errors: errors.array() });
    }


    try {
        //check whether the user with this email exists
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success, error: "Sorry a user with this email already exist!" })
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass
        });

        const data = {
            user: {
                id: user.id
            }
        }
        success = true;
        const authToken = jwt.sign(data, JWT_SECRET_KEY);

        res.json({ success, authToken });

    } catch (error) {
        res.status(500).send({ success, error: "Some error occured" });
    }
})

//Route 2: Authenticate a user using: POST "/api/auth/login". No login required
router.post('/login', [
    body('password').isLength(8)
], async (req, res) => {
    
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success, error: "Please try to login with correct credentials!" });
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ success, error: "Please try to login with correct credentials!" });
        }
        const data = {
            user: {
                id: user.id
            }
        }
        success = true;
        const authToken = jwt.sign(data, JWT_SECRET_KEY);
        res.json({ success, authToken });

    } catch (error) {
        res.status(500).send({ success, error: "Some error occured" });
    }
})

//Route 3: Get logged in user detail using: POST "/api/auth/getuser". Login required
router.post('/getuser', fetchUser, async (req, res) => {
    let success = false;
    try {
        success = true;
        userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.json({ success, user });
    } catch (error) {
        res.status(500).send({ success, error: "Some error occured" });
    }
})

module.exports = router;