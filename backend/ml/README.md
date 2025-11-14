# Local Mood Classification Model using brain.js

This directory contains the implementation for training and running a local mood classification model using brain.js.

## Overview

The mood classifier uses brain.js, a lightweight neural network library that runs entirely in Node.js. It provides better accuracy than simple keyword matching while remaining fast and privacy-preserving.

## Setup

1. Install dependencies:
   ```bash
   npm install brain.js
   ```

2. Train the model:
   ```bash
   cd backend/ml
   node train-model.js
   ```

   This will create a trained model at `backend/ml/models/mood-classifier.json`

3. The model is automatically loaded when the server starts (see `moodClassifier.js`)

## How It Works

### Training (`train-model.js`)
- Uses brain.js LSTM (Long Short-Term Memory) network
- Trains on labeled text examples
- Saves model to JSON file for reuse

### Classification (`moodClassifier.js`)
- Loads trained model on server startup
- Analyzes text and returns mood classification
- Falls back to keyword matching if model not found

### Usage in Server (`server.js`)
- The `/api/analyze-mood` endpoint uses the classifier
- Automatically uses brain.js model if available
- Falls back to keyword matching if model not loaded

## Training Data

The training data in `train-model.js` includes examples for:
- Happy
- Sad
- Anxious
- Calm
- Grateful
- Angry

**To improve accuracy:**
- Add more training examples (aim for 50+ per mood)
- Include varied phrasings and contexts
- Add examples with negations ("not happy", "not sad")
- Include mixed emotions if needed

## Model Performance

- **Accuracy**: Better than keyword matching, especially for nuanced text
- **Speed**: Fast inference (< 10ms per prediction)
- **Size**: Model file is typically < 1MB
- **Privacy**: Runs entirely locally, no data sent to external APIs

## Improving the Model

1. **Add more training data**: More examples = better accuracy
2. **Adjust hyperparameters**: Modify `hiddenLayers`, `iterations`, `learningRate` in `train-model.js`
3. **Retrain regularly**: As you collect more real user data, retrain the model
4. **Fine-tune**: Use actual diary entries (with user permission) to improve accuracy

## Files

- `train-model.js` - Script to train the mood classifier
- `moodClassifier.js` - Classifier service that loads and uses the model
- `models/mood-classifier.json` - Trained model (generated after training)
- `README.md` - This file

