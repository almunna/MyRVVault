import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname, 'dist')));

const PORT =  3001;
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
app.listen(PORT, () => {
    console.log(`Server is running on port http://51.20.217.10/:${PORT}`);
});


