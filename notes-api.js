const express = require('express');
const fs = require('fs');
const cors = require('cors');
const mongoose = require('mongoose')
require('dontenv').config()

const app = express();

app.use(cors())
app.use(express.json())

const mongo_uri = process.env.MONGO_URI;

mongoose.connect(mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('DB Connected'))
    .catch((err) => console.error(`DB Connection error: ${err}`))

const noteSchema = new mongoose.Schema({
    id: {
        title: String,
        content: String
    }
})

const Note = mongoose.model('Note', noteSchema);

fs.readFile("notes.json", 'utf-8', (err, data) => {
    if (err) {
        console.error(err)
    }
    notes = JSON.parse(data)
})

let notesContent = JSON.stringify(notes, null, 2)

app.get('/', async (req, res) => {
    const notes = await Note.find();
    res.json(notes)
})

app.post('/', (req, res) => {
    console.log(req.body)
    const { id, title, content } = req.body;

    if (!id || !title || !content) {
        return res.status(400).json({ error: 'Missing id, title, content' })
    }

    notes[id] = { title, content };
    saveFile();
})

app.put('/:id', (req, res) => {
    const id = req.params.id;
    const { title, content } = req.body;

    if (!notes[id]) {
        return res.status(400).json({ error: 'Note not found' })
    }

    notes[id] = { title, content }
    saveFile();
})

app.delete(`/:id`, (req, res) => {
    const id = req.params.id;
    if (!notes[id]) {
        return res.status(400).json({ error: 'Note not found' })
    }
    delete notes[id];
    saveFile();
})

function saveFile(callback) {
    let notesContent = JSON.stringify(notes, null, 2)
    fs.writeFile('notes.json', notesContent, (err) => {
        if (err) {
            console.error(err)
        }
    })
}

app.listen(3000, () => {
    console.log('server started')
})