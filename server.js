import dotenv from 'dotenv'
dotenv.config()
import mongodb from 'mongodb'
import express from 'express'
import userRoutes from './routes/userRoutes.js'
import postRoutes from './routes/postRoutes.js'
import playlistRoutes from './routes/playlistRoutes.js'
import replyRoutes from './routes/replyRoutes.js'
import songRoutes from './routes/songRoutes.js'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import passport from "passport";
import expressSession from "express-session";
import MongoStore from "connect-mongo";
import passportGithub2 from "passport-github2";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DbConnectionURL = `mongodb+srv://${process.env.DbUser}:${process.env.DbPass}@${process.env.DbURL}`
const client = new mongodb.MongoClient(DbConnectionURL)
const app = express()
app.use(express.urlencoded({ extended: false })); //url parser
app.use(express.json()) // parse data as json
const port = 3000
const Dbname = "SongWebsite"

//Github Authentication
passport.use(new passportGithub2.Strategy({
    clientID: process.env.gitHubClient,
    clientSecret: process.env.gitHubSecret,
    callbackURL: "http://localhost:3000/api/users/auth/github/callback"
},
    async function (accessToken, refreshToken, profile, done) {
        await client.connect()
        let usersTable = await client.db(Dbname).collection("Users")

        //attempt to find the user, if no user is present create one
        let findResult = await usersTable.findOneAndUpdate({ gitHubID: profile.id },
            {
                $setOnInsert: {
                    gitHubID: profile.id,
                    userName: profile.username,
                    favorites: [],
                }
            }, { upsert: true })

        return done(null, findResult)
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.gitHubID);
});

passport.deserializeUser(async function (gitHubID, done) {
    await client.connect()
    let usersTable = await client.db(Dbname).collection("Users")
    let findUser = await usersTable.findOne({ gitHubID: gitHubID })
    done(null, findUser);
});

app.use(expressSession({ secret: process.env.sessionSecret, resave: false, saveUninitialized: false, store: MongoStore.create({ mongoUrl: DbConnectionURL }) }))
app.use(passport.initialize())
app.use(passport.session({}));

export function isAuthed(req, res, next) {
    //console.log(req)
    if (req.isAuthenticated()) { return next(); }
    else {
        res.redirect("/login.html")
    }
}

app.get('/', isAuthed, (req, res) => {
    res.sendFile('/public/index.html', { root: __dirname })
})

// defining routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/replies', replyRoutes);
app.use('/api/playlists', playlistRoutes);

// allow all files in public to be served
app.use(express.static('truePublic'))
app.use([isAuthed, express.static('public')])


//start server on port
app.listen(process.env.PORT || port, () => {
    console.log(`Listening on port ${port}`)
})

