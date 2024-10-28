import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());


mongoose.connect('mongodb+srv://njoygautam12:Gautam3112@cluster0.pkqeo.mongodb.net').then( ()=> {
  console.log("Connection to MongoDB Successfull");
}).catch((err)=>{
  console.log(err);
})

const simulationSchema = new mongoose.Schema({
  releaseAmount: Number,
  windVelocity: Number,
  releaseHeight: Number,
  stabilityClass: String,
  datetime: { type: Date, default: Date.now },
  results: [{
    distance: Number,
    concentration: Number,
    time: Number
  }]
});

const Simulation = mongoose.model('Simulation', simulationSchema);

const calculateConcentration = (Q, u, H, x, y, z, stabilityClass) => {

  const stabilityParams = {
    'A': { a: 0.527, b: 0.865, c: 0.28, d: 0.90 },
    'B': { a: 0.371, b: 0.866, c: 0.23, d: 0.85 },
    'C': { a: 0.209, b: 0.897, c: 0.22, d: 0.80 },
    'D': { a: 0.128, b: 0.905, c: 0.20, d: 0.76 },
    'E': { a: 0.098, b: 0.902, c: 0.15, d: 0.73 },
    'F': { a: 0.065, b: 0.902, c: 0.12, d: 0.67 }
  };

  const params = stabilityParams[stabilityClass];
  
  const sigmaY = params.a * Math.pow(x, params.b);
  const sigmaZ = params.c * Math.pow(x, params.d);

  return (Q / (2 * Math.PI * u * sigmaY * sigmaZ)) *
    Math.exp(-0.5 * Math.pow(y / sigmaY, 2)) *
    (Math.exp(-0.5 * Math.pow((z - H) / sigmaZ, 2)) +
     Math.exp(-0.5 * Math.pow((z + H) / sigmaZ, 2)));
};

app.post('/api/simulate', async (req, res) => {
  try {
    const { releaseAmount, windVelocity, releaseHeight, stabilityClass } = req.body;
    
    const distances = Array.from({ length: 20 }, (_, i) => (i + 1) * 100); 
    const results = distances.map(distance => ({
      distance,
      concentration: calculateConcentration(
        releaseAmount,
        windVelocity,
        releaseHeight,
        distance,
        0, 
        1.5, 
        stabilityClass
      ),
      time: distance / windVelocity 
    }));

    
    const simulation = new Simulation({
      releaseAmount,
      windVelocity,
      releaseHeight,
      stabilityClass,
      results
    });
    await simulation.save();

    res.json(simulation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/simulations', async (req, res) => {
  try {
    const simulations = await Simulation.find().sort('-datetime').limit(10);
    res.json(simulations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
