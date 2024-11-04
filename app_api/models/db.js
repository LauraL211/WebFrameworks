const mongoose = require('mongoose');
const dbURI = "mongodb+srv://lollylooney:Gads1858@cluster0.2sjgu.mongodb.net/Loc8r?retryWrites=true&w=majority&appName=Cluster0";

try {
   
mongoose.connect(
    dbURI,
    { useNewUrlParser: true, useUnifiedTopology: true }).then(
    () => {console.log(" Mongoose is connected")},
	err=> {console.log(err)}
	);
}
 catch (e) {
  console.log("could not connect");
 }
require('./locations');

