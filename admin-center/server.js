const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const users = require('./config/users');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for images
app.use('/admin', express.static('public'));
app.set('view engine', 'ejs');

// Session setup
app.use(session({
    secret: 'secret-key-replace-in-prod',
    resave: false,
    saveUninitialized: true
}));

// Auth Middleware
const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/admin');
    }
};

// Routes

// Redirect root to admin
app.get('/', (req, res) => {
    res.redirect('/admin');
});

// Login Page
app.get('/admin', (req, res) => {
    if (req.session.user) {
        return res.redirect('/admin/dashboard');
    }
    res.render('login', { error: null });
});

// Login Action
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    if (users[username] && users[username] === password) {
        req.session.user = username;
        res.redirect('/admin/dashboard');
    } else {
        res.render('login', { error: 'Invalid username or password' });
    }
});

// Dashboard (Protected)
app.get('/admin/dashboard', requireAuth, (req, res) => {
    res.render('dashboard', { user: req.session.user });
});

// Save content endpoint
app.post('/admin/save', (req, res) => {
    const { content, filename } = req.body;
    if (!content) {
        return res.status(400).send('No content provided');
    }

    let finalFilename;
    if (filename && filename.trim() !== "") {
        finalFilename = filename.trim();
        // Basicsanitization to ensure .html extension
        if (!finalFilename.endsWith('.html')) {
            finalFilename += '.html';
        }
    } else {
        const timestamp = Date.now();
        finalFilename = `content-${timestamp}.html`;
    }
    
    const filepath = path.join(__dirname, 'assets', finalFilename);

    const fs = require('fs');
    fs.writeFile(filepath, content, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error saving file');
        }
        console.log(`Saved file: ${filepath}`);
        res.status(200).send({ message: 'File saved successfully', filename: finalFilename });
    });
});

// Delete content endpoint
app.post('/admin/delete', (req, res) => {
    const { filename } = req.body;
    if (!filename) {
        return res.status(400).send('No filename provided');
    }

    // Basic security check
    if (filename.includes('..') || filename.includes('/')) {
        return res.status(400).send('Invalid filename');
    }

    const filepath = path.join(__dirname, 'assets', filename);
    const fs = require('fs');
    
    // Check if file exists first
    if (!fs.existsSync(filepath)) {
        return res.status(404).send('File not found');
    }

    fs.unlink(filepath, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
            return res.status(500).send('Error deleting file');
        }
        console.log(`Deleted file: ${filepath}`);
        res.status(200).send({ message: 'File deleted successfully' });
    });
});

// Get default signature
app.get('/admin/default', (req, res) => {
    const defaultPath = path.join(__dirname, 'assets', 'default.json');
    const fs = require('fs');
    if (fs.existsSync(defaultPath)) {
        fs.readFile(defaultPath, 'utf8', (err, data) => {
            if (err) return res.json({ filename: null });
            try {
                res.json(JSON.parse(data));
            } catch (e) {
                res.json({ filename: null });
            }
        });
    } else {
        res.json({ filename: null });
    }
});

// Set default signature
app.post('/admin/default', (req, res) => {
    const { filename } = req.body;
    if (!filename) {
        return res.status(400).send('No filename provided');
    }
    const defaultPath = path.join(__dirname, 'assets', 'default.json');
    const fs = require('fs');
    fs.writeFile(defaultPath, JSON.stringify({ filename }), (err) => {
        if (err) {
             console.error('Error setting default:', err);
             return res.status(500).send('Error setting default');
        }
        res.json({ message: 'Default set successfully', filename });
    });
});

// List files endpoint
app.get('/admin/files', requireAuth, (req, res) => {
    const assetsDir = path.join(__dirname, 'assets');
    
    // Ensure assets dir exists
    if (!require('fs').existsSync(assetsDir)){
        return res.json([]);
    }

    require('fs').readdir(assetsDir, (err, files) => {
        if (err) {
            console.error('Error listing files:', err);
            return res.status(500).send('Error listing files');
        }
        // Filter for html files only? Or all files. Let's send all for now.
        const fileList = files.filter(f => f.endsWith('.html'));
        res.json(fileList);
    });
});

// Get file content endpoint
app.get('/admin/files/:filename', (req, res) => {
    const filename = req.params.filename;
    // Basic security check to prevent directory traversal
    if (filename.includes('..') || filename.includes('/')) {
        return res.status(400).send('Invalid filename');
    }
    
    const filepath = path.join(__dirname, 'assets', filename);
    
    require('fs').readFile(filepath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(404).send('File not found');
        }
        res.send(data);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
