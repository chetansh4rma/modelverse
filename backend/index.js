const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const sql = require('mssql');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const path = require('path');
const app = express();
require('dotenv').config();
const cors = require('cors');
const API_KEY = 'f027fa19-9c63-41ac-965e-ad2c50e2dcb8';

const config = {
  server: 'mynewserver.database.windows.net',
  database: 'dtabase',
  authentication: {
    type: 'default',
    options: {
      userName: 'chetansharma',
      password: 'Chetan9@'
    }
  },
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post("/remove-background", upload.single('image'), async (req, res) => {
    const imageUrl = req.file.path;
    try {
        const imageBinary = fs.readFileSync(imageUrl);
        const imagenew = imageBinary.toString('base64');
        const data = await axios.post("https://api.pebblely.com/remove-background/v1/", {
            image: imagenew
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-Pebblely-Access-Token': API_KEY
            }
        });
        const image1 = data.data.data;
        const imageBinaryNew = Buffer.from(image1, 'base64');
        res.set({
            'Content-Disposition': 'attachment; filename="background_removed_image.png"',
            'Content-Type': 'image/png'
        });
        res.send(imageBinaryNew);
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal server error.');
    }
});

app.post("/create", upload.single('image'), async(req, res) => {
    try {
        const imageUrl = req.body.image;
        const theme = req.body.theme;
        const description = req.body.description;
        const imagenew = imageUrl;
        const data = await axios.post("https://api.pebblely.com/create-background/v2/", {
            images: [imagenew],
            theme: theme,
            description: description,
            style_color: null,
            generate_plus: false,
            autoresize: true,
            transforms: [{
                x: 0,
                y: 0,
                angle: 0
            }]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-Pebblely-Access-Token': API_KEY
            }
        });
        const image1 = data.data.data;
        const imageBinaryNew = Buffer.from(image1, 'base64');
        const fileName = `uploads/image_${uuidv4()}.png`;
        fs.writeFile(fileName, imageBinaryNew, 'binary', async (err) => {
            if (err) {
                console.error('Error saving image:', err);
                res.status(500).send('Error saving image.');
                return;
            }
            console.log('Image saved successfully:', fileName);
            try {
                await sql.connect(config);
                const requestInsert = new sql.Request();
                const queryInsert = `INSERT INTO Images (ImageUrl, Theme, Description) VALUES (@imageUrl, @theme, @description)`;
                requestInsert.input('imageUrl', sql.NVarChar, fileName);
                requestInsert.input('theme', sql.NVarChar, theme);
                requestInsert.input('description', sql.NVarChar, description);
                const resultInsert = await requestInsert.query(queryInsert);
                await sql.close();
                res.json({ success: true });
            } catch (dbErr) {
                console.error('Error inserting image URL into database:', dbErr);
                res.status(500).send('Error inserting image URL into database.');
            }
        });
    } catch (err) {
        console.error('Error creating image:', err);
        res.status(500).send('Internal server error.');
    }
});

app.post("/themes",async (req,res)=>{
    try {
        const response = await axios.get("https://api.pebblely.com/themes/v1/");
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching themes:', error);
        res.status(500).send('Internal server error.');
    }
});

app.post("/fetchimage", async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const resultFetch = await pool.request().query('SELECT ImageUrl FROM Images');
        const imageUrls = resultFetch.recordset.map(record => record.ImageUrl);
        await pool.close();
        res.json(imageUrls);
    } catch (err) {
        console.error('Error fetching images from database:', err);
        res.status(500).send('Internal server error.');
    }
});

const port = process.env.PORT||3001;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
