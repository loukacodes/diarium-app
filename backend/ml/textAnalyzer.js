/**
 * Text Analyzer for temporal and category analysis
 * Analyzes text to determine:
 * - Temporal focus: past, present, or future
 * - Category: work, life, school, relationship, family, self, society, goals, etc.
 */

class TextAnalyzer {
  constructor() {
    // Temporal keywords
    this.temporalKeywords = {
      past: [
        'yesterday', 'ago', 'was', 'were', 'had', 'did', 'went', 'came', 'saw', 'felt',
        'remember', 'remembered', 'recall', 'recalled', 'before', 'earlier', 'previous',
        'last week', 'last month', 'last year', 'used to', 'once', 'back then', 'then',
        'past', 'history', 'memories', 'remembering', 'reminiscing', 'nostalgia',
        'happened', 'occurred', 'took place', 'finished', 'completed', 'ended',
        'when i was', 'when we were', 'back in', 'in the past', 'previously'
      ],
      present: [
        'now', 'today', 'currently', 'right now', 'at the moment', 'present', 'is', 'are',
        'am', 'doing', 'feeling', 'thinking', 'going through', 'experiencing', 'living',
        'happening', 'occurs', 'takes place', 'this week', 'this month', 'this year',
        'nowadays', 'these days', 'at present', 'in the present', 'currently',
        'right here', 'right now', 'as we speak', 'in this moment'
      ],
      future: [
        'tomorrow', 'will', 'going to', 'plan to', 'planning', 'hope to', 'hoping',
        'expect', 'expecting', 'soon', 'later', 'next week', 'next month', 'next year',
        'future', 'upcoming', 'coming', 'ahead', 'forward', 'eventually', 'someday',
        'one day', 'in the future', 'going forward', 'looking forward', 'anticipate',
        'anticipating', 'intend', 'intending', 'aim to', 'aiming', 'goal', 'goals',
        'dream', 'dreaming', 'wish', 'wishing', 'want to', 'would like to'
      ]
    };

    // Category keywords
    this.categoryKeywords = {
      work: [
        'work', 'job', 'office', 'boss', 'colleague', 'colleagues', 'meeting', 'meetings',
        'project', 'projects', 'deadline', 'deadlines', 'career', 'professional', 'boss',
        'manager', 'team', 'workplace', 'office', 'desk', 'computer', 'laptop',
        'presentation', 'presentations', 'client', 'clients', 'business', 'company',
        'employer', 'employee', 'salary', 'promotion', 'promoted', 'interview', 'hired',
        'fired', 'resign', 'resigned', 'quit', 'quitting', 'workload', 'tasks', 'task'
      ],
      school: [
        'school', 'university', 'college', 'class', 'classes', 'homework', 'assignment',
        'assignments', 'exam', 'exams', 'test', 'tests', 'quiz', 'quizzes', 'grade',
        'grades', 'gpa', 'professor', 'professors', 'teacher', 'teachers', 'student',
        'students', 'study', 'studying', 'studied', 'campus', 'lecture', 'lectures',
        'semester', 'semesters', 'course', 'courses', 'degree', 'graduation', 'graduate',
        'thesis', 'dissertation', 'research', 'paper', 'papers', 'essay', 'essays'
      ],
      relationship: [
        'boyfriend', 'girlfriend', 'partner', 'spouse', 'husband', 'wife', 'dating',
        'date', 'dates', 'relationship', 'relationships', 'love', 'loved', 'loving',
        'romance', 'romantic', 'together', 'breakup', 'broke up', 'divorce', 'divorced',
        'marriage', 'married', 'wedding', 'engaged', 'engagement', 'proposal', 'proposed',
        'crush', 'attracted', 'attraction', 'flirting', 'flirt', 'kiss', 'kissed',
        'hug', 'hugged', 'cuddle', 'cuddled', 'intimate', 'intimacy'
      ],
      family: [
        'family', 'mom', 'mother', 'dad', 'father', 'parent', 'parents', 'sister',
        'sisters', 'brother', 'brothers', 'sibling', 'siblings', 'son', 'sons',
        'daughter', 'daughters', 'child', 'children', 'kid', 'kids', 'baby', 'babies',
        'grandmother', 'grandfather', 'grandma', 'grandpa', 'grandparent', 'grandparents',
        'aunt', 'uncle', 'cousin', 'cousins', 'nephew', 'niece', 'relative', 'relatives',
        'household', 'home', 'house', 'visit', 'visited', 'visiting', 'reunion', 'gathering'
      ],
      self: [
        'myself', 'i feel', 'i think', 'i am', 'i\'m', 'personal', 'personally',
        'self', 'self-care', 'self-improvement', 'self-reflection', 'reflection',
        'introspection', 'meditation', 'meditating', 'mindfulness', 'mental health',
        'wellbeing', 'well-being', 'health', 'fitness', 'exercise', 'exercising',
        'workout', 'workouts', 'diet', 'eating', 'sleep', 'sleeping', 'rest',
        'relaxation', 'relaxing', 'hobby', 'hobbies', 'interest', 'interests',
        'passion', 'passions', 'identity', 'who i am', 'my personality'
      ],
      society: [
        'society', 'social', 'community', 'communities', 'world', 'global', 'news',
        'politics', 'political', 'government', 'election', 'elections', 'vote', 'voting',
        'social media', 'facebook', 'twitter', 'instagram', 'tiktok', 'reddit',
        'culture', 'cultural', 'tradition', 'traditions', 'social issues', 'climate',
        'environment', 'environmental', 'economy', 'economic', 'pandemic', 'covid',
        'public', 'people', 'everyone', 'society', 'social justice', 'equality',
        'inequality', 'discrimination', 'racism', 'sexism', 'activism', 'activist'
      ],
      goals: [
        'goal', 'goals', 'objective', 'objectives', 'target', 'targets', 'aim', 'aims',
        'plan', 'plans', 'planning', 'planned', 'aspiration', 'aspirations', 'dream',
        'dreams', 'dreaming', 'ambition', 'ambitions', 'ambitious', 'achieve',
        'achievement', 'achievements', 'accomplish', 'accomplishment', 'accomplishments',
        'success', 'succeed', 'succeeding', 'milestone', 'milestones', 'progress',
        'improve', 'improving', 'improvement', 'better', 'best', 'excel', 'excellence',
        'strive', 'striving', 'work towards', 'working towards', 'reach', 'reaching'
      ],
      life: [
        'life', 'living', 'lifestyle', 'daily', 'day to day', 'routine', 'routines',
        'everyday', 'normal', 'ordinary', 'regular', 'usual', 'typical', 'general',
        'existence', 'being', 'alive', 'lived', 'experience', 'experiences',
        'experiencing', 'journey', 'journeys', 'path', 'paths', 'way of life',
        'lifespan', 'lifetime', 'throughout life', 'in life', 'my life', 'our lives'
      ]
    };
  }

  /**
   * Analyze temporal focus (past, present, future)
   */
  analyzeTemporal(text) {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return {
        past: 0,
        present: 0,
        future: 0,
      };
    }

    const lowerText = text.toLowerCase();
    const scores = {
      past: 0,
      present: 0,
      future: 0,
    };

    // Count keyword matches
    Object.keys(this.temporalKeywords).forEach((temporal) => {
      this.temporalKeywords[temporal].forEach((keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
          scores[temporal] += matches.length;
        }
      });
    });

    // Normalize scores to percentages (0-1)
    const total = scores.past + scores.present + scores.future;
    if (total === 0) {
      // Default to present if no temporal indicators found
      scores.present = 1;
    } else {
      scores.past = scores.past / total;
      scores.present = scores.present / total;
      scores.future = scores.future / total;
    }

    return scores;
  }

  /**
   * Analyze category focus
   */
  analyzeCategory(text) {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return {
        work: 0,
        school: 0,
        relationship: 0,
        family: 0,
        self: 0,
        society: 0,
        goals: 0,
        life: 0,
      };
    }

    const lowerText = text.toLowerCase();
    const scores = {};

    // Count keyword matches for each category
    Object.keys(this.categoryKeywords).forEach((category) => {
      scores[category] = 0;
      this.categoryKeywords[category].forEach((keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
          scores[category] += matches.length;
        }
      });
    });

    // Normalize scores to percentages (0-1)
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    if (total === 0) {
      // Default to life if no category indicators found
      scores.life = 1;
    } else {
      Object.keys(scores).forEach((category) => {
        scores[category] = scores[category] / total;
      });
    }

    // Filter out categories with very low scores (< 0.05) for cleaner visualization
    const filteredScores = {};
    Object.keys(scores).forEach((category) => {
      if (scores[category] >= 0.05) {
        filteredScores[category] = scores[category];
      }
    });

    // If nothing passed the threshold, return the top category
    if (Object.keys(filteredScores).length === 0) {
      const topCategory = Object.keys(scores).reduce((a, b) =>
        scores[a] > scores[b] ? a : b
      );
      filteredScores[topCategory] = scores[topCategory];
    }

    return filteredScores;
  }

  /**
   * Analyze both temporal and category
   */
  analyze(text) {
    return {
      temporal: this.analyzeTemporal(text),
      category: this.analyzeCategory(text),
    };
  }
}

module.exports = new TextAnalyzer();

