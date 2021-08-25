const request = require('supertest');
const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const jwt = require('jsonwebtoken');
const MockStrategy = require('passport-mock-strategy');
const { localAuthenticationMiddleware, isAuthenticatedMiddleware } = require('../middleware/authentication');
const authController = require('../controllers/authController');

const UserOauth = require('../models/UserOauth');
jest.mock('../models/UserOauth');

const userOauth = {
    _id: 'mongo-auto-generated-id-for-google-profile',
    googleId: 'google-profile-id',
    email: 'vik.chupak@gmail.com',
    displayName: 'Viktor Chupak'
}

UserOauth.findOne.mockResolvedValue(userOauth)
UserOauth.findById.mockResolvedValue(userOauth)

const User = require('../models/User');
jest.mock('../models/User');

const dbUser = {
    _id: 'mongo-auto-generated-id',
    email: 'vik.chupak@mail.ru',
    password: '$2a$10$byCEtBu7utXuXB4r9vSfmOBfbTKm2w/NckHw6xwNUsqjOOIMF0cc6', // hashed word "password"
    displayName: 'Viktor Chupak'
}

User.findOne.mockResolvedValue(dbUser);
User.findById.mockResolvedValue(dbUser);


passport.use(
    new MockStrategy({
        name: 'googleMockStrategy',
        user: {
            id: 'google-profile-id',
            email: 'vik.chupak@gmail.com',
            displayName: 'Viktor Chupak'
        }
    },
    async (profile, done) => {
        const googleUser = await UserOauth.findOne({ googleId: profile.id });

        done(null, googleUser);
    })
);

// Each subsequent request will NOT contain credentials, but rather the unique cookie that identifies the session.

passport.serializeUser((user, done) => {
    done(null, user._id); // Yeah, user._id not user.id => tested!!!
});

passport.deserializeUser((id, done) => { // if authorization successful - verify session cookie pair valid, only then deserialize func calls, else no deserialize func call.
    
    // user._id as id extracted from express:sess

    done(null, userOauth)

    // express:sess.sig - session signature; uses secret key
    // express:sess - base64 encoded user info; In this case mongo _id

});

const app = express();

app.use(express.json({ extended: true }));

app.use(cookieParser());

const cookieSessionMiddleware = cookieSession({
    maxAge: 60 * 60 * 1000,
    keys: ['somerandomcookiestring'],
    sameSite: 'none',
    secure: true,
    httpOnly: true,
});
app.set('trust proxy', 1);
app.use(cookieSessionMiddleware)

app.use(passport.initialize());
app.use(passport.session()); // calls serializeUser and deserializeUser to store session id in cookies

app.use(localAuthenticationMiddleware);

app.get('/auth/google', passport.authenticate('googleMockStrategy'), (req, res) => {
    res.json(req.user)
})

app.post('/auth/login', authController.auth_login_post)

app.get('/protected-route', isAuthenticatedMiddleware, (req, res) =>{
    res.json({ message: "success" })
})

describe('express app with middlewares', () => {

    test('successful login with google provider attaches user to req (req.user)', async function() {
        
        await request(app)
            .get('/auth/google')
            .expect(200, userOauth);
    })

    test('login with local strategy, correct email and password provided', async function() {

        const dbUser = {
            _id: 'mongo-auto-generated-id',
            email: 'vik.chupak@mail.ru',
            password: '$2a$10$byCEtBu7utXuXB4r9vSfmOBfbTKm2w/NckHw6xwNUsqjOOIMF0cc6', // hashed word "password"
            displayName: 'Viktor Chupak'
        };

        User.findOne.mockResolvedValue(dbUser);

        const token = jwt.sign({ id: dbUser._id }, 'comics app');

        const response = await request(app)
            .post('/auth/login')
            .set('Accept', 'application/json')
            .send({ email: 'vik.chupak@mail.ru', password: 'password' })
            .expect('Content-Type', /json/)
            .expect(200, {
                email: 'vik.chupak@mail.ru',
                displayName: 'Viktor Chupak'
            });

        expect(response.body).toStrictEqual({
            email: 'vik.chupak@mail.ru',
            displayName: 'Viktor Chupak'
        });

        expect(response.headers).toHaveProperty('set-cookie');

        expect(response.headers['set-cookie'][0]).toMatch(new RegExp(token));
    })

    test('login with local strategy fails, if not existing email provided', async function() {

        User.findOne.mockResolvedValue(null);

        const response = await request(app)
            .post('/auth/login')
            .set('Accept', 'application/json')
            .send({ email: 'email.not.exist@mail.ru', password: 'password' })
            .expect('Content-Type', /json/)
            .expect(400, { message: 'Such a user not found' });

        expect(response.headers).not.toHaveProperty('set-cookie');
    })

    test('protected route test withot athorization fails', async function() {
        await request(app)
        .get('/protected-route')
        .expect(401);
    })

    test('protected route test with local athorization', async function() {

        const token = jwt.sign({ id: dbUser._id }, 'comics app');

        await request(app)
        .get('/protected-route')
        .set('Cookie', `jwt=${token}`)
        .expect(200, { message: "success" });
    })

    test('protected route test with google athorization, valid cookie session pair provided', async function() {
        await request(app)
        .get('/protected-route')
        // valid cookie session pair
        .set('Cookie', ['express:sess.sig=dZd2-qeAWdzrnnke2X4DY2Me8cc', 'express:sess=eyJwYXNzcG9ydCI6eyJ1c2VyIjoiNjA5ZDMwZDg3YTg5NTg5ZmEyN2I4OGE5In19'])
        .expect(200);
    })

    test('protected route test with google athorization, invalid cookie session pair provided', async function() {
        await request(app)
        .get('/protected-route')
        // invalid cookie session pair
        .set('Cookie', ['express:sess.sig=dZd2-qeAWdzrnnke2X4DY2Me8cc', 'express:sess=eyJwYXNzcG9ydCI6eyJ1c2VyIjoibW9uZ28tYXV0by1nZW5lcmF0ZWQtaWQtZm9yLWdvb2dsZS1wcm9maWxlIn19'])
        .expect(401);
    })
})
