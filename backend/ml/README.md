# Local Mood Classification Model using Natural (NLP library)

This directory contains the implementation for training and running a local mood classification model using Natural, an actively maintained NLP library for Node.js.

## Overview

The mood classifier uses Natural's BayesClassifier, which is specifically designed for text classification tasks. It provides better accuracy than simple keyword matching while remaining fast, lightweight, and privacy-preserving.

## Setup

1. Install dependencies:
   ```bash
   npm install natural
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
- Uses Natural's BayesClassifier (Naive Bayes algorithm)
- Trains on labeled text examples
- Saves model to JSON file for reuse

### Classification (`moodClassifier.js`)
- Loads trained model on server startup
- Analyzes text and returns mood classification with confidence score
- Falls back to keyword matching if model not found

### Usage in Server (`server.js`)
- The `/api/analyze-mood` endpoint uses the classifier
- Automatically uses Natural classifier if available
- Falls back to keyword matching if model not loaded

## Training Data

The training data in `train-model.js` includes examples for 7 main emotions (based on hierarchical emotion model):
- **Happy** - Optimistic, Trusting, Peaceful, Powerful, Accepted, Proud, Excited, Playful
- **Sad** - Lonely, Vulnerable, Despair, Guilty, Depressed, Hurt
- **Angry** - Let down, Humiliated, Bitter, Mad, Aggressive, Frustrated, Distant, Critical
- **Fearful** - Scared, Anxious, Insecure, Weak, Rejected, Threatened
- **Bad** - Bored, Busy, Stressed, Tired
- **Surprised** - Startled, Confused, Amazed, Excited
- **Disgusted** - Disapproving, Disappointed, Awful, Repelled

**To improve accuracy:**
- Add more training examples (aim for 50+ per mood)
- Include varied phrasings and contexts
- Add examples with negations ("not happy", "not sad")
- Include mixed emotions if needed

## Model Performance

- **Accuracy**: Better than keyword matching, especially for nuanced text
- **Speed**: Fast inference (< 10ms per prediction)
- **Size**: Model file is typically < 500KB
- **Privacy**: Runs entirely locally, no data sent to external APIs
- **Library**: Natural is actively maintained and widely used

## Improving the Model

1. **Add more training data**: More examples = better accuracy
2. **Retrain regularly**: As you collect more real user data, retrain the model
3. **Fine-tune**: Use actual diary entries (with user permission) to improve accuracy
4. **Experiment with tokenization**: Natural supports different tokenizers and stemmers

## Files

- `train-model.js` - Script to train the mood classifier
- `moodClassifier.js` - Classifier service that loads and uses the model
- `models/mood-classifier.json` - Trained model (generated after training)
- `README.md` - This file

## Why Natural?

Natural is chosen over brain.js because:
- ✅ Actively maintained (regular updates)
- ✅ Specifically designed for NLP/text classification
- ✅ Lightweight with no native dependencies
- ✅ Provides confidence scores
- ✅ Well-documented and widely used
- ✅ No build issues (pure JavaScript)
