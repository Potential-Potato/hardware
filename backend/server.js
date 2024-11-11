require("dotenv").config();
const express = require("express");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const mongoose = require("mongoose");

const bmi = require("./model/bmi");
const app = express();
const port = 3000;

mongoose.connect(process.env.MONGO_URL, () => {
  console.log("connected to db");
});

// Set up serial communication with Arduino
const arduinoPort = new SerialPort({ path: "COM4", baudRate: 9600 });
const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: "\r\n" }));

let weights = [];
let heights = [];

// Log and parse data from Arduino
parser.on("data", async (data) => {
  console.log("Received from Arduino:", data);

  const weightMatch = data.match(/Weight: ([\d.]+)/);
  const heightMatch = data.match(/Height of person: ([\d.]+)/);

  if (weightMatch) {
    const weight = parseFloat(weightMatch[1]);
    weights.push(weight);
  }
  if (heightMatch) {
    const height = parseFloat(heightMatch[1]);
    heights.push(height);
  }

  // Calculate and print average when 3 sets of data are received
  if (weights.length === 3 && heights.length === 3) {
    const averageWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
    const averageHeight = heights.reduce((a, b) => a + b, 0) / heights.length;

    // Format to 2 decimal places
    const formattedAverageWeight = averageWeight.toFixed(2);
    const formattedAverageHeight = averageHeight.toFixed(2);

    console.log("Average Weight:", formattedAverageWeight, "kg");
    console.log("Average Height:", formattedAverageHeight, "cm");
    // Create and save a new document
    try {
      const bmiRecord = new bmi({
        weight: formattedAverageWeight,
        height: formattedAverageHeight,
      });
      await bmiRecord.save();
      console.log("Average data saved to MongoDB:", bmiRecord);
    } catch (error) {
      console.error("Error saving data to MongoDB:", error);
    }

    // Reset arrays for the next set of data
    weights = [];
    heights = [];
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
