import mongodb, { ObjectId } from "mongodb";

const DbConnectionURL = `mongodb+srv://${process.env.DbUser}:${process.env.DbPass}@${process.env.DbURL}`
const client = new mongodb.MongoClient(DbConnectionURL)

const Dbname = "SongWebsite"


export async function createPlaylist(req, res) {
    let newPlaylist = req.body
    //console.log("newPost")
    //console.log(newPost)
    //console.log(req.body)
    //console.log("newPost2")
    if (newPlaylistIsVaild(newPlaylist)) {
        try {
            newPlaylist.createdBy = req.user._id.toString()
            newPlaylist.createdOn = new Date()
            let playlistTable = await client.db(Dbname).collection("Playlists")
            let newID = (await playlistTable.insertOne(newPlaylist)).insertedId
            res.status(200)
            res.send(newID.toString())
        } catch (e) {
            res.status(404)
            res.send('error connecting to db')
        }
    } else {
        res.status(400)
        res.send('post object is not valid')
    }
}

export async function deletePlaylist(req, res) {
    let idToDelete = req.params.id
    //console.log(idToDelete)
    try {
        let playlistTable = await client.db(Dbname).collection("Playlists")
        let deleteResult = playlistTable.deleteOne({
            _id: new ObjectId(idToDelete),
            createdBy: req.user._id.toString()
        })
        if (deleteResult) {
            res.status(200)
            res.send("delete done")
        } else {
            res.status(400)
            res.send('delete failed: not found in db')
        }
    } catch (e) {
        console.log(e)
        res.status(400)
        res.send('error connecting to database')
    }
}

export async function updatePlaylistName(req, res) {
    let idToUpdate = req.params.id
    let newName = req.body
    //console.log(idToUpdate)
    //console.log(editedRecord)
    try {
        let updateScheme = {
            $set: {
                name: newName.name,
            },
        }
        let playlistTable = await client.db(Dbname).collection("Playlists")
        let updateResult = await playlistTable.updateOne({
            _id: new ObjectId(idToUpdate),
            createdBy: req.user._id.toString()
        }, updateScheme)
        if (updateResult) {
            res.status(200)
            res.send("Update done")
        } else {
            res.status(400)
            res.send('Update failed not found in db??')
        }
    } catch (e) {
        console.log(e)
        res.status(400)
        res.send('error connecting to database')
    }
}


export async function addSongToPlaylist(req, res) {
    let userID = req.user._id.toString()
    let playlistID = req.params.id
    let songToAdd = req.body.songID
    console.log("addSongToPlaylist")
    console.log(userID)
    console.log(playlistID)
    console.log(songToAdd)
    try {

        let playlistTable = await client.db(Dbname).collection("Playlists")
        let playlist = await playlistTable.findOne({ _id: new ObjectId(playlistID), createdBy: userID })
        let playlistSongs = playlist.songs
        playlistSongs.push(songToAdd)

        let updateStrat = {
            $set: {
                songs: playlistSongs
            }
        }

        let playListUpdate = await playlistTable.findOneAndUpdate({ _id: new ObjectId(playlistID), createdBy: userID }, updateStrat)


        res.status(200)
        res.send("favorited")
    } catch (e) {
        console.log(e)
        res.status(404)
        res.send('error connecting to db')
    }
}

export async function deleteSongFromPlaylist(req, res) {
    let userID = req.user._id.toString()
    let playlistID = req.params.id
    let songToDelete = req.body.songID
    console.log("songToDelete")
    console.log(userID)
    console.log(playlistID)
    console.log(songToDelete)
    try {

        let playlistTable = await client.db(Dbname).collection("Playlists")
        let playlist = await playlistTable.findOne({ _id: new ObjectId(playlistID), createdBy: userID })
        let playlistSongs = playlist.songs
        let indexToRemove = playlistSongs.indexOf(songToDelete)
        if (indexToRemove !== -1) {
            playlistSongs.splice(indexToRemove, 1)
        }
        else {
            res.status(400)
            res.send('song not found in db')
            return
        }

        let updateStrat = {
            $set: {
                songs: playlistSongs
            }
        }

        let playListUpdate = await playlistTable.findOneAndUpdate({ _id: new ObjectId(playlistID), createdBy: userID }, updateStrat)


        res.status(200)
        res.send("song deleted")
    } catch (e) {
        console.log(e)
        res.status(404)
        res.send('error connecting to db')
    }
}

export async function getSongsInPlaylist(req, res) {
    let playlistID = req.params.id
    console.log(playlistID)
    try {
        let playlistTable = await client.db(Dbname).collection("Playlists")
        let playlist = await playlistTable.findOne({ _id: new ObjectId(playlistID) })

        let songs_IDs = playlist.songs
        let playlistSongs = []
        let songTable = await client.db(Dbname).collection("Songs")

        console.log(songs_IDs)
        for (let i = 0; i < songs_IDs.length; i++) {
            console.log(new ObjectId(songs_IDs[i]))
            playlistSongs.push(await songTable.findOne({ _id: new ObjectId(songs_IDs[i]) }))
        }


        res.status(200)
        res.send(playlistSongs)
    } catch (e) {
        console.log(e)
        res.status(404)
        res.send('error connecting to db')
    }
}

export async function searchPlaylists(req, res) {
    let searchParms = req.body
    // console.log("searchParms")
    // console.log(searchParms)

    if (searchParms.name !== undefined) {
        searchParms.name = { $regex: searchParms.name, $options: 'i' }
    }

    if (searchParms._id !== undefined) {
        searchParms._id = new ObjectId(searchParms._id)
    }

    let finalSearch = {
        $or: []
    }

    for (const [key, value] of Object.entries(searchParms)) {
        console.log(`${key}: ${value}`);
        finalSearch.$or.push({ [key]: value })
    }

    if (Object.entries(searchParms).length === 0) {
        finalSearch = {}
    }

    console.log("final Search")
    // console.log(finalSearch)
    // console.log(finalSearch.$or[0])

    try {
        let playlistTable = await client.db(Dbname).collection("Playlists")
        let foundPlaylists = await playlistTable.find(finalSearch).toArray()
        console.log("foundPosts")
        console.log(foundPlaylists)
        res.status(200)
        res.send(foundPlaylists)
    } catch (e) {
        console.log(e)
        res.status(400)
        res.send('bad search parameters')
    }
}

export async function moveSong(req, res) {
    let parms = req.body
    console.log("parms stryder")
    console.log(parms)
    try {
        let playlistTable = await client.db(Dbname).collection("Playlists")
        let playlist = await playlistTable.findOne({ _id: new ObjectId(parms.playlist) })

        let songs_IDs = playlist.songs
        let indexToMove = songs_IDs.indexOf(parms.song)
        let indexToMoveTo = parms.movement + indexToMove

        if (indexToMoveTo < 0 || indexToMoveTo >= songs_IDs.length) {
            res.status(400)
            res.send('movement out of range')
            return
        }

        let temp = songs_IDs[indexToMove]
        songs_IDs[indexToMove] = songs_IDs[indexToMoveTo]
        songs_IDs[indexToMoveTo] = temp

        let updateScheme = {
            $set: {
                songs: songs_IDs
            },
        }
        let updateResult = await playlistTable.updateOne({
            _id: new ObjectId(parms.playlist),
            createdBy: req.user._id.toString()
        }, updateScheme)

        if (updateResult) {
            res.status(200)
            res.send("move complete")
        } else {
            res.status(400)
            res.send('move failed not found in db??')
        }
    } catch (e) {
        console.log(e)
        res.status(404)
        res.send('error connecting to db')
    }
}

function newPlaylistIsVaild(newPlaylist) {
    if (newPlaylist.name === undefined || typeof (newPlaylist.name) !== "string") {
        return false
    }
    if (newPlaylist.songs === undefined || !Array.isArray(newPlaylist.songs)) {
        return false
    }
    return true
}