const mongoose = require('mongoose');

const connectToMongo = () => {
    mongoose.connect('mongodb+srv://rinkusha082:ran54321@cluster0.mdw9uz4.mongodb.net/NoteSite?retryWrites=true&w=majority')
        .then(console.log("Connected to Mongo")).
        catch(error => console.log(error));
}

module.exports = connectToMongo;