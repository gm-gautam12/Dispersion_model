import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';

const App = () => {
  const [formData, setFormData] = useState({
    releaseAmount: 1,
    windVelocity: 5,
    releaseHeight: 3,
    stabilityClass: 'D'
  });
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/simulate', formData);
      setResults(response.data);
    } catch (err) {
      setError('Error running simulation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dispersion Model Simulator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Input Parameters</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Release Amount (kg/s)
                <input
                  type="number"
                  name="releaseAmount"
                  value={formData.releaseAmount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  required
                  className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                />
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Wind Velocity (m/s)
                <input
                  type="number"
                  name="windVelocity"
                  value={formData.windVelocity}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  required
                  className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                />
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Release Height (m)
                <input
                  type="number"
                  name="releaseHeight"
                  value={formData.releaseHeight}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  required
                  className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                />
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Stability Class
                <select
                  name="stabilityClass"
                  value={formData.stabilityClass}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                >
                  <option value="A">A - Very Unstable</option>
                  <option value="B">B - Unstable</option>
                  <option value="C">C - Slightly Unstable</option>
                  <option value="D">D - Neutral</option>
                  <option value="E">E - Stable</option>
                  <option value="F">F - Very Stable</option>
                </select>
              </label>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Running Simulation...' : 'Run Simulation'}
            </button>
          </form>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          
          {results && (
            <div className="space-y-7">
              <div className="h-64">
                <LineChart
                  width={500}
                  height={250}
                  data={results.results}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="distance" 
                    label={{ 
                      value: 'Distance (m)', 
                      position: 'insideBottom', 
                      offset: -5 
                    }} 
                  />
                  <YAxis
                    label={{
                      value: 'Concentration (kg/m³)',
                      angle: -90,
                      position: 'insideLeft',
                      offset: -10 
                    }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="concentration"
                    stroke="#2563eb"
                    name="Concentration"
                  />
                </LineChart>
              </div>
              
              <div className="mt-5">
                <h3 className="font-semibold mb-2">Numerical Results</h3>
                <div className="max-h-48 overflow-y-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2">Distance (m)</th>
                        <th className="px-4 py-2">Concentration (kg/m³)</th>
                        <th className="px-4 py-2">Time (s)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.results.map((result, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2">{result.distance.toFixed(1)}</td>
                          <td className="px-4 py-2">{result.concentration.toExponential(3)}</td>
                          <td className="px-4 py-2">{result.time.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {!results && !loading && (
            <div className="text-gray-500 text-center">
              Run a simulation to see results
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;

