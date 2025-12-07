/**
 * Mood Classifier using Hugging Face Inference API
 * 
 * Uses pre-trained emotion classification models from Hugging Face
 * Recommended models:
 * - j-hartmann/emotion-english-distilroberta-base (7 emotions)
 * - SamLowe/roberta-base-go_emotions (28 emotions)
 * - bhadresh-savani/bert-base-uncased-emotion (6 emotions)
 */

const https = require('https');

class HuggingFaceClassifier {
  constructor() {
    // You can get a free API token from https://huggingface.co/settings/tokens
    this.apiToken = process.env.HUGGINGFACE_API_TOKEN || null;
    // Default model - can be changed via environment variable
    this.model = process.env.HUGGINGFACE_MODEL || 'j-hartmann/emotion-english-distilroberta-base';
    this.apiUrl = `https://api-inference.huggingface.co/models/${this.model}`;
  }

  /**
   * Map Hugging Face emotion labels to our mood categories
   */
  mapEmotionToMood(emotion) {
    const emotionLower = emotion.toLowerCase();
    
    // Map to our 7 main moods
    const moodMap = {
      // Happy emotions
      joy: 'happy',
      happiness: 'happy',
      excitement: 'happy',
      optimism: 'happy',
      love: 'happy',
      pride: 'happy',
      relief: 'happy',
      amusement: 'happy',
      approval: 'happy',
      caring: 'happy',
      gratitude: 'happy',
      
      // Sad emotions
      sadness: 'sad',
      grief: 'sad',
      disappointment: 'sad',
      remorse: 'sad',
      shame: 'sad',
      
      // Angry emotions
      anger: 'angry',
      annoyance: 'angry',
      disapproval: 'angry',
      disgust: 'angry',
      
      // Fearful emotions
      fear: 'fearful',
      nervousness: 'fearful',
      anxiety: 'fearful',
      
      // Bad/Tired emotions
      boredom: 'bad',
      tiredness: 'bad',
      exhaustion: 'bad',
      
      // Surprised emotions
      surprise: 'surprised',
      confusion: 'surprised',
      curiosity: 'surprised',
      
      // Neutral
      neutral: 'neutral',
    };

    // Try exact match first
    if (moodMap[emotionLower]) {
      return moodMap[emotionLower];
    }

    // Try partial match
    for (const [key, value] of Object.entries(moodMap)) {
      if (emotionLower.includes(key) || key.includes(emotionLower)) {
        return value;
      }
    }

    // Default to neutral if no match
    return 'neutral';
  }

  /**
   * Call Hugging Face Inference API
   */
  async callHuggingFaceAPI(text) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({ inputs: text });

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
          ...(this.apiToken && { Authorization: `Bearer ${this.apiToken}` }),
        },
      };

      const req = https.request(this.apiUrl, options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const result = JSON.parse(responseData);
            
            // Handle API errors
            if (result.error) {
              reject(new Error(result.error));
              return;
            }

            // Handle rate limiting
            if (res.statusCode === 503) {
              reject(new Error('Model is loading, please try again in a few seconds'));
              return;
            }

            resolve(result);
          } catch (error) {
            reject(new Error(`Failed to parse API response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`API request failed: ${error.message}`));
      });

      req.write(data);
      req.end();
    });
  }

  /**
   * Analyze mood from text using Hugging Face
   * Returns top 3 moods with confidence scores
   */
  async analyze(text) {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return {
        mood: 'neutral',
        confidence: 0,
        moods: [{ mood: 'neutral', confidence: 0 }],
      };
    }

    try {
      // Call Hugging Face API
      const result = await this.callHuggingFaceAPI(text);

      // Handle different response formats
      let emotions;
      if (Array.isArray(result)) {
        emotions = result[0];
      } else if (Array.isArray(result[0])) {
        emotions = result[0][0];
      } else {
        emotions = result;
      }

      // Convert to our format
      if (Array.isArray(emotions)) {
        // Sort by score (confidence)
        const sortedEmotions = emotions
          .map((item) => ({
            label: item.label || item.emotion || item.mood,
            score: item.score || item.confidence || 0,
          }))
          .sort((a, b) => b.score - a.score);

        // Get top 3 and map to our mood categories
        const top3 = sortedEmotions.slice(0, 3).map((item) => ({
          mood: this.mapEmotionToMood(item.label),
          confidence: item.score,
          originalLabel: item.label, // Keep original for debugging
        }));

        // Group by mood and take highest confidence
        const moodMap = new Map();
        top3.forEach((item) => {
          const existing = moodMap.get(item.mood);
          if (!existing || existing.confidence < item.confidence) {
            moodMap.set(item.mood, item);
          }
        });

        const finalMoods = Array.from(moodMap.values())
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 3);

        return {
          mood: finalMoods[0]?.mood || 'neutral',
          confidence: finalMoods[0]?.confidence || 0,
          moods: finalMoods.length > 0 ? finalMoods : [{ mood: 'neutral', confidence: 0 }],
        };
      } else {
        // Single emotion result
        const mood = this.mapEmotionToMood(emotions.label || emotions.emotion || 'neutral');
        const confidence = emotions.score || emotions.confidence || 0.5;

        return {
          mood,
          confidence,
          moods: [{ mood, confidence }],
        };
      }
    } catch (error) {
      console.error('Hugging Face API error:', error.message);
      
      // Fallback to keyword matching if API fails
      // You can import the fallback from moodClassifier.js if needed
      return {
        mood: 'neutral',
        confidence: 0.5,
        moods: [{ mood: 'neutral', confidence: 0.5 }],
      };
    }
  }
}

// Create singleton instance
const huggingFaceClassifier = new HuggingFaceClassifier();

module.exports = huggingFaceClassifier;

