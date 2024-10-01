import React, { useRef, useState, useEffect } from "react";
import rock from './rock.png';  // Import images for gestures
import paper from './paper.png';
import victory from './scissors.png';
import './App.css';  // Import custom CSS

import * as tf from "@tensorflow/tfjs";  // Import TensorFlow.js
import * as handpose from "@tensorflow-models/handpose";  // Import handpose model for hand detection
import Webcam from "react-webcam";  // Webcam component for video feed
import { drawHand } from "./utilities";  // Function

import * as fp from "fingerpose";  // Import Fingerpose library for gesture recognition

function App() {
  // Create references for webcam and canvas
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // State hook to store recognized emoji (gesture)
  const [emoji, setEmoji] = useState(null);

  // Map gestures to their corresponding images
  const images = { victory: victory, paper: paper, rock: rock };

  // Load the handpose model and set up detection loop
  const runHandpose = async () => {
    const net = await handpose.load();  // Load the handpose model
    console.log("Handpose model loaded.");

    // Run detection every 10 milliseconds
    setInterval(() => {
      detect(net);
    }, 10);
  };

  // Function to detect hand gestures
  const detect = async (net) => {
    // Ensure webcam video is ready
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get video properties
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // Set video width and height
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas width and height
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Detect hand in the video frame
      const hand = await net.estimateHands(video);

      // Gesture recognition using Fingerpose
      if (hand.length > 0) {
        // Define gestures (rock, paper, victory)
        const fistGesture = new fp.GestureDescription('rock');
        fistGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.FullCurl, 1.0);
        fistGesture.addCurl(fp.Finger.Index, fp.FingerCurl.FullCurl, 1.0);
        fistGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.FullCurl, 1.0);
        fistGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 1.0);
        fistGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.FullCurl, 1.0);

        const openHandGesture = new fp.GestureDescription('paper');
        openHandGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
        openHandGesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
        openHandGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.NoCurl, 1.0);
        openHandGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.NoCurl, 1.0);
        openHandGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.NoCurl, 1.0);

        const GE = new fp.GestureEstimator([
          fp.Gestures.VictoryGesture,
          openHandGesture,
          fistGesture
        ]);

        // Estimate the gesture
        const gesture = await GE.estimate(hand[0].landmarks, 4);
        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          // Get the gesture with the highest confidence
          const confidence = gesture.gestures.map((prediction) => prediction.score);
          const maxConfidence = confidence.indexOf(Math.max(...confidence));

          // Set the emoji to the recognized gesture
          setEmoji(gesture.gestures[maxConfidence].name);
        }
      }

      // Draw the detected hand on the canvas
      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx);
    }
  };

  // Run handpose model when the component mounts
  useEffect(() => { runHandpose(); }, []);

  // Timer state and logic
  const [countdownTime, setCountdownTime] = useState(3);  // Countdown time (in seconds)
  const [timerId, setTimerId] = useState(null);  // To store the timer ID

  // Start the countdown timer
  const handleStartCountdown = () => {
    const timerId = setInterval(() => {
      setCountdownTime((prevTime) => prevTime - 1);  // Decrease time by 1 second
    }, 1000);  // Run the interval every second

    // Save the timer ID so it can be cleared later
    setTimerId(timerId);
  };

  // Effect to handle the end of the countdown
  useEffect(() => {
    if (countdownTime === 0) {
      clearInterval(timerId);  // Clear the countdown timer
      const finalChoice = emoji.toString();  // Get the final gesture

      setCountdownTime(3);  // Reset the countdown

      setPlayerChoice(finalChoice);  // Set the player's choice

      // Randomly choose for the computer
      const computerOption = gameOptions[Math.floor(Math.random() * gameOptions.length)].name;
      setComputerChoice(computerOption);

      // Determine the winner
      if (finalChoice === computerOption) {
        setWinner("It's a tie!");
      } else if (
        (finalChoice === 'rock' && computerOption === 'scissors') ||
        (finalChoice === 'paper' && computerOption === 'rock') ||
        (finalChoice === 'victory' && computerOption === 'paper')
      ) {
        setWinner('You win!');
      } else {
        setWinner('Computer wins!');
      }
    }
  }, [countdownTime, timerId]);  // Dependencies for the effect

  // Define the game options
  const gameOptions = [
    { name: 'rock', image: rock },
    { name: 'paper', image: paper },
    { name: 'victory', image: victory },
  ];

  // State for player's choice, computer's choice, and the winner
  const [playerChoice, setPlayerChoice] = useState('');
  const [computerChoice, setComputerChoice] = useState('');
  const [winner, setWinner] = useState('');

  return (
    <div className="App">
      <header className="App-header">
        <h1 style={{ marginBottom: "10px", color: "black" }}>Show your hand to your webcam!</h1>

        {/* Webcam and canvas container */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          position: "relative",
          width: "100%",
          maxWidth: 640,
          marginTop: "10px",
        }}>
          {/* Webcam feed */}
          <Webcam
            ref={webcamRef}
            style={{
              position: "relative",
              width: 640,
              height: 480,
              zIndex: 9,
            }}
          />

          {/* Canvas for drawing */}
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              width: 640,
              height: 480,
              zIndex: 10,
            }}
          />
        </div>

        {/* Display the detected gesture */}
        {emoji && (
          <div>
            <p style={{ color: "black" }}>Current detected state:</p>
            <img src={images[emoji]} alt={emoji} style={{ width: '100px', height: '100px' }} />
          </div>
        )}

        {/* Countdown timer */}
        <div style={{ marginTop: "5px", textAlign: "center" }}>
          <p style={{ color: "black" }}>Make your choice:</p>
          <button onClick={handleStartCountdown} style={{ width: "300px", height: "100px", fontSize: "24px" }}>Start Countdown</button>
          <p style={{ color: "black" }}>Countdown: {countdownTime} seconds</p>
        </div>

        {/* Display player's and computer's choices */}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          {playerChoice && (
            <div style={{ margin: '10px', textAlign: 'center' }}>
              <p>You chose:</p>
              <img src={gameOptions.find((option) => option.name === playerChoice).image} alt={playerChoice} style={{ width: '100px', height: '100px' }} />
            </div>
          )}

          {computerChoice && (
            <div style={{ margin: '10px', textAlign: 'center' }}>
              <p>Computer chose:</p>
              <img src={gameOptions.find((option) => option.name === computerChoice).image} alt={computerChoice} style={{ width: '100px', height: '100px' }} />
            </div>
          )}
        </div>

        {/* Display the result */}
        <p>{winner}</p>
      </header>
    </div>
  );
}

export default App;
