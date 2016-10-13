var exec = require('child_process').exec;
// get package name from cmd (IMPLEMENTAR AINDA!!!!!!!!!!)
var pckg = 'jquery';
// get package's .js files destination (PEGAR DINAMICAMENTE!!!!!!!!!)
var fileSrc = '.\\node_modules\\'+pckg+'\\dist\\';

function downloadPackage() {
  var cmd = 'npm install '+pckg;
// execute 'cmd' command to install package by npm
  function callback(error, stdout, stderr) {
    console.log(stdout);
    var fileMinified = pckg+'.min.js';
    extractJSFile(fileSrc, fileMinified);
  }
  exec(cmd, callback);
}

function extractJSFile(fileSrc, fileMinified) {
  var cmd = 'move '+fileSrc+fileMinified+' .\\src';
  // execute 'cmd' command and moves wanted .js file to a ./dist/packageName directory
  function callback(error, stdout, stderr) {
    console.log(stdout);
    uninstallPackage();
  }
  exec(cmd, callback);
}

function uninstallPackage() {
  var cmd = 'npm uninstall '+pckg;
  // execute 'cmd' command to uninstall package by npm
  function callback(error, stdout, stderr) {
    console.log(stdout);
  }
  exec(cmd, callback);
}

downloadPackage();

// download and write the .tgz file to extract src code
// function getPackageSrcCode(packageUrl) {
//   var output = pckg+".tgz";
//
//   request({url: packageUrl, encoding: null}, function (error, response, body) {
//     if (!error && response.statusCode == 200) {
//       fs.writeFile(output, body, function(err) {
//         console.log("package "+pckg+".tgz downloaded!");
//         extractTarball(output);
//       });
//     }
//     else
//       console.log(error);
//   });
// }

// function extractTarball(packageName) {
//   var dist = './dist/'+pckg;
//
//   targz().extract('./'+packageName, dist, function(err) {
//     if(err)
//       console.log(err.stack);
//     else
//       console.log('package '+pckg+'.tgz extracted to '+dist);
//   });
// }
