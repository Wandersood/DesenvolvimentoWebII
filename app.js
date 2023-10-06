const express = require("express")
const app = express()
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore')

const serviceAccount = require('./projeto-web-ii-firebase-adminsdk-naicb-53133ffead.json')

initializeApp({
    credential: cert(serviceAccount)
})

const db = getFirestore()

app.engine("handlebars", handlebars({defaultLayout: "main"}))
app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get("/", function(req, res){
    res.render("primeira_pagina")
})

app.get("/consulta", function(req, res){
    var dados = [];
    db.collection('agendamentos').get()
        .then((snapshot) => { snapshot.forEach((doc) => {
            dados.push({ id: doc.id, ...doc.data() });
        });
            console.log("Dados adquiridos com sucesso!")
            res.render("consulta", { post: dados });
        })
        .catch((error) => {
            console.error("Erro ao consultar os dados: ", error);
        });
})


app.get("/editar/:id", function(req, res){
    var id = req.params.id;
    db.collection('agendamentos').doc(id).get()
        .then((doc) => {
            if (doc.exists) {
                res.render("editar", { agendamento: doc.data(), id: id });
            } else {
                res.status(404).send("Dados não encontrados");
            }
        })
        .catch((error) => {
            console.error("Não foi possível buscar os dados para edição: ", error);

        });
});


app.get("/excluir/:id", function(req, res){
    var id = req.params.id;
    db.collection('agendamentos').doc(id).delete()
        .then(() => {
            console.log("Dados excluidos");
            res.redirect("/consulta");
        })
        .catch((error) => {
            console.error("Não foi possivel excluir: ", error);
        });
})


app.post("/cadastrar", function(req, res){
    var result = db.collection('agendamentos').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        console.log('Documento foi cadastrado com sucesos!');
        res.redirect('/')
    })
})

app.post("/atualizar", function(req, res){
    var id = req.body.id;
    var updatedData = {
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    };
    db.collection('agendamentos').doc(id).update(updatedData)
        .then(() => {
            console.log("Dados foram atualizados com sucesso");
            res.redirect("/consulta");
        })
        .catch((error) => {
            console.error("Não foi possivel atualizar : ", error);
        });
})

app.listen(8081, function(){
    console.log("Servidor ativo!")
})