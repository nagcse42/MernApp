const express = require('express');
const connectDB = require('./config/db');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const authMiddleWare = require('./middleware/auth');
const { check, validationResult} = require('express-validator/check');

const User = require('./routes/models/User');

const app = express();

// Connect DataBase
connectDB();

// Init parses
app.use(express.json( {extended: false} ));

app.get('/api/auth', authMiddleWare, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).json([{ msg: 'User not found'}]);
    }
});

app.get('/', authMiddleWare, (req, res) => res.send('Auth Test API'));
app.get('/api/profiles', authMiddleWare, (req, res) => res.send('Profile Test API'));
app.get('/api/posts', authMiddleWare, (req, res) => res.send('Posts Test API'));
app.get('/api/users', authMiddleWare, (req, res) => res.send('Users Test API'));

//Users API's
app.post('/user/register', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Include valid e-mail').isEmail(),
    check('password', 'Please set a password with 6 or more characters').isLength({
        min:6
    })
],async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()});
    }
    console.log(req.body);
    const {name, email, password} = req.body;

    try {
        let user = await User.findOne({ email });

        if(user){
            return res.status(400).json({ errors : [{ msg : 'User already exists'}]});
        }

        // Get user gravatar
        const avatar = gravatar.url(email, {
            s:'200',
            r:'pg',
            d:'mm'
        });

        user = new User({
            name,
            email,
            avatar,
            password
        });
        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        // Return jsonwebtoken
        const payLoad = {
            user : {
                id: user.id
            }
        };

        jwt.sign(
            payLoad,
            config.get('jwtSecret'),
            { expiresIn: 360000},
            (err, token) => {
                if(err) throw err;
                res.json({token});
            }
        );

    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server error.');
    }
});

//Users API's
app.post('/auth/authenticate', [
    check('email', 'Include valid e-mail').isEmail(),
    check('password', 'Password required').exists()
],async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()});
    }
    console.log(req.body);
    const {email, password} = req.body;

    try {
        let user = await User.findOne({ email });

        if(!user){
            return res.status(400).json({ errors : [{ msg : 'Invalid credentials.'}]});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(400).json({ errors : [{ msg : 'Invalid credentials.'}]});
        }

        // Return jsonwebtoken
        const payLoad = {
            user : {
                id: user.id
            }
        };

        jwt.sign(
            payLoad,
            config.get('jwtSecret'),
            { expiresIn: 360000},
            (err, token) => {
                if(err) throw err;
                res.json({token});
            }
        );

    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server error.');
    }
});

//Define routes
var users = require('./routes/api/users');
app.use('api/test', users);

// Users 
app

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log('App started on port :'+PORT));
