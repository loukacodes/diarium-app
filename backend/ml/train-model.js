/**
 * Training Script for Mood Classifier using brain.js
 * 
 * Usage:
 *   node train-model.js
 * 
 * Requirements:
 *   npm install brain.js
 */

const brain = require('brain.js');
const fs = require('fs');
const path = require('path');

// Training data - expand this with more examples for better accuracy
const trainingData = [
  // Happy
  { text: "I'm so happy today! This is amazing!", mood: "happy" },
  { text: "Feeling great and excited about everything!", mood: "happy" },
  { text: "What a wonderful day! I love it!", mood: "happy" },
  { text: "I'm thrilled and delighted!", mood: "happy" },
  { text: "This is fantastic! I'm so pleased!", mood: "happy" },
  { text: "I feel joyful and cheerful today", mood: "happy" },
  { text: "Amazing day! Everything is going great!", mood: "happy" },
  
  // Sad
  { text: "Feeling sad and lonely. Nothing seems right.", mood: "sad" },
  { text: "I'm so down and depressed today", mood: "sad" },
  { text: "Feeling empty and broken inside", mood: "sad" },
  { text: "I'm miserable and unhappy", mood: "sad" },
  { text: "This is so disappointing. I feel hurt", mood: "sad" },
  { text: "I'm crying and feeling sorrowful", mood: "sad" },
  
  // Anxious
  { text: "I'm really stressed about the deadline tomorrow.", mood: "anxious" },
  { text: "Feeling worried and nervous about everything", mood: "anxious" },
  { text: "I'm anxious and scared about what's coming", mood: "anxious" },
  { text: "So much panic and fear in my mind", mood: "anxious" },
  { text: "I feel tense and overwhelmed", mood: "anxious" },
  { text: "Nervous and jittery about the future", mood: "anxious" },
  
  // Calm
  { text: "Feeling calm and peaceful after meditation.", mood: "calm" },
  { text: "I'm relaxed and serene today", mood: "calm" },
  { text: "Feeling tranquil and at ease", mood: "calm" },
  { text: "So peaceful and content right now", mood: "calm" },
  { text: "I feel balanced and centered", mood: "calm" },
  { text: "Chill and composed, everything is fine", mood: "calm" },
  
  // Grateful
  { text: "I'm so grateful for my friends and family.", mood: "grateful" },
  { text: "Feeling thankful and blessed today", mood: "grateful" },
  { text: "I appreciate everything I have", mood: "grateful" },
  { text: "So grateful and fortunate", mood: "grateful" },
  { text: "I feel lucky and appreciative", mood: "grateful" },
  
  // Angry
  { text: "This is frustrating! I'm so annoyed right now.", mood: "angry" },
  { text: "I'm furious and mad about this situation", mood: "angry" },
  { text: "Feeling angry and irritated", mood: "angry" },
  { text: "I'm livid and outraged", mood: "angry" },
  { text: "So frustrated and resentful", mood: "angry" },
];

/**
 * Train mood classifier with brain.js
 */
function trainModel() {
  console.log('Initializing brain.js LSTM network...');
  
  const net = new brain.recurrent.LSTM({
    hiddenLayers: [20, 20],
    iterations: 2000,
    learningRate: 0.01,
    errorThresh: 0.005,
  });

  // Prepare training data
  console.log(`Preparing ${trainingData.length} training examples...`);
  const trainingSet = trainingData.map(item => ({
    input: item.text.toLowerCase().trim(),
    output: item.mood,
  }));

  console.log('Training model... (this may take a minute)');
  const stats = net.train(trainingSet, {
    log: true,
    logPeriod: 100,
  });

  console.log('\nTraining complete!');
  console.log('Training stats:', stats);

  // Test the model
  console.log('\nTesting model:');
  const testCases = [
    "I'm feeling great and excited!",
    "Feeling sad and lonely today",
    "I'm really worried about tomorrow",
    "So peaceful and relaxed",
    "I'm grateful for everything",
    "This is so frustrating!",
  ];

  testCases.forEach(testText => {
    const output = net.run(testText.toLowerCase());
    console.log(`  "${testText}" -> ${output}`);
  });

  // Save the model
  const modelsDir = path.join(__dirname, 'models');
  if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
  }

  const modelPath = path.join(modelsDir, 'mood-classifier.json');
  const modelJSON = net.toJSON();
  fs.writeFileSync(modelPath, JSON.stringify(modelJSON, null, 2));
  
  console.log(`\nModel saved to ${modelPath}`);
  console.log('You can now use this model in your application!');
}

// Run if executed directly
if (require.main === module) {
  trainModel();
}

module.exports = { trainModel };

