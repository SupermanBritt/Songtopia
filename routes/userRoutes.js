import express from "express";
import passport from 'passport'
import {
    addFavoriteSong,
    getDBid, getUserFavorites,
    getUserName, getUserNameByID,
    getUserPlaylist,
    getUserPosts, getUserReplies, getUserUploadedSongs,
    gitHubCallBack,
    gitHubLogOut
} from "../controllers/userControllers.js";
import dotenv from 'dotenv'
import { isAuthed } from "../server.js";
dotenv.config()
const router = express.Router();

router.get('/posts', isAuthed, getUserPosts)

router.get('/playlists', isAuthed, getUserPlaylist)

router.get('/favorites', isAuthed, getUserFavorites)

router.get('/uploadedSongs', isAuthed, getUserUploadedSongs)

router.get('/replies', isAuthed, getUserReplies)

router.post('/favorites/:id', isAuthed, addFavoriteSong)

router.get('/userName/:id', getUserNameByID)

router.get('/auth/github', passport.authenticate('github'), function (req, res) {
    console.log("should not run")
})

router.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), gitHubCallBack)

router.post('/git/logout', gitHubLogOut);
router.get('/git/userName', isAuthed, getUserName)

router.get('/git/dbID', isAuthed, getDBid)

export default router