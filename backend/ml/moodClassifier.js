/**
 * Mood Classifier using brain.js
 * 
 * Loads and uses a trained brain.js model for mood classification
 */

const brain = require('brain.js');
const fs = require('fs');
const path = require('path');

class MoodClassifier {
  constructor() {
    this.net = null;
    this.isLoaded = false;
    this.modelPath = path.join(__dirname, 'models', 'mood-classifier.json');
  }

  /**
   * Load the trained model
   */
  loadModel() {
    try {
      if (!fs.existsSync(this.modelPath)) {
        console.warn(`Model not found at ${this.modelPath}. Using fallback keyword matching.`);
        return false;
      }

      const modelData = JSON.parse(fs.readFileSync(this.modelPath, 'utf8'));
      this.net = new brain.recurrent.LSTM();
      this.net.fromJSON(modelData);
      this.isLoaded = true;
      console.log('Mood classifier model loaded successfully');
      return true;
    } catch (error) {
      console.error('Error loading mood classifier model:', error.message);
      return false;
    }
  }

  /**
   * Analyze mood from text using brain.js model
   */
  analyze(text) {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return { mood: 'neutral', confidence: 0 };
    }

    // Use brain.js model if loaded
    if (this.isLoaded && this.net) {
      try {
        const result = this.net.run(text.toLowerCase().trim());
        return {
          mood: result || 'neutral',
          confidence: 0.8, // brain.js doesn't provide confidence, use default
        };
      } catch (error) {
        console.error('Error running mood classifier:', error.message);
        // Fallback to keyword matching
        return this.fallbackAnalyze(text);
      }
    }

    // Fallback to keyword matching if model not loaded
    return this.fallbackAnalyze(text);
  }

  /**
   * Fallback keyword-based analysis
   */
  fallbackAnalyze(text) {
    const moodKeywords = {
      happy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'fantastic', 'love', 'loved', 'awesome', 'brilliant', 'excellent', 'thrilled', 'delighted'],
      sad: ['sad', 'depressed', 'down', 'upset', 'crying', 'tears', 'hurt', 'pain', 'lonely', 'empty', 'broken', 'miserable', 'unhappy'],
      angry: ['angry', 'mad', 'furious', 'rage', 'hate', 'annoyed', 'frustrated', 'irritated', 'pissed', 'livid', 'outraged'],
      anxious: ['anxious', 'worried', 'nervous', 'stressed', 'panic', 'fear', 'scared', 'afraid', 'tense', 'overwhelmed'],
      calm: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'content', 'satisfied', 'chill', 'at ease'],
      grateful: ['grateful', 'thankful', 'blessed', 'appreciate', 'gratitude', 'fortunate', 'lucky'],
    };

    const textLower = text.toLowerCase();
    let maxScore = 0;
    let detectedMood = 'neutral';

    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (textLower.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        detectedMood = mood;
      }
    }

    const confidence = Math.min(maxScore / 3, 1);
    return { mood: detectedMood, confidence };
  }
}

// Create singleton instance
const moodClassifier = new MoodClassifier();

// Try to load model on module load
moodClassifier.loadModel();

module.exports = moodClassifier;


