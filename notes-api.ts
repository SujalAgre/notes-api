import express from 'express';
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv';
dotenv.config()

const app = express();
app.use(express.json())

// This enables CORS for all origins, so any frontend can make requests to your API, Replace '*' with your own origin if needed.
app.use(cors({
    origin: '*'
}))

//      Create a .env file in your root directory and paste this inside it:
//      MONGO_URI="PASTE YOUR URI HERE"
const mongo_uri: string = process.env.MONGO_URI!;

mongoose.connect(mongo_uri)
    .then(() => console.log('DB Connected'))
    .catch((err) => console.error(`DB Connection error: ${err}`))

const noteSchema = new mongoose.Schema({
    note_id: String,
    title: String,
    content: String
})

const Note = mongoose.model('Note', noteSchema);

app.get('/', async (req, res) => {
    try {
        const notes = await Note.find();
        res.json(notes)
    } catch (error) {
        res.json({ error: error })
    }
})

app.post('/', async (req, res) => {
    console.log(req.body)
    const { note_id, title, content } = req.body;

    if (!note_id || !title || !content) {
        return res.status(400).json({ error: 'Missing id, title, content' })
    }
    const newNote = new Note({ note_id, title, content })

    try {
        await newNote.save();
        res.status(201).json({ message: 'Note created successfully', note: newNote })
    } catch (error) {
        res.status(500).json({ error: `Failed to save note, ${error}` });
    }
})

app.put('/:note_id', async (req, res) => {
    const note_id = req.params.note_id;
    const { title, content } = req.body;

    try {
        const note = await Note.findOne({ note_id })

        if (!note) {
            return res.status(400).json({ error: 'Note not found' })
        }

        note.title = title
        note.content = content
        await note.save();
        res.json({ message: "Note updated", note })
    } catch (error) {
        res.status(500).json({ error: error })
    }
})

app.delete('/:note_id', async (req, res) => {
    const note_id = req.params.note_id;

    try {
        const result = await Note.deleteOne({ note_id })
        if (result.deletedCount === 0) {
            return res.status(400).json({ error: 'Note not found' })
        }
        res.json({ message: 'Note deleted' })
    } catch (error) {
        res.json({error: error})
    }
})

app.listen(3000, () => {
    console.log('notes-api started...')
})