var fs = require('fs');
var path = require('path');
var esprima = require('esprima');

const args = process.argv;

var dirName = args[2];

var id = args[3];

var nomeBiblioteca = args[4];

if(fs.existsSync(dirName)){
    if(fs.existsSync(".\\log analyzer.txt"))
        fs.writeFileSync(".\\log analyzer.txt", fs.readFileSync(".\\log analyzer.txt") + "\n\nAnalyze for " + nomeBiblioteca + " began!");
    else
        fs.writeFileSync(".\\log analyzer.txt", "Analyze for " + nomeBiblioteca + " began!");

    console.log("Analyze for " + nomeBiblioteca + " began!");
    readDirectory(dirName);
}


else {
    if(fs.existsSync(".\\log analyzer.txt"))
        fs.writeFileSync(".\\log analyzer.txt", fs.readFileSync(".\\log analyzer.txt") + "Pasta " + dirName + " nao existe");
    else
        fs.writeFileSync(".\\log analyzer.txt", "Pasta " + dirName + " nao existe");

    console.log("Pasta " + dirName + " nao existe")
}


function readDirectory(dirName) {
    var files = fs.readdirSync(dirName);
    
    readFiles(dirName, files);
}

function readFiles(dirName, files) {
    files.map(function(file) {
        return path.join(dirName, file);
    }).forEach(function(file) {
        var stats = fs.statSync(file);
        if(stats.isDirectory()) {
            readDirectory(file.toString());
        }

        else {
            fs.readFile(file, function(err, logData) {

                if (err)
                    throw err;
            
                var text = logData.toString();

                fs.writeFileSync(".\\log analyzer.txt", fs.readFileSync(".\\log analyzer.txt") + "\nAnalyzing file " +  getFile(file.toString(), "\\", file.toString().match(/\\/gi).length));
                console.log("Analyzing file " +  getFile(file.toString(), "\\", file.toString().match(/\\/gi).length));

                esprimaParse(text, file);
            });
        }
      });
}

function esprimaParse(text, file) {
    
    try
    {
        var syntax = esprima.parse(text, {
            tolerant: true,
            loc: true,
            tokens: true
        });
    }

    catch(err)
    {
        if(fs.existsSync(".\\results\\arquvivos com erro.txt"))
        {
            var texto = fs.readFileSync(".\\results\\arquvivos com erro.txt");

             fs.writeFile(".\\results\\arquvivos com erro.txt", texto + "\n" + file.toString() + " erro: " + err, function(err) {
                if(err) {
                    return console.log(err);
                }
            });
        }

        else {
            fs.writeFile(".\\results\\arquvivos com erro.txt", file.toString() + " erro: " + err, function(err) {
                if(err) {
                    return console.log(err);
                }
            });
        }

        return;
    }
}

function getFile(s, c, n) {
  var idx;
  var i = n;
  var newS = '';
  do {
    idx = s.indexOf(c);
    newS = s.substring(idx + 1);
    s = s.substring(s.indexOf(c) + 1);
    i--;
  } while (i > 0)
  return newS;
}

