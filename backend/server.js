const express = require("express");
const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
const mongoose = require("mongoose"); // Assuming you're using Mongoose for MongoDB

const app = express();
const port = 3000;

// MongoDB connection string
const mongoURI = "mongodb://localhost:27017/your_database";

// Connect to MongoDB
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define a Mongoose schema for your sensor data
const SensorDataSchema = new mongoose.Schema({
  weight: Number,
  height: Number,
  timestamp: { type: Date, default: Date.now },
});

// Create a Mongoose model
const SensorData = mongoose.model("SensorData", SensorDataSchema);

// Set up serial communication with Arduino
const arduinoPort = new SerialPort("COM3", { baudRate: 9600 });
const parser = arduinoPort.pipe(new Readline({ delimiter: "\r\n" }));

// Log and parse data from Arduino
parser.on("data", (data) => {
  console.log("Received from Arduino:", data);

  const weightMatch = data.match(/Weight: ([\d.]+)/);
  const heightMatch = data.match(/Height: ([\d.]+)/);

  if (weightMatch && heightMatch) {
    const weight = parseFloat(weightMatch[1]);
    const height = parseFloat(heightMatch[1]);

    // Log the parsed data
    console.log("Parsed Weight:", weight, "kg");
    console.log("Parsed Height:", height, "cm");

    // Save data to MongoDB
    const newSensorData = new SensorData({ weight, height });
    newSensorData
      .save()
      .then(() => console.log("Sensor data saved to MongoDB"))
      .catch((err) => console.error("Error saving sensor data:", err));
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
