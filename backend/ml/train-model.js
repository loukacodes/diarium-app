/**
 * Training Script for Mood Classifier using Natural (NLP library)
 * 
 * Usage:
 *   node train-model.js
 * 
 * Requirements:
 *   npm install natural
 * 
 * Emotions based on hierarchical emotion model:
 * - Happy, Sad, Angry, Fearful, Bad, Surprised, Disgusted
 */

const natural = require('natural');
const fs = require('fs');
const path = require('path');

// Training data - based on 7 main emotions from emotion hierarchy
const trainingData = [
  // Happy
  { text: "I'm so happy today! This is amazing!", mood: 'happy' },
  { text: 'Feeling great and excited about everything!', mood: 'happy' },
  { text: 'What a wonderful day! I love it!', mood: 'happy' },
  { text: "I'm thrilled and delighted!", mood: 'happy' },
  { text: "This is fantastic! I'm so pleased!", mood: 'happy' },
  { text: 'I feel joyful and cheerful today', mood: 'happy' },
  { text: 'Amazing day! Everything is going great!', mood: 'happy' },
  { text: "I'm so glad and content right now", mood: 'happy' },
  { text: 'Feeling wonderful and blessed', mood: 'happy' },
  { text: 'This makes me so happy and excited', mood: 'happy' },
  { text: 'I had such a great time today!', mood: 'happy' },
  { text: 'Feeling ecstatic and overjoyed!', mood: 'happy' },
  { text: 'Today was perfect, I feel amazing', mood: 'happy' },
  { text: 'I am so happy and grateful for this moment', mood: 'happy' },
  { text: 'Feeling positive and optimistic', mood: 'happy' },
  { text: 'This brings me so much joy', mood: 'happy' },
  { text: 'I feel elated and energized', mood: 'happy' },
  { text: 'What a beautiful and happy day', mood: 'happy' },
  { text: 'I am beaming with happiness', mood: 'happy' },
  { text: 'Feeling on top of the world!', mood: 'happy' },
  { text: 'I feel so good and positive today', mood: 'happy' },
  { text: 'This makes me incredibly happy', mood: 'happy' },
  { text: 'I am filled with joy and excitement', mood: 'happy' },
  { text: 'Feeling absolutely wonderful!', mood: 'happy' },
  { text: 'I am so happy I could burst!', mood: 'happy' },
  { text: 'Feeling inspired and hopeful', mood: 'happy' },
  { text: 'I feel confident and proud', mood: 'happy' },
  { text: 'Feeling loved and thankful', mood: 'happy' },
  { text: 'I feel respected and valued', mood: 'happy' },
  { text: 'Feeling successful and confident', mood: 'happy' },
  { text: 'Today was simple and calm', mood: 'happy' },
  { text: 'I felt calm in a quiet way', mood: 'happy' },
  { text: 'Feeling grateful for small moments', mood: 'happy' },
  { text: 'Everything feels balanced again', mood: 'happy' },
  { text: 'I woke up without rushing and felt peaceful', mood: 'happy' },
  { text: 'Work was manageable and refreshing', mood: 'happy' },
  { text: 'I did not feel overwhelmed, which felt rare', mood: 'happy' },
  { text: 'The cool air helped clear my head', mood: 'happy' },
  { text: 'Nothing remarkable happened, yet I felt calm', mood: 'happy' },
  { text: 'Feeling grateful for the simple things', mood: 'happy' },
  { text: 'I feel balanced and at peace', mood: 'happy' },
  { text: 'Today was peaceful and simple', mood: 'happy' },
  { text: 'Feeling calm and content with life', mood: 'happy' },
  { text: 'I am grateful for these quiet moments', mood: 'happy' },
  { text: 'Everything feels manageable and balanced', mood: 'happy' },

  // Sad
  { text: 'Feeling sad and lonely. Nothing seems right.', mood: 'sad' },
  { text: "I'm so down and depressed today", mood: 'sad' },
  { text: 'Feeling empty and broken inside', mood: 'sad' },
  { text: "I'm miserable and unhappy", mood: 'sad' },
  { text: 'This is so disappointing. I feel hurt', mood: 'sad' },
  { text: "I'm crying and feeling sorrowful", mood: 'sad' },
  { text: 'Feeling blue and melancholic', mood: 'sad' },
  { text: "I'm feeling down and hopeless", mood: 'sad' },
  { text: 'This sadness is overwhelming', mood: 'sad' },
  { text: 'I feel so low and dejected', mood: 'sad' },
  { text: 'I am feeling really down today', mood: 'sad' },
  { text: 'This makes me feel so sad and empty', mood: 'sad' },
  { text: 'I feel heartbroken and devastated', mood: 'sad' },
  { text: 'Feeling gloomy and despondent', mood: 'sad' },
  { text: 'I am so sad I cannot stop crying', mood: 'sad' },
  { text: 'This sadness is consuming me', mood: 'sad' },
  { text: 'I feel utterly miserable right now', mood: 'sad' },
  { text: 'Feeling downcast and dispirited', mood: 'sad' },
  { text: 'I am overwhelmed with sadness', mood: 'sad' },
  { text: 'This is making me feel so down', mood: 'sad' },
  { text: 'I feel so sad and alone', mood: 'sad' },
  { text: 'Feeling dejected and disheartened', mood: 'sad' },
  { text: 'I am feeling really low today', mood: 'sad' },
  { text: 'This sadness is too much to bear', mood: 'sad' },
  { text: 'Feeling isolated and abandoned', mood: 'sad' },
  { text: 'I feel vulnerable and fragile', mood: 'sad' },
  { text: 'Feeling grief and powerless', mood: 'sad' },
  { text: 'I feel guilty and ashamed', mood: 'sad' },
  { text: 'Feeling inferior and empty', mood: 'sad' },
  { text: 'I feel embarrassed and disappointed', mood: 'sad' },
  { text: "nothing much today, it's still the same hollow feeling", mood: 'sad' },
  { text: 'I have been feeling hollow for a while now', mood: 'sad' },
  { text: "I don't know why I feel this way, maybe it's the weather", mood: 'sad' },
  { text: 'Feeling empty and hollow inside', mood: 'sad' },
  { text: 'This hollow feeling has been with me for days', mood: 'sad' },
  { text: 'I feel the same emptiness as before', mood: 'sad' },
  { text: 'Nothing seems to change this hollow feeling', mood: 'sad' },
  { text: 'I have been feeling this way for a while', mood: 'sad' },
  { text: 'The same empty feeling persists', mood: 'sad' },
  { text: "I don't know why but I feel hollow", mood: 'sad' },
  { text: 'Feeling the same way for a while now', mood: 'sad' },
  { text: 'This emptiness has been lingering', mood: 'sad' },
  { text: 'I feel hollow and empty inside', mood: 'sad' },

  // Angry
  { text: "This is frustrating! I'm so annoyed right now.", mood: 'angry' },
  { text: "I'm furious and mad about this situation", mood: 'angry' },
  { text: 'Feeling angry and irritated', mood: 'angry' },
  { text: "I'm livid and outraged", mood: 'angry' },
  { text: 'So frustrated and resentful', mood: 'angry' },
  { text: "I'm really angry and upset", mood: 'angry' },
  { text: 'Feeling furious and enraged', mood: 'angry' },
  { text: 'This makes me so mad and frustrated', mood: 'angry' },
  { text: "I'm irritated and annoyed", mood: 'angry' },
  { text: 'Feeling angry and bitter', mood: 'angry' },
  { text: 'I am so angry I cannot think straight', mood: 'angry' },
  { text: 'Feeling absolutely furious and enraged', mood: 'angry' },
  { text: 'This is making me so mad and frustrated', mood: 'angry' },
  { text: 'I feel so angry and resentful right now', mood: 'angry' },
  { text: 'I am livid and completely outraged', mood: 'angry' },
  { text: 'Feeling extremely angry and irritated', mood: 'angry' },
  { text: 'I cannot control my anger right now', mood: 'angry' },
  { text: 'This makes me feel so furious and mad', mood: 'angry' },
  { text: 'I am feeling really angry and upset', mood: 'angry' },
  { text: 'So much rage and anger building up', mood: 'angry' },
  { text: 'I feel so frustrated and angry', mood: 'angry' },
  { text: 'This is infuriating and makes me so mad', mood: 'angry' },
  { text: 'I am absolutely furious about this', mood: 'angry' },
  { text: 'Feeling betrayed and resentful', mood: 'angry' },
  { text: 'I feel disrespected and ridiculed', mood: 'angry' },
  { text: 'Feeling indignant and violated', mood: 'angry' },
  { text: 'I am jealous and furious', mood: 'angry' },
  { text: 'Feeling provoked and hostile', mood: 'angry' },
  { text: 'I feel infuriated and annoyed', mood: 'angry' },

  // Fearful
  { text: "I'm really stressed about the deadline tomorrow.", mood: 'fearful' },
  { text: 'Feeling worried and nervous about everything', mood: 'fearful' },
  { text: "I'm anxious and scared about what's coming", mood: 'fearful' },
  { text: 'So much panic and fear in my mind', mood: 'fearful' },
  { text: 'I feel tense and overwhelmed', mood: 'fearful' },
  { text: 'Nervous and jittery about the future', mood: 'fearful' },
  { text: "I'm really worried and on edge", mood: 'fearful' },
  { text: 'Feeling anxious and uncertain', mood: 'fearful' },
  { text: 'So much stress and pressure', mood: 'fearful' },
  { text: "I'm feeling panicked and uneasy", mood: 'fearful' },
  { text: 'I am so anxious I cannot relax', mood: 'fearful' },
  { text: 'Feeling extremely worried and stressed', mood: 'fearful' },
  { text: 'I feel like I am having a panic attack', mood: 'fearful' },
  { text: 'So much anxiety is building up inside me', mood: 'fearful' },
  { text: 'I am constantly worried about everything', mood: 'fearful' },
  { text: 'Feeling restless and anxious all the time', mood: 'fearful' },
  { text: 'I cannot stop worrying about tomorrow', mood: 'fearful' },
  { text: 'This anxiety is really getting to me', mood: 'fearful' },
  { text: 'I feel so stressed and overwhelmed', mood: 'fearful' },
  { text: 'My mind is racing with anxious thoughts', mood: 'fearful' },
  { text: 'I am feeling really nervous and jittery', mood: 'fearful' },
  { text: 'So much fear and anxiety in my heart', mood: 'fearful' },
  { text: 'I cannot shake this anxious feeling', mood: 'fearful' },
  { text: 'I feel scared and helpless', mood: 'fearful' },
  { text: 'Feeling frightened and terrified', mood: 'fearful' },
  { text: 'I feel overwhelmed and worried', mood: 'fearful' },
  { text: 'Feeling inferior and inadequate', mood: 'fearful' },
  { text: 'I feel worthless and insignificant', mood: 'fearful' },
  { text: 'Feeling excluded and persecuted', mood: 'fearful' },
  { text: 'I feel nervous and exposed', mood: 'fearful' },

  // Bad
  { text: 'I feel so bored and uninterested', mood: 'bad' },
  { text: 'Feeling indifferent and apathetic', mood: 'bad' },
  { text: 'I am so busy and pressured', mood: 'bad' },
  { text: 'Feeling rushed and overwhelmed', mood: 'bad' },
  { text: 'I am so stressed and out of control', mood: 'bad' },
  { text: 'Feeling completely overwhelmed', mood: 'bad' },
  { text: 'I am so tired and sleepy', mood: 'bad' },
  { text: 'Feeling unfocused and exhausted', mood: 'bad' },
  { text: 'I feel so drained and worn out', mood: 'bad' },
  { text: 'Feeling listless and unmotivated', mood: 'bad' },
  { text: 'I am feeling really bored today', mood: 'bad' },
  { text: 'Nothing seems interesting or engaging', mood: 'bad' },
  { text: 'I feel so busy I cannot catch my breath', mood: 'bad' },
  { text: 'Feeling pressured from all sides', mood: 'bad' },
  { text: 'I am rushed and have no time', mood: 'bad' },
  { text: 'I feel so stressed I cannot think', mood: 'bad' },
  { text: 'Everything feels out of control', mood: 'bad' },
  { text: 'I am completely overwhelmed', mood: 'bad' },
  { text: 'I am so tired I can barely function', mood: 'bad' },
  { text: 'Feeling sleepy and unfocused', mood: 'bad' },
  { text: 'I cannot concentrate on anything', mood: 'bad' },
  { text: 'Feeling exhausted and drained', mood: 'bad' },
  { text: 'I have no energy left', mood: 'bad' },
  { text: 'Feeling completely worn out', mood: 'bad' },
  { text: 'I feel so apathetic about everything', mood: 'bad' },
  { text: 'Nothing matters to me right now', mood: 'bad' },
  { text: 'I feel indifferent to everything', mood: 'bad' },
  { text: 'Feeling numb and disconnected', mood: 'bad' },

  // Surprised
  { text: "I'm so surprised! I didn't expect that!", mood: 'surprised' },
  { text: 'I am shocked and startled', mood: 'surprised' },
  { text: 'Feeling amazed and astonished', mood: 'surprised' },
  { text: 'I cannot believe what just happened', mood: 'surprised' },
  { text: 'This is so unexpected!', mood: 'surprised' },
  { text: 'I am completely taken aback', mood: 'surprised' },
  { text: 'Feeling bewildered and confused', mood: 'surprised' },
  { text: 'I am so confused about what happened', mood: 'surprised' },
  { text: 'This is perplexing and puzzling', mood: 'surprised' },
  { text: 'I feel disillusioned and surprised', mood: 'surprised' },
  { text: 'I am in awe of what I just saw', mood: 'surprised' },
  { text: 'Feeling astonished and amazed', mood: 'surprised' },
  { text: 'I am so excited and eager!', mood: 'surprised' },
  { text: 'Feeling energetic and surprised', mood: 'surprised' },
  { text: 'I was so startled by that!', mood: 'surprised' },
  { text: 'Feeling shocked and dismayed', mood: 'surprised' },
  { text: 'I am completely surprised', mood: 'surprised' },
  { text: 'This came out of nowhere!', mood: 'surprised' },
  { text: 'I did not see that coming', mood: 'surprised' },
  { text: 'Feeling caught off guard', mood: 'surprised' },
  { text: 'I am bewildered by this turn of events', mood: 'surprised' },
  { text: 'This is so unexpected and confusing', mood: 'surprised' },
  { text: 'I feel so amazed right now', mood: 'surprised' },
  { text: 'This is absolutely astonishing', mood: 'surprised' },
  { text: 'I am in complete awe', mood: 'surprised' },

  // Disgusted
  { text: 'I am so disgusted by this', mood: 'disgusted' },
  { text: 'Feeling appalled and revolted', mood: 'disgusted' },
  { text: 'This makes me feel nauseated', mood: 'disgusted' },
  { text: 'I am horrified by what I saw', mood: 'disgusted' },
  { text: 'Feeling repelled and hesitant', mood: 'disgusted' },
  { text: 'I feel so judgmental about this', mood: 'disgusted' },
  { text: 'This is embarrassing and awful', mood: 'disgusted' },
  { text: 'I am disappointed and appalled', mood: 'disgusted' },
  { text: 'Feeling revolted and disgusted', mood: 'disgusted' },
  { text: 'This is absolutely awful', mood: 'disgusted' },
  { text: 'I feel nauseated and sick', mood: 'disgusted' },
  { text: 'This is detestable and horrible', mood: 'disgusted' },
  { text: 'I am so horrified right now', mood: 'disgusted' },
  { text: 'Feeling hesitant and repelled', mood: 'disgusted' },
  { text: 'I cannot stand this', mood: 'disgusted' },
  { text: 'This is so repulsive to me', mood: 'disgusted' },
  { text: 'I feel so disapproving', mood: 'disgusted' },
  { text: 'This is judgmental and wrong', mood: 'disgusted' },
  { text: 'I am embarrassed by this behavior', mood: 'disgusted' },
  { text: 'Feeling disappointed and appalled', mood: 'disgusted' },
  { text: 'This revolts me completely', mood: 'disgusted' },
  { text: 'I am so disgusted I cannot look', mood: 'disgusted' },
  { text: 'This makes me feel sick', mood: 'disgusted' },
  { text: 'I am nauseated by this', mood: 'disgusted' },
];

/**
 * Train mood classifier with Natural BayesClassifier
 */
function trainModel() {
  console.log('Initializing Natural BayesClassifier...');
  console.log(`Training with ${trainingData.length} examples across 7 emotions:`);

  // Count examples per mood
  const moodCounts = trainingData.reduce((acc, item) => {
    acc[item.mood] = (acc[item.mood] || 0) + 1;
    return acc;
  }, {});

  Object.entries(moodCounts).forEach(([mood, count]) => {
    console.log(`  - ${mood}: ${count} examples`);
  });
  console.log('');

  const classifier = new natural.BayesClassifier();

  // Prepare and add training data
  console.log('Preparing training data...');
  trainingData.forEach((item) => {
    classifier.addDocument(item.text.toLowerCase().trim(), item.mood);
  });

  console.log('Training model... (this may take a moment)');
  classifier.train();

  console.log('\nTraining complete!');

  // Test the model
  console.log('\nTesting model:');
  const testCases = [
    "I'm feeling great and excited!",
    'Feeling sad and lonely today',
    "I'm really worried about tomorrow",
    'So peaceful and relaxed',
    "I'm so disgusted by this",
    'I am completely surprised!',
    'Feeling so bored and tired',
  ];

  testCases.forEach((testText) => {
    const classification = classifier.classify(testText.toLowerCase());
    const classifications = classifier.getClassifications(testText.toLowerCase());
    const confidence = classifications[0] ? classifications[0].value : 0;
    console.log(`  "${testText}" -> ${classification} (confidence: ${confidence.toFixed(3)})`);
  });

  // Save the model
  const modelsDir = path.join(__dirname, 'models');
  if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
  }

  const modelPath = path.join(modelsDir, 'mood-classifier.json');

  // Natural uses save() method with callback
  classifier.save(modelPath, (err) => {
    if (err) {
      console.error('Error saving model:', err);
      return;
    }
    console.log(`\nModel saved to ${modelPath}`);
    console.log('You can now use this model in your application!');
  });
}

// Run if executed directly
if (require.main === module) {
  trainModel();
}

module.exports = { trainModel };
