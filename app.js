const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Serve the projects.html as the index page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'projects.html'));
});

// Endpoint to list top-level folders
app.get('/list-folders', (req, res) => {
    const rootPath = __dirname;

    fs.readdir(rootPath, { withFileTypes: true }, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory: ' + err);
        }
        console.log(files);
        const folders = files
            .filter(file => file.isDirectory())
            .map(folder => folder.name).filter(folder => !['.git', 'node_modules'].includes(folder))
        res.json(folders);
    });
});

// Endpoint to list subfolders and files inside the selected top-level folder
app.get('/folders/:folder/', (req, res) => {
    const folder = req.params.folder;
    const folderPath = path.join(__dirname, folder);

    fs.readdir(folderPath, { withFileTypes: true }, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan folder: ' + err);
        }

        const subfolders = files
            .filter(file => file.isDirectory())
            .map(subfolder => {
                const subfolderPath = path.join(folderPath, subfolder.name);
                const fileNames = fs.readdirSync(subfolderPath);

                const projectFiles = {
                    folder: subfolder.name,
                    files: {}
                };

                // Add files if they exist
                ['a.html', 'b.html', 'i.html', 'video.mp4'].forEach(file => {
                    if (fileNames.includes(file)) {
                        projectFiles.files[file] = `/${folder}/${subfolder.name}/${file}`;
                    }
                });

                return projectFiles;
            });

        res.json(subfolders);
    });
});

// Serve static files such as HTML and video files
app.use(express.static(__dirname));

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
