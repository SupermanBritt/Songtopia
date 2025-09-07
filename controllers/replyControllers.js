import dotenv from 'dotenv';
dotenv.config();

import pkg from 'mongodb';
const { MongoClient, ObjectId } = pkg;

const uri = `mongodb+srv://${process.env.DbUser}:${process.env.DbPass}@${process.env.DbURL}`;
const client = new MongoClient(uri);


export const createReply = async (req, res) => {
    const { content, createdBy } = req.body;
    const postId = req.params.postId;

    try {
        await client.connect();
        const db = client.db('SongWebsite');
        const postsCollection = db.collection('Posts');
        const repliesCollection = db.collection('Replies');

        const newReply = {
            _id: new ObjectId(),
            createdBy: createdBy,
            content: content,
            createdOn: new Date()
        }

        const result = await repliesCollection.insertOne(newReply);
        if (result.insertedCount === 0) {
            return res.status(500).json({ error: 'Failed to add reply' });
        }

        const postUpdateResult = await postsCollection.updateOne(
            { _id: new ObjectId(postId) },
            { $push: { replies: newReply._id } }
        )

        if (postUpdateResult.modifiedCount === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.status(201).json({ message: 'Reply created', reply: newReply });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating reply' });
    } finally {
        //await client.close();
    }
}

export const getRepliesForPost = async (req, res) => {
    const postId = req.params.postId;

    try {
        await client.connect();
        const db = client.db('SongWebsite');

        const post = await db.collection('Posts').findOne(
            { _id: new ObjectId(postId) },
            { projection: { replies: 1, _id: 0 } }
        )

        if (!post) {
            return res.status(404).json({ error: 'No post found.' });
        }

        const replies = await db.collection('Replies').find({ _id: { $in: post.replies } }).toArray();

        res.status(200).json(replies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error getting replies' });
    } finally {
        //await client.close();
    }
}

export const updateReply = async (req, res) => {
    const replyId = req.params.id;
    const { content } = req.body;

    try {
        await client.connect();
        const db = client.db('SongWebsite');

        const updateResult = await db.collection('Replies').updateOne(
            { _id: new ObjectId(replyId) },
            { $set: { content: content } }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ error: 'No reply found.' });
        }

        res.status(200).json({ message: 'Reply updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating reply' });
    } finally {
        //await client.close();
    }
}

export const deleteReply = async (req, res) => {
    const replyId = req.params.id;

    try {
        await client.connect();
        const db = client.db('SongWebsite');

        const deleteResult = await db.collection('Replies').deleteOne({ _id: new ObjectId(replyId) });

        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ error: 'Reply not found' });
        }

        await db.collection('posts').updateOne(
            { replies: { $in: [new ObjectId(replyId)] } },
            { $pull: { replies: new ObjectId(replyId) } }
        );

        res.status(200).json({ message: 'Reply deleted successfully' });
    } catch (error) {
        console.error('Error deleting reply:', error);
        res.status(500).json({ error: 'Error deleting reply' });
    } finally {
        //await client.close();
    }
};
