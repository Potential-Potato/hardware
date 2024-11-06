//for weight sensor
#include "HX711.h"

const int LOADCELL_DOUT_PIN = 4;
const int LOADCELL_SCK_PIN = 5;

HX711 scale;

float calibration_factor = 12350; // Start with this value for kilograms

// push button
const int buttonPin = 2;  // the number of the pushbutton pin
const int ledPin = 3;    // the number of the LED pin

// variables will change:
int buttonState = 0;  // variable for reading the pushbutton status

// height sensor
// Pin definitions for ultrasonic sensor
const int trigPin = 6; // Trig pin of HC-SR04 to D4 on Arduino Nano
const int echoPin = 7; // Echo pin of HC-SR04 to D5 on Arduino Nano
// Variables for duration and distance
long duration;
float distanceToGround; // Distance measured by the sensor
float height;           // Person's height

const float sensorHeight = 200.0; // Height of sensor in cm (example: 200 cm = 6'6")

void setup() {

  pinMode(ledPin, OUTPUT);
  pinMode(buttonPin, INPUT);
  //weight sensor
  Serial.begin(9600);
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale(calibration_factor); // Set the initial calibration factor
  scale.tare(); // Zero the scale (tare)

  Serial.println("Calibration process: Place a known weight on the scale.");

  //height sensor
  // Configure the ultrasonic sensor pins
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  // Show a message on the Serial Monitor
  Serial.println("Ultrasonic Height Measurement");
  Serial.println("Sensor mounted at 200 cm.");
}

void loop() {
  // read the state of the pushbutton value:
  buttonState = digitalRead(buttonPin);

  // check if the pushbutton is pressed. If it is, the buttonState is HIGH:
  if (buttonState == HIGH) {
    // turn LED on:
    digitalWrite(ledPin, HIGH);
    Serial.print("Weight: ");
    Serial.print(scale.get_units(), 2); // Get the weight in kilograms
    Serial.println(" kg");
    delay(500);

       // turn LED off:
    digitalWrite(ledPin, LOW);
    // Trigger the ultrasonic sensor by sending a 10us HIGH pulse on the Trig pin
    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);

    // Read the echo pin, which gives us the time in microseconds
    duration = pulseIn(echoPin, HIGH);

    // Calculate the distance to the ground in cm
    // Speed of sound in air = 343 m/s (or 0.0343 cm/us)
    distanceToGround = (duration * 0.0343) / 2;

    // Calculate the height of the person/object by subtracting distance to the ground
    height = sensorHeight - distanceToGround;

    // Convert height in cm to feet and inches
    float heightInInches = height / 2.54; // 1 inch = 2.54 cm
    int feet = int(heightInInches) / 12;  // 12 inches in a foot
    int inches = int(heightInInches) % 12; // Remainder gives the inches

    // Display the results in cm, feet, and inches
    Serial.print("Height of person: ");
    Serial.print(height, 1); // Height in cm
    Serial.print(" cm (");
    Serial.print(feet);
    Serial.print(" feet ");
    Serial.print(inches);
    Serial.println(" inches)");

    // Wait a bit before measuring again
    delay(1000);
  } else {
    Serial.println("This is running!");
     delay(1000);
  }
}
