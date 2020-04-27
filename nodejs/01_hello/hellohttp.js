http = require('http');
url = require('url');
fs = require('fs')

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type' : 'text/html'});

    // Récupération des paramètres passés (?year=2019&month=February)
    var q = url.parse(req.url, true).query
    var dates = q.month;


    // Récupération de la page demandée (chemin absolu hors site)
    // http://localhost:8080/index => /index
    var page = req.url
    console.log('Incoming request : ' + req.url);
    res.write('Hello World !');

    // Permet de lire un fichier à partir de la racine du serveur
    fs.readFile('index.html', function(err, data) {
        if(err) {
            res.writeHead(404, {'Content-Type' : 'text/html');
            return res.end('404 Not Found');
        }
        // renvoie le contenu du fichier dans la réponse
        res.write(data);
    });

    res.end();


}).listen(8090);

// Affichage d'un log dans la console 
// Ca montre également que la fonction listen n'est pas bloquante
console.log('Server listening on port 8080...');
