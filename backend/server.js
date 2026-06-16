const path = require('path');

// Esto busca el index.html automáticamente en cualquier subcarpeta de dist
const distPath = path.join(__dirname, '../dist');
const fs = require('fs');

app.use(express.static(distPath));

app.get('*', (req, res) => {
    let indexPath = path.join(distPath, 'index.html');

    if (!fs.existsSync(indexPath)) {
        const files = fs.readdirSync(distPath);
        const subFolder = files.find(f => fs.statSync(path.join(distPath, f)).isDirectory());
        if (subFolder) {
            indexPath = path.join(distPath, subFolder, 'index.html');
            if (!fs.existsSync(indexPath) && fs.existsSync(path.join(distPath, subFolder, 'browser', 'index.html'))) {
                indexPath = path.join(distPath, subFolder, 'browser', 'index.html');
            }
        }
    }
    res.sendFile(indexPath);
});