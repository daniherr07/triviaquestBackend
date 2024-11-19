const express = require('express')
const app = express()
const cors = require('cors')


app.use(cors())
app.use(express.json());


var mysql = require("mysql2");

var hostname = "u9vxr.h.filess.io";
var database = "triviaQuestDB_continent";
var port = "3307";
var username = "triviaQuestDB_continent";
var password = "19f63078ce6d34b42574a59c7283a0c342202655";

var con = mysql.createConnection({
    host: hostname,
    user: username,
    password,
    database,
    port,
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});



app.post('/login', (req, res) => {
    const {userName, password} = req.body
    console.log("llego aqui 1 login")

    con.query('Select username, highScore from users where username = ? and password = ?', [userName, password] ,(err, results) => {
            if (err) {
                return res.status(400).json(err)
            }

            if(results.length == 0){
                console.log("Contraseña o usuario incorrecto")
                return res.status(400).json({msj: "Usuario o contraseña incorrectos"})
            }

            console.log("autorizado")
            return res.status(200).json({msj: "Usuario autorizado", authorized: true, highScore: results[0].highScore, user: results[0].username})
    })
})

app.post('/register', (req, res) => {
    const {userName, password, password2} = req.body
    
    if (password != password2) {
        console.log("password doesnt match")
        return res.status(400).json({msj: "Passwords don't match", pswError: true})
    }

    console.log("Llego a la primera comprobacion")

    con.query('Select * from users where username = ?', [userName] ,(err, results) => {
            if (err) {
                return res.status(400).json(err)
            }

            console.log("Primera comprobacion")

            if(results.length > 0){
                console.log("Users found when registering")
                return res.status(400).json({msj: "UserFound", userError: true})
                
            }

            con.query('INSERT INTO users(username, password, highScore) VALUES (?, ?, ?)', [userName, password, 0] ,(err, results) => {
                if (err) {
                    return res.status(400).json(err)
                }

                console.log("Si se registró")
                return res.status(200).json({msj: "Usuario registrado", registered: true, highScore: 0, user: userName} )
            })

    })
})

app.get('/getQuestions', (req, res) => {
    console.log("se pudo")

    con.query('SELECT * FROM preguntas ORDER BY RAND() LIMIT 30;',(err, results) => {
            if (err) {
                return res.status(400).json(err)
            }


            return res.status(200).json(results)
    })
})

app.post('/save', (req, res) => {
    const {username, points} = req.body

    con.query('Select highScore from users where username = ?', [username] ,(err, results) => {
        if (err) {
            return res.status(400).json(err)
        }

        if (results[0].highScore >= points) {
            return res.status(200).json({msj: "Succesfuly updated", updated:true, points: points})
        } else {
            con.query('UPDATE users SET highScore = ? WHERE username = ?', [points, username] ,(err, results) => {
                if (err) {
                    return res.status(400).json(err)
                }
        
                return res.status(200).json({msj: "Succesfuly updated", updated:true, points: points, user: username})
            })


        }
    })

})

app.get('/getLeaderboard', (req, res) => {

    con.query('SELECT username, highScore FROM users ORDER BY highScore DESC;',(err, results) => {
            if (err) {
                return res.status(400).json(err)
            }


            return res.status(200).json(results)
    })
})

  

app.listen(3001, () => {
    console.log("Hola mundo")
})

module.exports = app;