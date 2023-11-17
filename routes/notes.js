const express = require('express');
const router = express.Router();
const fetchUser = require('../middleware/fetchUser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');

//Route 1: Fetch all notes using: GET "/api/notes/fetchallnotes". Login required
router.get('/fetchallnotes', fetchUser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }
})

//Route 2: Add a new note using: POST "/api/notes/addnote". Login required
router.post('/addnote', [
    body('title', 'Title should must be at least 3 characters long').isLength(3),
    body('description', 'Description should must be at least 5 characters long').isLength(5)
], fetchUser, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, tag } = req.body;
    try {
        const note = new Notes({
            user: req.user.id,
            title: title,
            description: description,
            tag: tag
        })

        const savedNote = await note.save();
        res.send(savedNote);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }
})

//Route 3: Update a note using: PUT "/api/notes/updatenote". Login required
router.put('/updatenote/:id', fetchUser, async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        //Creating a new note object
        const newNote = {};
        if (title) {
            newNote.title = title;
        }
        if (description) {
            newNote.description = description;
        }
        if (tag) {
            newNote.tag = tag;
        }

        // Find the note to be updated and update it
        let note = await Notes.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not found!");
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not alowed!");
        }

        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json(note);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }
})

//Route 4: Delete a note using: DELETE "/api/notes/deletenote". Login required
router.delete('/deletenote/:id', fetchUser, async (req, res) => {
    try {
        // Find the note to be deleted and delete it
        let note = await Notes.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not found!");
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not alowed!");
        }

        note = await Notes.findByIdAndDelete(req.params.id);
        res.json({success: 'Note deleted successfully'});

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured",note);
    }
})


module.exports = router;