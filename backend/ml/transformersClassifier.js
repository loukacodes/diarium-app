/**
 * On-Device Mood Classifier using Transformers.js
 * 
 * Runs Hugging Face models directly in Node.js - no internet required after initial download
 * 
 * Recommended models:
 * - Xenova/emotion-english-distilroberta-base (7 emotions, ~67MB)
 * - Xenova/distilbert-base-uncased-finetuned-emotion (6 emotions, ~67MB)
 * - Xenova/bert-base-uncased-emotion (6 emotions, ~440MB)
 * 
 * Models are automatically downloaded and cached on first use.
 */

class TransformersClassifier {
  constructor() {
    this.pipeline = null;
    this.isLoading = false;
    this.isLoaded = false;
    // Default model - using sentiment analysis which works reliably with Transformers.js
    // We'll map sentiment to moods for better compatibility
    this.modelName = process.env.TRANSFORMERS_MODEL || 'Xenova/distilbert-base-uncased-finetuned-sst-2-english';
  }

  /**
   * Initialize the pipeline (lazy loading)
   */
  async loadPipeline() {
    if (this.isLoaded && this.pipeline) {
      return this.pipeline;
    }

    if (this.isLoading) {
      // Wait for ongoing load
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.isLoaded && this.pipeline) {
            clearInterval(checkInterval);
            resolve(this.pipeline);
          }
        }, 100);
      });
    }

    try {
      this.isLoading = true;
      console.log(`Loading Transformers.js model: ${this.modelName}...`);
      console.log('This may take a minute on first run (downloading model)...');

      // Dynamic import - Transformers.js is ESM
      // Note: This requires Node.js 18+ with ESM support
      const transformers = await import('@xenova/transformers');
      const { pipeline } = transformers;

      // Create pipeline for text classification
      // Try different configurations to find what works
      try {
        // First try with quantized (smaller, faster)
        this.pipeline = await pipeline('text-classification', this.modelName, {
          quantized: true,
        });
      } catch (error1) {
        try {
          // Try without quantization
          console.log('Quantized model not available, trying non-quantized...');
          this.pipeline = await pipeline('text-classification', this.modelName);
        } catch (error2) {
          // Try with revision or different model
          console.log('Model loading failed, trying alternative approach...');
          throw new Error(`Failed to load model: ${error2.message}`);
        }
      }

      this.isLoaded = true;
      this.isLoading = false;
      console.log('Transformers.js model loaded successfully!');
      return this.pipeline;
    } catch (error) {
      this.isLoading = false;
      if (error.code === 'ERR_REQUIRE_ESM') {
        console.error('Transformers.js requires ESM. Please use import() or convert to ESM module.');
        throw new Error('Transformers.js requires ESM support. See README-TRANSFORMERS.md for setup.');
      }
      console.error('Error loading Transformers.js model:', error.message);
      throw error;
    }
  }

  /**
   * Map sentiment/emotion labels to our mood categories
   */
  mapEmotionToMood(emotion) {
    const emotionLower = emotion.toLowerCase();

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
      positive: 'happy',

      // Sad emotions
      sadness: 'sad',
      grief: 'sad',
      disappointment: 'sad',
      remorse: 'sad',
      shame: 'sad',
      negative: 'sad',

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
      
      // Sentiment labels (from sentiment analysis models)
      positive: 'happy',
      negative: 'sad',
      pos: 'happy',
      neg: 'sad',
      positive_sentiment: 'happy',
      negative_sentiment: 'sad',
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
   * Quick keyword-based mood analysis (fallback/helper)
   * Returns the primary mood detected
   */
  analyzeKeywords(text) {
    const textLower = text.toLowerCase();
    
    const happyKeywords = ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'fantastic', 'love', 'proud', 'grateful', 'thankful', 'blessed'];
    const sadKeywords = ['sad', 'depressed', 'down', 'upset', 'crying', 'hurt', 'lonely', 'empty', 'broken', 'miserable'];
    const angryKeywords = ['angry', 'mad', 'furious', 'rage', 'hate', 'annoyed', 'frustrated', 'irritated'];
    const fearfulKeywords = ['anxious', 'worried', 'nervous', 'stressed', 'panic', 'fear', 'scared', 'afraid', 'overwhelmed'];
    
    const counts = {
      happy: happyKeywords.filter(k => textLower.includes(k)).length,
      sad: sadKeywords.filter(k => textLower.includes(k)).length,
      angry: angryKeywords.filter(k => textLower.includes(k)).length,
      fearful: fearfulKeywords.filter(k => textLower.includes(k)).length,
    };
    
    const maxCount = Math.max(...Object.values(counts));
    if (maxCount === 0) return null;
    
    return Object.entries(counts).find(([_, count]) => count === maxCount)?.[0] || null;
  }

  /**
   * Analyze multiple moods from keywords
   * Returns array of moods with confidence scores
   */
  analyzeMultipleKeywords(text) {
    const textLower = text.toLowerCase();
    
    const keywordSets = {
      happy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'fantastic', 'love', 'proud', 'grateful', 'thankful', 'blessed', 'relieved', 'content', 'peaceful'],
      sad: ['sad', 'depressed', 'down', 'upset', 'crying', 'hurt', 'lonely', 'empty', 'broken', 'miserable', 'disappointed'],
      angry: ['angry', 'mad', 'furious', 'rage', 'hate', 'annoyed', 'frustrated', 'irritated', 'pissed'],
      fearful: ['anxious', 'worried', 'nervous', 'stressed', 'panic', 'fear', 'scared', 'afraid', 'overwhelmed'],
      bad: ['tired', 'exhausted', 'drained', 'bored', 'unmotivated'],
      surprised: ['surprised', 'shocked', 'amazed', 'astonished', 'confused'],
    };
    
    const moodScores = [];
    
    // Calculate scores for each mood category
    for (const [mood, keywords] of Object.entries(keywordSets)) {
      const matches = keywords.filter(k => textLower.includes(k)).length;
      if (matches > 0) {
        // Confidence based on number of keyword matches
        const confidence = Math.min(0.9, 0.5 + (matches * 0.1));
        moodScores.push({ mood, confidence, matches });
      }
    }
    
    // Sort by confidence and return top moods
    return moodScores
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5) // Get top 5, will be filtered to top 3 later
      .map(({ mood, confidence }) => ({ mood, confidence }));
  }

  /**
   * Analyze mood from text using Transformers.js
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
      // Load pipeline if not already loaded
      const pipeline = await this.loadPipeline();

      // Run inference
      const results = await pipeline(text);

      // Handle different response formats
      let emotions;
      if (Array.isArray(results)) {
        emotions = results;
      } else if (Array.isArray(results[0])) {
        emotions = results[0];
      } else {
        emotions = [results];
      }

      // Sort by score (confidence)
      const sortedEmotions = emotions
        .map((item) => {
          const label = item.label || item.emotion || item.mood || '';
          const score = item.score || item.confidence || 0;
          return { label, score };
        })
        .sort((a, b) => b.score - a.score);

      // Use keyword analysis to detect multiple moods
      const keywordMoods = this.analyzeMultipleKeywords(text);
      
      // Get moods from sentiment analysis
      const sentimentMoods = sortedEmotions.slice(0, 3).map((item) => ({
        mood: this.mapEmotionToMood(item.label),
        confidence: item.score,
        originalLabel: item.label,
      }));

      // Combine sentiment analysis with keyword detection for multiple moods
      const allMoods = new Map();
      
      // Add sentiment-based moods (if not neutral)
      sentimentMoods.forEach((m) => {
        if (m.mood !== 'neutral') {
          allMoods.set(m.mood, m);
        }
      });
      
      // Add keyword-detected moods (these are more specific and can detect multiple)
      keywordMoods.forEach((moodData) => {
        const existing = allMoods.get(moodData.mood);
        if (!existing || moodData.confidence > existing.confidence) {
          // Boost keyword-detected moods slightly as they're more specific
          allMoods.set(moodData.mood, {
            mood: moodData.mood,
            confidence: Math.min(0.95, moodData.confidence * 1.1),
            originalLabel: 'keyword-detected',
          });
        } else {
          // If sentiment already has this mood, boost its confidence
          existing.confidence = Math.min(0.95, existing.confidence * 1.05);
        }
      });

      // Sort by confidence and return top 3 distinct moods
      const finalMoods = Array.from(allMoods.values())
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);

      return {
        mood: finalMoods[0]?.mood || 'neutral',
        confidence: finalMoods[0]?.confidence || 0,
        moods: finalMoods.length > 0 ? finalMoods : [{ mood: 'neutral', confidence: 0 }],
      };
    } catch (error) {
      console.error('Transformers.js inference error:', error.message);
      
      // Return neutral on error
      return {
        mood: 'neutral',
        confidence: 0.5,
        moods: [{ mood: 'neutral', confidence: 0.5 }],
      };
    }
  }
}

// Create singleton instance
const transformersClassifier = new TransformersClassifier();

module.exports = transformersClassifier;

