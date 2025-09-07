import mongodb, { ObjectId } from "mongodb";
import dotenv from 'dotenv'
dotenv.config()
const Dbname = "SongWebsite"
const DbConnectionURL = `mongodb+srv://${process.env.DbUser}:${process.env.DbPass}@${process.env.DbURL}`
const client = new mongodb.MongoClient(DbConnectionURL)





export async function getUserPosts(req, res) {
    let userID = req.user._id.toString()
    console.log(userID)
    try {
        let postTable = await client.db(Dbname).collection("Posts")
        let usersPosts = await postTable.find({ createdBy: userID }).toArray()
        res.status(200)
        res.send(usersPosts)
    } catch (e) {
        console.log(e)
        res.status(404)
        res.send('error connecting to db')
    }
}

export async function getUserPlaylist(req, res) {
    let userID = req.user._id.toString()
    console.log(userID)
    try {
        let playlistTable = await client.db(Dbname).collection("Playlists")
        let usersPlaylists = await playlistTable.find({ createdBy: userID }).toArray()
        res.status(200)
        res.send(usersPlaylists)
    } catch (e) {
        console.log(e)
        res.status(404)
        res.send('error connecting to db')
    }
}

export async function getUserFavorites(req, res) {
    let userID = req.user._id
    console.log("fav userID")
    console.log(userID)
    try {
        let userTable = await client.db(Dbname).collection("Users")
        let user = await userTable.findOne({ _id: userID })

        let userFavorites = user.favorites
        let favoriteSongs = []
        let songTable = await client.db(Dbname).collection("Songs")
        console.log("userFavorites")
        console.log(userFavorites)
        for (let i = 0; i < userFavorites.length; i++) {
            console.log(new ObjectId(userFavorites[i]))
            favoriteSongs.push(await songTable.findOne({ _id: new ObjectId(userFavorites[i]) }))
        }


        res.status(200)
        res.send(favoriteSongs)
    } catch (e) {
        console.log(e)
        res.status(404)
        res.send('error connecting to db')
    }
}

export async function getUserUploadedSongs(req, res) {
    let userID = req.user._id.toString()
    console.log(userID)
    try {
        let songsTable = await client.db(Dbname).collection("Songs")
        let usersSongs = await songsTable.find({ createdBy: userID }).toArray()
        res.status(200)
        res.send(usersSongs)
    } catch (e) {
        console.log(e)
        res.status(404)
        res.send('error connecting to db')
    }
}

export async function getUserReplies(req, res) {
    let userID = req.user._id.toString()
    console.log(userID)
    try {
        let replyTable = await client.db(Dbname).collection("Replies")
        let replies = await replyTable.find({ createdBy: userID }).toArray()
        res.status(200)
        res.send(replies)
    } catch (e) {
        console.log(e)
        res.status(404)
        res.send('error connecting to db')
    }
}

export async function addFavoriteSong(req, res) {
    let userID = req.user._id
    let songToFav = req.params.id
    console.log(userID)
    console.log(songToFav)
    try {

        let usersTable = await client.db(Dbname).collection("Users")
        let user = await usersTable.findOne({ _id: userID })
        let userFavs = user.favorites
        user.favorites.push(songToFav)

        let updateStrat = {
            $set: {
                favorites: userFavs
            }
        }

        let userUpdate = await usersTable.findOneAndUpdate({ _id: userID }, updateStrat)


        res.status(200)
        res.send("favorited")
    } catch (e) {
        console.log(e)
        res.status(404)
        res.send('error connecting to db')
    }
}

export function gitHubCallBack(req, res) {
    res.redirect("/");
}

export function gitHubLogOut(req, res) {
    req.logout(function (err) {
        //console.log(err)
        res.redirect('/testPages/testLogin.html');
    });
}

export function getUserName(req, res) {
    console.log("sent username")
    //console.log(req.session.login)
    res.status(200)
    res.send(req.user.userName)
}

export async function getUserNameByID(req, res) {
    let userID = req.params.id
    console.log(userID)
    try {
        let usersTable = await client.db(Dbname).collection("Users")
        let user = await usersTable.findOne({ _id: new ObjectId(userID) })
        res.status(200)
        res.send(user.userName)
    } catch (e) {
        console.log(e)
        res.status(404)
        res.send('error connecting to db')
    }
}

export function getDBid(req, res) {
    console.log("sent id+")
    res.status(200)
    res.send(req.user._id.toString())
}



