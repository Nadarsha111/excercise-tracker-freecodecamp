const express = require('express')
const app = express()
const cors = require('cors')
const mongoose=require('mongoose');
const {Schema}=mongoose;
require('dotenv').config()

mongoose.connect(process.env.DB_CONNECT)

const UserSchema = new Schema({
  username:String,
})
const User =mongoose.model("User",UserSchema);

const ExerciseSchema = new Schema({
  user_id: {type:String,required:true},
  username: String,
  description: String,
  duration: Number,
  date: Date,
})

const Exercise =mongoose.model("Excercise",ExerciseSchema);

app.use(cors())
app.use(express.static('public'))
//form processing

app.use(express.json());       
app.use(express.urlencoded({extended: true})); 


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



app.route('/api/users')
.post(async(req,res)=>{
  const userObj = new User({
    username : req.body.username,
  })
try {
  const user =await userObj.save();
  res.json(user)
} catch (error) {
  console.log(error)
}
})
.get(async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).send(error);
  }
});


app.post('/api/users/:_id/exercises', async (req, res) => {
  const id = req.params._id;
  const { description, duration, date = new Date() } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send("The user id doesn't exist");
    } else {
      const exerciseObj = new Exercise({
        user_id: user._id,
        username: user.username,
        description,
        duration,
        date: date ? new Date(date).toDateString() : new Date().toDateString()
      });
      const exercise = await exerciseObj.save();
      
      const response = {
        _id: exercise.user_id,
        username: exercise.username, 
        description: exercise.description,
        duration: exercise.duration,
        date: new Date(exercise.date).toDateString()
      };
      res.json(response);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("There was an error while saving");
  }
});




///logs
app.get('/api/users/:_id/logs', async (req, res) => {
  const id = req.params._id;
  const { from, to, limit } = req.query;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send("The user id doesn't exist");
    } else {
      let logs = await Exercise.find({ user_id: id });

      // Map exercises to logs with formatted date
      logs = logs.map((exercise) => ({
        description: exercise.description,
        duration: exercise.duration,
        date: new Date(exercise.date).toDateString(),
      }));

      // Filter logs by date if from and/or to parameters are provided
      if (from || to) {
        logs = logs.filter((log) => {
          const itemDate = new Date(log.date);
          return (!from || itemDate >= new Date(from)) &&
                 (!to || itemDate <= new Date(to));
        });
      }

      // Apply limit if provided
      if (limit) {
        logs = logs.slice(0, limit);
      }

      res.json({
        username: user.username,
        count: logs.length,
        _id: user._id,
        log: logs,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});






const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
