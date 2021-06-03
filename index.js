const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser')

app.use( bodyParser.json() ); 
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 4000
const dbUrl = 'mongodb+srv://User_1:Himan123@cluster0.8qbnp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

const dbClient = new MongoClient(
    dbUrl,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);

app.get('/', async (req, res) => {
    const data = await dbClient.db(
        'Solu_db'
    ).collection(
        'Table'
    ).find().toArray();
    console.log(data.length);
    data.length = 10;
    res.json({ message: data });
});

app.post('/lat', async (req, res) => {
    console.log(req.body)
    const data = await dbClient.db(
        'Solu_db'
    ).collection(
        'Table'
    ).find({
        Latitude: req.body.Latitude,
        Longitude: req.body.Longitude
    }).toArray();
    res.json({ message: data });
});

async function main() {
    await dbClient.connect();
    app.listen(port, () => console.log(`App listening on port ${port}`))
}
main();