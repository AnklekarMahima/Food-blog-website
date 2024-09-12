const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); 
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

function clearUploadsFolder() {
    const directory = 'public/uploads';
    fs.readdir(directory, (err, files) => {
        if (err) throw err;
        for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
                if (err) throw err;
            });
        }
    });
}
clearUploadsFolder();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

let posts = [];

app.get('/', (req, res) => {
    res.render('index', { posts: posts });
});

app.get('/create', (req, res) => {
    res.render('create');
});

app.post('/create', upload.single('image'), (req, res) => {
    const newPost = {
        id: posts.length + 1,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content,
        image: req.file ? '/uploads/' + req.file.filename : '/images/sample-food.jpg'
    };
    posts.push(newPost);
    res.redirect('/');
});

app.get('/posts/:id', (req, res) => {
    const post = posts.find(p => p.id == req.params.id);
    if (post) {
        res.render('post', { post: post });
    } else {
        res.status(404).send('Post not found');
    }
});

app.get('/edit/:id', (req, res) => {
    const post = posts.find(p => p.id == req.params.id);
    if (post) {
        res.render('edit', { post: post });
    } else {
        res.status(404).send('Post not found');
    }
});

app.post('/edit/:id', upload.single('image'), (req, res) => {
    const post = posts.find(p => p.id == req.params.id);
    if (post) {
        post.title = req.body.title;
        post.description = req.body.description;
        post.content = req.body.content;
        if (req.file) {
            post.image = '/uploads/' + req.file.filename;
        }
        res.redirect('/');
    } else {
        res.status(404).send('Post not found');
    }
});

app.post('/delete/:id', (req, res) => {
    const postId = parseInt(req.params.id, 10);
    posts = posts.filter(p => p.id !== postId);
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});


