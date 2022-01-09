const userModel = require('../models/userModel')
const validator = require('../validators/validator')
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken')


//creating user by validating every details.

const register = async function (req, res) {
    try {

        let requestBody = req.body

        //Extract body
        let { fname, lname, email, phone, password } = requestBody

        //-------Validation Starts-----------

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide user Detaills" })
        }

        if (!validator.isValid(fname)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide fname" });
        }
        if (!validator.isValid(lname)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide lname" });
        }

        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide email" });
        }

        //validating email using RegEx.
        email = email.trim()
        if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) {
            return res.status(400).send({ status: false, message: `Email should be a valid email address` });
        }
        //searching email in DB to maintain its uniqueness
        let isEmailAlredyPresent = await userModel.findOne({ email: email })
        if (isEmailAlredyPresent) {
            return res.status(400).send({ status: false, message: `Email Already Present` });
        }

        if (!validator.validString(phone)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide Phone" });
        }
        //validating phone number of 10 digits only.
        if (phone) {
            if (!/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone)) {
                return res.status(400).send({ status: false, message: `Mobile should be a valid number` });
            }
            //searching phone in DB to maintain its uniqueness
            let isPhoneAlredyPresent = await userModel.findOne({ phone: phone })
            if (isPhoneAlredyPresent) {
                return res.status(400).send({ status: false, message: `Phone Number Already Present` });
            }
        }
        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide password" });
        }
        if (!(password.length >= 8 && password.length <= 15)) {
            return res.status(400).send({ status: false, message: "Password should be Valid min 8 and max 15 " });
        }

        //------------Validation Ends----------


        password = await bcrypt.hash(password, saltRounds); //encrypting password by using bcrypt.

        //object destructuring for response body.
        const udatedBody = { fname, lname, email, phone, password }

        let user = await userModel.create(udatedBody)

        res.status(201).send({ status: true, message: 'User created successfully', data: user })

    } catch (error) {

        res.status(500).send({ status: false, msg: error.message })
    }
}

//!..................................................................
//user login by validating the email and password.

const login = async (req, res) => {

    try {
        const requestBody = req.body;

        // Extract params

        const { email, password } = requestBody;

        // Validation starts

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, msg: "Please enter login credentials" });
        }

        if (!validator.isValid(email)) {
            res.status(400).send({ status: false, msg: "Enter an email" });
            return;
        }
        //email = email.trim()
        if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) {
            return res.status(400).send({ status: false, message: `Email should be a valid email address` });
        }

        if (!validator.isValid(password)) {
            res.status(400).send({ status: false, msg: "enter a password" });
            return;
        }

        if (!(password.length >= 8 && password.length <= 15)) {
            return res.status(400).send({ status: false, message: "Password should be Valid min 8 and max 15 " })
        }
        // Validation ends

        //finding user's details in DB to verify the credentials.
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).send({ status: false, message: `Invalid login credentials` });
        }

        let hashedPassword = user.password

        //converting normal password to hashed value to match it with DB's entry by using compare function.
        const encryptedPassword = await bcrypt.compare(password, hashedPassword)

        if (!encryptedPassword) return res.status(401).send({ status: false, message: `Invalid login credentials` });

        //Creating JWT token through userId. 
        const token = jwt.sign({
            userId: user._id,
            iat: Math.floor(Date.now() / 1000),   //time of issuing the token.
            exp: Math.floor(Date.now() / 1000) + 3600 * 24 * 7 //+ 60 * 30 setting token expiry time limit.
        }, 'HerculesProject6')


        res.header("BearerToken", token);

        res.status(200).send({ status: true, msg: "user login successfully", data: { userId: user._id, token: token } });
    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, msg: error.message });
    }
}


//!..............................................................
//fetching user's profile by Id.
const getUserProfile = async (req, res) => {

    try {
        const userId = req.params.userId
        const userIdFromToken = req.userId

        //validation starts

        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId in params." })
        }
        //validation ends

        const findUserProfile = await userModel.findOne({ _id: userId })
        if (!findUserProfile) {
            return res.status(400).send({status: false, message: `User doesn't exists by ${userId}`})
        }
          //*Authentication & Authorization
        if (userId.toString() != userIdFromToken) {
            return res.status(401).send({status: false, message: "Unauthorized access."})
        }

        return res.status(200).send({ status: true, message: "Profile found successfully.", data: findUserProfile })

    } catch (err) {
        return res.status(500).send({status: false,message: "Error is: " + err.message})
    }
}

//..................................................................
//Update profile details by validating user details.

const updateUserProfile = async (req, res) => {

    try {

        let requestBody = req.body;
        let userId = req.params.userId;
        let userIdFromToken = req.userId;

        //Validating userId
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId in params." });
        }

        //*Authentication & Authorization
        if (userId.toString() != userIdFromToken) {
            return res.status(401).send({ status: false, message: `Unauthorized access! ${userId} is not a logged in user.` });
        }

        const findUserProfile = await userModel.findOne({ _id: userId });

        if (!findUserProfile) { return res.status(400).send({ status: false, message: `User doesn't exists by ${userId}` }) }

        //Validating request body
        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid request body! Please provide some user's information to update." });
        }

        // Extract params
        let { fname, lname, email, phone} = requestBody;

        //validating user's firstName
        if (!validator.validString(fname)) {
            return res.status(400).send({ status: false, message: `Invalid request parameters, Cannot update first name to empty string.` });
        }

        //Validating user's lastName
        if (!validator.validString(lname)) {
            return res.status(400).send({ status: false, message: `Invalid request parameters, Cannot update last name to empty string.` });
        }

        //validating email address
        if (!validator.validString(email)) {
            return res.status(400).send({ status: false, message: `Invalid request parameters, Cannot update Email Id to empty string.` });
        }

        if (email) {
            if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) {
                return res.status(400).send({ status: false, message: `${email} is an invalid email Id. Plaese enter a valid email Id to update.` });
            }

            const isEmailAlreadyUsed = await userModel.findOne({ email });
            if (isEmailAlreadyUsed) {
                return res.status(400).send({ status: false, message: `${email} is already registered. Plaese try another Email Id.` });
            }
        }

        //validating phone Number
        if (!validator.validString(phone)) {
            return res.status(400).send({
                status: false,
                message: `Invalid request parameters, Cannot update phone Number to empty string.`,
            });
        }
        if (phone) {
            if (!/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone)) {
                return res.status(400).send({ status: false, message: `${phone} is not a valid phone number. Please enter a valid Indian number to update.` });
            }

            const isPhoneAlreadyUsed = await userModel.findOne({ phone });

            if (isPhoneAlreadyUsed) {
                return res.status(400).send({ status: false, message: `${phone} is already registered. Plaese try another number.` });
            }
        }

        // if(password){return res.status(400).send({ status:false, message:`Password is not changeable.`})}

        //object destructuring for response body.
        let changeProfileDetails = await userModel.findOneAndUpdate({ _id: userId }, {
            $set: {
                fname: fname,
                lname: lname,
                email: email,
                phone: phone
            }
        }, { new: true })

        return res.status(200).send({ status: true, data: changeProfileDetails })

    } catch (err) {
        return res.status(500).send({ status: false, message: "Error is: " + err.message })
    }
}

module.exports = {
    register,
    login,
    getUserProfile,
    updateUserProfile
}


