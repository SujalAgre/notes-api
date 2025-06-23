const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose')
require('dotenv').config()

const app = express();
app.use(express.json())


// this enables CORS for all origins, so any frontend can make requests to your API, Replace '*' with your own origin if needed.
app.use(cors({
    origin: '*'
}))


//      Create a .env file in your root directory and paste this inside it:
//      MONGO_URI="PASTE YOUR URI HERE"
const mongo_uri = process.env.MONGO_URI;


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
    const notes = await Note.find();
    res.json(notes)
})

app.post('/', async (req, res) => {
    console.log(req.body)
    const { note_id, title, content } = req.body;

    if (!id || !title || !content) {
        return res.status(400).json({ error: 'Missing id, title, content' })
    }
    const newNote = new Note({ note_id, title, content })

    await newNote.save();
})

app.put('/:note_id', async (req, res) => {
    const note_id = req.params.id;
    const { title, content } = req.body;

    const note = await Note.findOne({ note_id })

    if (!note) {
        return res.status(400).json({ error: 'Note not found' })
    }

    note.title = title
    note.content = content
    await note.save();
})

app.delete(`/:id`, async (req, res) => {
    const id = req.params.id;
    const result = await Note.deleteOne({ id })
    if (result.deletedCount === 0) {
        return res.status(400).json({ error: 'Note not found' })
    }
    res.json({ message: 'Note deleted' })
})

app.listen(3000, () => {
    console.log('server started')
})