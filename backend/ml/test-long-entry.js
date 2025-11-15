/**
 * Test script for mood classifier with long entries
 * 
 * Usage:
 *   node ml/test-long-entry.js
 */

const moodClassifier = require('./moodClassifier');

// Wait a bit for async model loading
setTimeout(() => {
  console.log('Testing Mood Classifier with Long Entries\n');
  console.log('='.repeat(70));

  const longEntries = [
    {
      name: 'Long Happy Entry',
      text: `Today was absolutely amazing! I woke up feeling refreshed and energized. The sun was shining brightly, and I decided to go for a morning walk in the park. The birds were singing, and everything felt perfect. I met up with my best friends for lunch, and we had the most wonderful conversation. We laughed so much that my stomach hurt. After lunch, I went to see a movie that I've been wanting to watch for weeks. It was fantastic! The plot was engaging, the acting was brilliant, and I was completely captivated. When I got home, I received a call from my family telling me some great news. I'm so happy and excited about everything that happened today. This has been one of the best days I've had in a long time. I feel grateful, joyful, and absolutely thrilled with how everything turned out. Life is wonderful, and I'm so blessed to have such amazing people in my life.`
    },
    {
      name: 'Long Sad Entry',
      text: `I don't know what's wrong with me today. I woke up feeling empty and broken inside. Nothing seems to be going right, and I can't shake this overwhelming sadness. I tried to get out of bed, but I just couldn't find the motivation. Everything feels pointless and meaningless. I called a friend, but they were busy, which made me feel even more lonely. I spent most of the day crying in my room, feeling miserable and hopeless. The weather outside is gloomy, which matches my mood perfectly. I keep thinking about all the things that have gone wrong recently, and it's making me feel even worse. I feel so down and depressed, like there's no way out of this darkness. I'm hurting, and I don't know how to make it stop. This sadness is overwhelming, and I feel so alone.`
    },
    {
      name: 'Long Anxious Entry',
      text: `I'm really stressed about everything that's coming up. Tomorrow I have a big presentation at work, and I'm so nervous about it. I've been preparing for weeks, but I still feel like I'm not ready. What if I forget what to say? What if people ask questions I can't answer? I'm worried that I'll make a fool of myself. On top of that, I have a deadline for a project that's due next week, and I'm barely halfway done. I feel so overwhelmed and panicked. My heart is racing, and I can't seem to calm down. I keep thinking about all the things that could go wrong, and it's making me even more anxious. I'm scared about the future and what might happen. I feel tense and jittery, like I'm on edge all the time. The pressure is building up, and I don't know how to handle it.`
    },
    {
      name: 'Mixed Emotions Entry',
      text: `Today was a rollercoaster of emotions. I started the day feeling great and excited about a new opportunity that came my way. I was happy and optimistic, thinking about all the possibilities. But then I got some disappointing news that made me feel sad and upset. I was worried about how this would affect my plans, and I started to feel anxious and stressed. However, after talking to a friend, I began to feel calmer and more at peace. They helped me see things from a different perspective, and I started to feel grateful for what I have. By the end of the day, I was feeling a bit frustrated about some things that didn't go as planned, but overall, I'm trying to stay positive and focus on the good things in my life.`
    }
  ];

  longEntries.forEach((entry, index) => {
    const startTime = Date.now();
    const result = moodClassifier.analyze(entry.text);
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    const wordCount = entry.text.split(/\s+/).length;

    console.log(`\n${entry.name}:`);
    console.log(`  Word Count: ${wordCount} words`);
    console.log(`  Detected Mood: ${result.mood}`);
    console.log(`  Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`  Processing Time: ${processingTime}ms`);
    console.log(`  Model Status: ${moodClassifier.isLoaded ? '✅ Using ML model' : '⚠️  Using fallback'}`);
  });

  console.log('\n' + '='.repeat(70));
  console.log('\n✅ All tests completed!');
}, 2000);

