
const express = require("express");

const app = express();
const { encryptString, decryptString } = require('string-cipher');
const expressLayouts = require('express-ejs-layouts');


//Loads the handlebars modul
const { default: mongoose } = require("mongoose");

//Sets handlebars configurations (we will go through them later on)
app.set('view engine', 'ejs')
app.use(expressLayouts);
app.set('views', 'views');
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('public'));


mongoose.connect("mongodb://localhost/stories",).then(res => {
    console.log("db connected");
}).catch(err => {
    console.error(err);
})


const model = mongoose.model("post", mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    }
}))

app.post("/post", async (req, res) => {
    const pBody = await encryptString(req.body.body, req.body.secret);
    await model({
        title: req.body.title,
        body: pBody,
    }).save()
    res.redirect("/")
})


app.post("/post/:id", async (req, res) => {
    try {
        const data = await model.findById(req.params.id);
        const body = await decryptString(data.body, req.body.secret)
        console.log(req.params.id, req.body, body);
        let payload = {
            title: data.title,
            body: body
        }
        console.log(payload);
        res.render("post", payload)
    } catch (err) {
        res.redirect("/")
    }
})


app.get("/", async (req, res) => {
    const data = await model.find({}, { _id: 1, title: 1 })
    console.log(data);
    res.render("index", { data })
})












app.listen(8999)
