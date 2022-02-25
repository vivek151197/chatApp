const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      'mongodb+srv://vivek:vivek99@cluster0.j2mbk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    )

    console.log(`MongoDB Connected : ${conn.connection.host}`)
  } catch (error) {
    console.log(`Error:${error.message}`)
    process.exit()
  }
}

module.exports = connectDB
