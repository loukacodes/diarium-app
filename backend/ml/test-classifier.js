/**
 * Test script for mood classifier
 * 
 * Usage:
 *   node ml/test-classifier.js
 */

const moodClassifier = require('./moodClassifier');

// Wait a bit for async model loading
setTimeout(() => {
  console.log('Testing Mood Classifier\n');
  console.log('='.repeat(50));

  const testCases = [
    "I'm feeling great and excited today!",
    "Feeling sad and lonely, nothing seems right",
    "I'm really worried about tomorrow's deadline",
    "So peaceful and relaxed after meditation",
    "I'm so grateful for my friends and family",
    "This is so frustrating! I'm really annoyed",
    "Had an amazing day at the beach with friends",
    "Feeling empty and broken inside",
    "Nervous and jittery about the presentation",
    "Chill and composed, everything is fine",
  ];

  testCases.forEach((text, index) => {
    const result = moodClassifier.analyze(text);
    console.log(`\nTest ${index + 1}:`);
    console.log(`  Text: "${text}"`);
    console.log(`  Detected Mood: ${result.mood}`);
    console.log(`  Confidence: ${(result.confidence * 100).toFixed(1)}%`);
  });

  console.log('\n' + '='.repeat(50));
  console.log(`\nModel Status: ${moodClassifier.isLoaded ? '✅ Loaded' : '⚠️  Using fallback (keyword matching)'}`);
}, 2000);

