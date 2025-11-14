/**
 * Mood Classifier using Natural (NLP library)
 * 
 * Loads and uses a trained Natural BayesClassifier for mood classification
 */

const natural = require('natural');
const fs = require('fs');
const path = require('path');

class MoodClassifier {
  constructor() {
    this.classifier = null;
    this.isLoaded = false;
    this.isLoading = false;
    this.modelPath = path.join(__dirname, 'models', 'mood-classifier.json');
  }

  /**
   * Load the trained model (async, lazy loading)
   */
  loadModel(callback) {
    if (this.isLoaded) {
      if (callback) callback(null, true);
      return;
    }

    if (this.isLoading) {
      // Wait for ongoing load
      setTimeout(() => this.loadModel(callback), 100);
      return;
    }

    try {
      if (!fs.existsSync(this.modelPath)) {
        console.warn(`Model not found at ${this.modelPath}. Using fallback keyword matching.`);
        if (callback) callback(null, false);
        return;
      }

      this.isLoading = true;
      natural.BayesClassifier.load(this.modelPath, null, (err, classifier) => {
        this.isLoading = false;
        if (err) {
          console.error('Error loading mood classifier model:', err.message);
          if (callback) callback(err, false);
          return;
        }
        this.classifier = classifier;
        this.isLoaded = true;
        console.log('Mood classifier model loaded successfully');
        if (callback) callback(null, true);
      });
    } catch (error) {
      this.isLoading = false;
      console.warn('Could not load model, using fallback:', error.message);
      if (callback) callback(error, false);
    }
  }

  /**
   * Analyze mood from text using Natural BayesClassifier
   * Returns top 3 moods with confidence scores
   */
  analyze(text) {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return {
        mood: 'neutral',
        confidence: 0,
        moods: [{ mood: 'neutral', confidence: 0 }],
      };
    }

    // Try to use Natural classifier if loaded
    if (this.isLoaded && this.classifier) {
      try {
        const classification = this.classifier.classify(text.toLowerCase().trim());
        const classifications = this.classifier.getClassifications(text.toLowerCase().trim());

        // Sort by confidence and get top 3
        const allClassifications = classifications.sort((a, b) => b.value - a.value);
        
        // Check if model is uncertain (all probabilities are essentially zero or very similar)
        const topValue = allClassifications[0]?.value || 0;
        const secondValue = allClassifications[1]?.value || 0;
        const valueRange = Math.abs(topValue - allClassifications[allClassifications.length - 1]?.value || 0);
        
        // If model is very uncertain (all values are zero or very close), use fallback
        if (Math.abs(topValue) < 0.001 || valueRange < 0.001) {
          console.log('Model uncertain, using keyword fallback');
          return this.fallbackAnalyze(text);
        }
        
        // Normalize confidence scores to make them more interpretable
        // Natural returns log probabilities which are very small, so we normalize them
        const temperature = 0.5; // Lower temperature = sharper distribution
        
        // Convert to probabilities using softmax with temperature
        const probabilities = allClassifications.map(c => ({
          mood: c.label,
          prob: Math.exp((c.value - topValue) / temperature)
        }));
        
        // Normalize to sum to 1
        const totalProb = probabilities.reduce((sum, p) => sum + p.prob, 0);
        
        // Get top 3 with normalized probabilities
        const normalizedClassifications = probabilities
          .slice(0, 3)
          .map(p => {
            const normalized = p.prob / totalProb;
            // Boost top confidence if it's clearly the winner
            const confidence = normalized > 0.4 
              ? Math.min(0.95, normalized * 1.2) // Boost clear winners
              : normalized;
            return {
              mood: p.mood,
              confidence: Math.min(Math.max(confidence, 0), 1)
            };
          });

        // Get confidence from the top classification
        const topClassification = normalizedClassifications[0];
        const confidence = topClassification ? topClassification.confidence : 0.5;

        return {
          mood: classification || 'neutral',
          confidence: confidence,
          moods: normalizedClassifications,
        };
      } catch (error) {
        console.error('Error running mood classifier:', error.message);
        // Fallback to keyword matching
        return this.fallbackAnalyze(text);
      }
    }

    // If not loaded yet, try lazy loading (non-blocking)
    if (!this.isLoading && !this.isLoaded) {
      this.loadModel();
    }

    // Fallback to keyword matching if model not loaded
    return this.fallbackAnalyze(text);
  }

  /**
   * Fallback keyword-based analysis
   * Returns top 3 moods with confidence scores
   * Based on 7 main emotions: Happy, Sad, Angry, Fearful, Bad, Surprised, Disgusted
   */
  fallbackAnalyze(text) {
    const moodKeywords = {
      happy: [
        'happy',
        'joy',
        'excited',
        'great',
        'wonderful',
        'amazing',
        'fantastic',
        'love',
        'loved',
        'awesome',
        'brilliant',
        'excellent',
        'thrilled',
        'delighted',
        'optimistic',
        'hopeful',
        'inspired',
        'confident',
        'proud',
        'successful',
        'energetic',
        'eager',
        'playful',
        'thankful',
        'grateful',
        'calm',
        'peaceful',
        'balanced',
        'refreshing',
        'simple',
        'manageable',
        'settle',
        'quiet',
        'content',
        'serene',
        'tranquil',
        'at peace',
        'clear my head',
        'not overwhelmed',
      ],
      sad: [
        'sad',
        'depressed',
        'down',
        'upset',
        'crying',
        'tears',
        'hurt',
        'pain',
        'lonely',
        'empty',
        'hollow',
        'broken',
        'miserable',
        'unhappy',
        'isolated',
        'abandoned',
        'vulnerable',
        'fragile',
        'grief',
        'powerless',
        'guilty',
        'ashamed',
        'remorseful',
        'inferior',
        'embarrassed',
        'disappointed',
        'lingering',
        'persists',
        'same feeling',
        'for a while',
      ],
      angry: [
        'angry',
        'mad',
        'furious',
        'rage',
        'hate',
        'annoyed',
        'frustrated',
        'irritated',
        'pissed',
        'livid',
        'outraged',
        'betrayed',
        'resentful',
        'disrespected',
        'ridiculed',
        'bitter',
        'indignant',
        'violated',
        'jealous',
        'aggressive',
        'provoked',
        'hostile',
        'infuriated',
        'withdrawn',
        'numb',
        'critical',
        'dismissive',
        'skeptical',
      ],
      fearful: [
        'anxious',
        'worried',
        'nervous',
        'stressed',
        'panic',
        'fear',
        'scared',
        'afraid',
        'tense',
        'overwhelmed',
        'helpless',
        'frightened',
        'terrified',
        'insecure',
        'inferior',
        'inadequate',
        'weak',
        'worthless',
        'insignificant',
        'rejected',
        'excluded',
        'persecuted',
        'threatened',
        'exposed',
      ],
      bad: [
        'bored',
        'indifferent',
        'apathetic',
        'busy',
        'pressured',
        'rushed',
        'stressed',
        'overwhelmed',
        'out of control',
        'tired',
        'sleepy',
        'unfocused',
        'exhausted',
        'drained',
        'worn out',
        'listless',
        'unmotivated',
      ],
      surprised: [
        'surprised',
        'shocked',
        'startled',
        'amazed',
        'astonished',
        'awe',
        'confused',
        'bewildered',
        'perplexed',
        'disillusioned',
        'unexpected',
        'taken aback',
        'caught off guard',
        'eager',
        'energetic',
        'dismayed',
      ],
      disgusted: [
        'disgusted',
        'appalled',
        'revolted',
        'nauseated',
        'horrified',
        'repelled',
        'hesitant',
        'judgmental',
        'embarrassed',
        'disappointed',
        'awful',
        'detestable',
        'disapproving',
        'sick',
        'repulsive',
      ],
    };

    const textLower = text.toLowerCase();
    const moodScores = [];

    // Calculate scores for all moods
    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (textLower.includes(keyword) ? 1 : 0);
      }, 0);

      // Include all moods, even with 0 score, so we can return top 3
      moodScores.push({ mood, score });
    }

    // Sort by score and get top 3
    let sortedMoods = moodScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    // Normalize scores to confidence values (0-1)
    const maxScore = sortedMoods[0].score;
    const totalScore = sortedMoods.reduce((sum, m) => sum + m.score, 0);
    
    // If no moods detected (all scores are 0), return neutral
    if (maxScore === 0) {
      return {
        mood: 'neutral',
        confidence: 0,
        moods: [{ mood: 'neutral', confidence: 0 }],
      };
    }
    
    // If we have a clear winner, use relative scoring; otherwise use proportional
    if (maxScore > 0 && sortedMoods.length > 1) {
      sortedMoods = sortedMoods.map(({ mood, score }, idx) => {
        if (idx === 0 && maxScore >= 2) {
          // Clear winner - give it high confidence
          return {
            mood,
            confidence: Math.min(0.95, Math.max(0.6, score / (maxScore + 1)))
          };
        } else if (score > 0) {
          // Proportional confidence for moods with matches
          return {
            mood,
            confidence: Math.min(0.7, score / (totalScore || 1))
          };
        } else {
          // No matches - very low confidence
          return {
            mood,
            confidence: 0.05
          };
        }
      });
    } else {
      // Single mood or equal scores
      sortedMoods = sortedMoods.map(({ mood, score }) => ({
        mood,
        confidence: score > 0 ? Math.min(1, score / 3) : 0.05
      }));
    }

    const topMood = sortedMoods[0];
    return {
      mood: topMood.mood,
      confidence: topMood.confidence,
      moods: sortedMoods,
    };
  }
}

// Create singleton instance
const moodClassifier = new MoodClassifier();

// Try to load model on module load (async, non-blocking)
moodClassifier.loadModel();

module.exports = moodClassifier;
