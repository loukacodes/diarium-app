/**
 * Hybrid Mood Classifier
 * 
 * Tries Transformers.js first (on-device), falls back to Natural classifier,
 * and finally to keyword matching if both fail.
 */

const naturalClassifier = require('./moodClassifier');

class HybridMoodClassifier {
  constructor() {
    this.transformersClassifier = null;
    this.transformersAvailable = false;
    this.transformersTried = false;
  }

  async loadTransformers() {
    if (this.transformersTried) {
      return this.transformersAvailable;
    }

    this.transformersTried = true;
    try {
      // Try to load Transformers.js
      this.transformersClassifier = require('./transformersClassifier');
      this.transformersAvailable = true;
      console.log('✅ Transformers.js available - will use for mood detection');
      return true;
    } catch (error) {
      console.log('⚠️  Transformers.js not available, using Natural classifier:', error.message);
      this.transformersAvailable = false;
      return false;
    }
  }

  async analyze(text) {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return {
        mood: 'neutral',
        confidence: 0,
        moods: [{ mood: 'neutral', confidence: 0 }],
      };
    }

    // Try Transformers.js first (on-device, works offline)
    const transformersLoaded = await this.loadTransformers();
    if (transformersLoaded && this.transformersClassifier) {
      try {
        const result = await this.transformersClassifier.analyze(text);
        // Only use if we got a valid result with good confidence
        // Transformers.js returns neutral with 0.5 confidence on error, so check for real results
        if (result && result.mood && result.confidence > 0.6) {
          return result;
        }
        // If confidence is low, it might be an error - fall through to Natural
        if (result && result.mood && result.mood !== 'neutral') {
          return result; // Non-neutral moods are probably valid even with lower confidence
        }
      } catch (error) {
        console.log('Transformers.js failed, falling back to Natural:', error.message);
      }
    }

    // Fallback to Natural classifier (always works, offline)
    try {
      const result = naturalClassifier.analyze(text);
      // Natural's analyze is sync, but we return it as a promise for consistency
      return Promise.resolve(result);
    } catch (error) {
      console.error('Natural classifier failed:', error.message);
      // Final fallback - return neutral
      return {
        mood: 'neutral',
        confidence: 0.5,
        moods: [{ mood: 'neutral', confidence: 0.5 }],
      };
    }
  }
}

// Create singleton instance
const hybridClassifier = new HybridMoodClassifier();

module.exports = hybridClassifier;

