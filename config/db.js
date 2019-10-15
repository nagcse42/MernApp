const mongoose = require('mongoose');
const config = require('config');

const dbConfig = config.get('mongoURI');

const connectDB = async () => {
    try {
        await mongoose.connect(dbConfig, {
            useNewUrlParser : true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        console.log('Mongo DB Connected successfully....');
    } catch (error) {
        console.log('Connection failure: '+error);
        console.error(error.messsage);
        // Exit process with failure
        process.exit(1);
    }
}

module.exports = connectDB;