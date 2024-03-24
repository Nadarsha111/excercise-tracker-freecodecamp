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
  _id: {type:String,required:true},
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

app.post('/api/users',async(req,res)=>{
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

app.post('/api/users/:_id/exercises',async(req,res)=>{
  const id=req.params._id;
    const {description,duration,date}=req.body;

  try {
    const user =await User.findById(id);
    console.log("Found User",user);
    if(!user){
      res.send("The user id doesn't exist")
    }
    else{
      const excerciseObj = new Exercise({

      user_id:user._id,
      username:user.username,
      description,
      duration,
      date
      })
      const excercise=await excerciseObj.save();
      res.json({
        _id:user_id,
        username:user.username,
        duration:excercise.duration,
        description:excercise.description

      })
    }

  } catch (error) {
    console.error(error)
    res.send("Their Was an Error While Saving")
  }

})






const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
