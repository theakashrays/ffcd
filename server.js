const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 8080;

// The password that you use to log into the admin panel
const AUTH_TOKEN = '@thzyvxkupka3453';

app.use(express.json({ limit: '50mb' }));

// =============== START API ===============
// The Backend API proxy (Admin Panel Save/Delete functions)
// =========================================
const checkAuth = (req, res, next) => {
    if (req.headers.authorization !== AUTH_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

app.post('/api/save_multi', checkAuth, (req, res) => {
    try {
        const files = req.body.files || [];
        const saved = [];
        files.forEach(entry => {
            // Prevent directory traversal
            const safePath = entry.path.replace(/\.\./g, '').replace(/^\/+/, '');
            const fullPath = path.join(__dirname, safePath);
            fs.mkdirSync(path.dirname(fullPath), { recursive: true });
            fs.writeFileSync(fullPath, entry.content, 'utf8');
            saved.push(safePath);
        });
        res.json({ saved });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/delete_profile', checkAuth, (req, res) => {
    try {
        const slug = req.body.slug;
        if (!slug || slug.includes('..') || slug.includes('/') || slug.includes('\\')) {
            throw new Error("Invalid slug");
        }
        const deleted = [];
        const mainFile = path.join(__dirname, slug + '.html');
        if (fs.existsSync(mainFile)) {
            fs.unlinkSync(mainFile);
            deleted.push(slug + '.html');
        }
        ['_reputation.html', '_vouches.html'].forEach(suffix => {
            const assocFile = path.join(__dirname, slug + suffix);
            if (fs.existsSync(assocFile)) {
                fs.unlinkSync(assocFile);
                deleted.push(slug + suffix);
            }
        });
        res.json({ deleted });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/list_profiles', checkAuth, (req, res) => {
    const exclude = [
        'index.html', 'login.html', 'register.html', 'privacy_policy.html',
        'terms_of_use.html', 'search_posts.html', 'vouches_submit.html'
    ];
    let profiles = [];
    fs.readdirSync(__dirname).forEach(f => {
        if (!f.endsWith('.html') || exclude.includes(f) || f.startsWith('.') || f.endsWith('_reputation.html') || f.endsWith('_vouches.html')) {
            return;
        }
        const slug = f.slice(0, -5);
        const stats = fs.statSync(path.join(__dirname, f));
        profiles.push({
            slug: slug,
            filename: f,
            size_kb: +(stats.size / 1024).toFixed(1),
            modified: stats.mtime.getTime() / 1000,
            has_reputation: fs.existsSync(path.join(__dirname, slug + '_reputation.html')),
            has_vouches: fs.existsSync(path.join(__dirname, slug + '_vouches.html'))
        });
    });
    profiles.sort((a, b) => b.modified - a.modified);
    res.json({ profiles });
});

// =============== ROUTING ===============
// Custom Static File Serving & Extensionless URLs
// =======================================

// Serve the index.html on root
app.get('/', (req, res) => {
    const homePath = path.join(__dirname, 'index.html');
    if (fs.existsSync(homePath)) {
        return res.sendFile(homePath);
    }
    res.send("Welcome to the server. Directory root.");
});

app.get('/:slug', (req, res, next) => {
    const slug = req.params.slug;

    // Ignore paths with extensions (like .css, .png, etc)
    if (slug.includes('.')) {
        return next();
    }

    // Is it a directory like /adminpanelacess? Try serving index.html
    const dirPath = path.join(__dirname, slug);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        const indexPath = path.join(dirPath, 'index.html');
        if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
    }

    // Try serving slug.html (e.g. going to /1 loads 1.html transparently)
    const htmlPath = path.join(__dirname, slug + '.html');
    if (fs.existsSync(htmlPath)) {
        return res.sendFile(htmlPath);
    }

    // If no matching profile or directory is found, just 404
    res.status(404).send("Page not found on testing server.");
});

// Let Express serve raw assets (.css, .png, .gif, etc) safely
app.use(express.static(__dirname));

app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
});
