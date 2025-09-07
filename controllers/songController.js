import dotenv from 'dotenv';
dotenv.config();

import pkg from 'mongodb';
const { MongoClient, ObjectId } = pkg;

const uri = `mongodb+srv://${process.env.DbUser}:${process.env.DbPass}@${process.env.DbURL}`;
const client = new MongoClient(uri);

export const addSong = async (req, res) => {
    try {
        await client.connect();
        const db = client.db('SongWebsite');


        const newSong = {
            name: req.body.name,
            artist: req.body.artist,
            album: req.body.album,
            duration: req.body.duration,
            genre: req.body.genre,
            releaseDate: req.body.releaseDate,
            createdBy: req.user._id,
            createdOn: new Date()
        };

        const result = await db.collection('Songs').insertOne(newSong);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error creating song' });
        console.error('Error creating song:', error);
    } finally {
        //await client.close();
    }
}


export const getSongs = async (req, res) => {
    try {
        await client.connect();
        const db = client.db('SongWebsite');
        const songs = await db.collection('Songs').find({}).toArray();
        res.status(200).json(songs);
    } catch (error) {
        res.status(500).json({ error: 'Error getting songs' });
    } finally {
        //await client.close();
    }
}

export const getSongByID = async (req, res) => {
    try {
        await client.connect();
        const db = client.db('SongWebsite');
        const song = await db.collection('Songs').findOne({ _id: new ObjectId(req.params.id) });
        if (!song) {
            return res.status(404).json({ error: 'Song not found' });
        }
        res.status(200).json(song);
    } catch (error) {
        res.status(500).json({ error: 'Error getting song' });
    } finally {
        //await client.close();
    }
}

export const deleteSong = async (req, res) => {
    try {
        await client.connect();
        const db = client.db('SongWebsite');
        const result = await db.collection('Songs').deleteOne({ _id: new ObjectId(req.params.id) });

        if (result.deletedCount === 0) {
            res.status(404).json({ error: 'Song not found' });
        }

        res.status(200).json({ message: 'Song deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting song' });
    } finally {
        //await client.close();
    }
}

export const updateSong = async (req, res) => {
    try {
        await client.connect();
        const db = client.db('SongWebsite');

        const updatedSong = await db.collection('Songs').updateOne(
            { _id: new ObjectId(req.params.id) },
            {
                $set: {
                    name: req.body.name,
                    artist: req.body.artist,
                    album: req.body.album,
                    duration: req.body.duration,
                    genre: req.body.genre,
                    releaseDate: req.body.releaseDate
                }
            }
        );

        if (updatedSong.matchedCount === 0) {
            return res.status(404).json({ error: 'Song not found' });
        }

        res.status(200).json(updatedSong);
    } catch (error) {
        res.status(500).json({ error: 'Error deleting song' });
    } finally {
        //await client.close();
    }
}

export async function searchSong(req, res) {
    let searchParms = req.body
    // console.log("searchParms")
    // console.log(searchParms)

    if (searchParms.name !== undefined) {
        searchParms.name = { $regex: searchParms.name, $options: 'i' }
    }
    if (searchParms.artist !== undefined) {
        searchParms.artist = { $regex: searchParms.artist, $options: 'i' }
    }
    if (searchParms.album !== undefined) {
        searchParms.album = { $regex: searchParms.album, $options: 'i' }
    }
    if (searchParms.genre !== undefined) {
        searchParms.genre = { $regex: searchParms.genre, $options: 'i' }
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



    console.log("final Search songs")
    console.log(finalSearch)
    // console.log(finalSearch.$or[0])
    // console.log(finalSearch.$or[1])

    try {
        await client.connect();
        let songTable = await client.db("SongWebsite").collection("Songs")
        let foundSongs = await songTable.find(finalSearch).toArray()
        console.log("foundSongs")
        console.log(foundSongs)
        res.status(200)
        res.send(foundSongs)
    } catch (e) {
        console.log(e)
        res.status(400)
        res.send('bad search parameters')
    } finally {
        //await client.close();
    }
}






