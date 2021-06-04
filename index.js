const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser')
const geolib = require('geolib');

const { getDistance } = geolib;

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

const getUserDistance = ({
    userLat,
    userLong,
    truckLat,
    truckLong
}) => getDistance(
    { latitude: parseFloat(userLat), longitude: parseFloat(userLong) },
    { latitude: truckLat, longitude: truckLong }
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

app.get('/lat', async (req, res) => {
    console.log(req.body)
    const data = await dbClient.db(
        'Solu_db'
    ).collection(
        'Table'
    ).find({
        Latitude: { $ne: req.body.Latitude },
        Longitude: { $ne: req.body.Longitude }
    }).toArray();
    res.json({ message: data });
});

app.get('/nearest', async (req, res) => {
    const {
        body: {
            Latitude: userLat,
            Longitude: userLong
        }
    } = req;
    const data = await dbClient.db(
        'Solu_db'
    ).collection(
        'Table'
    ).find().toArray();

    const distances = await Promise.all(
        data.map((ele) => {
            const diff = getUserDistance({
                userLat,
                userLong,
                truckLat: ele.Latitude,
                truckLong: ele.Longitude
            });
            return { ...ele, distance: diff }
        })
    );

    const trucks = distances.sort(
        (a, b) => a - b
    ).filter(
        (ele) => ele.distance != 0
    );
    res.json(trucks);
});

async function main() {
    await dbClient.connect();
    app.listen(port, () => console.log(`App listening on port ${port}`))
}
main()