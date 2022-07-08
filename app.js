const express = require('express');
const dniValidator = require('spain-id');
const cookieParser = require('cookie-parser');

const uri = "mongodb+srv://root:root@cluster0.lo8dg.mongodb.net/?retryWrites=true&w=majority";
const { MongoClient } = require('mongodb');
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});


const app = express();
app.use(cookieParser());

app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    // Rastrear el acceso del usuario. Enviarle una cookie para que la guarde en su navegador

    // nombre de la cookie, valor (en este guardamos la fecha actual), objeto con opciones: entre ellas maxAge, que nos permite indicar cuantos milisegundos va a tener vida esta cookie

    res.cookie("ultimaVisita", Date(), {
        maxAge: 60000
    });

    res.sendFile(__dirname + "/formulario.html");
})


app.post('/', async (req, res) => {



    const dni = req.body.DNI;
    const database = client.db('policia');

    const coll = database.collection('dnis');

    const isValid = dniValidator.validDNI(dni);
    await coll.insertOne({
        dni,
        valid: isValid
    });

    res.redirect('/list');
});

app.get("/list", async (req, res) => {

    // usaremos la cookie, para informar en la lista de dnis al usuario cuando fue la última vez que accedio a nuestros sistemas
    console.log(req.cookies);

    // Seleccionar la base de datos
    const database = client.db('policia');

    // Seleccionamos la colección restaurants
    const coll = database.collection('dnis');
    const documents = await coll.find().toArray();

    res.render('list.ejs', {
        documents,
        ultimaVisita: req.cookies.ultimaVisita
    })
})

// la función listen es en minúsculas.
client.connect(() => {

    app.listen(3000);
})
