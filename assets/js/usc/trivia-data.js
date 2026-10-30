// Club Trivia questions for solo practice: 10 questions about club life.
// Every question has 4 picture answers and `answer` is the index of the right one.
// The live club-night game will load its questions from the backend later; this
// list keeps the same shape so either source works.

export const TRIVIA_QUESTIONS = [
  {
    question: 'Which game has a caller who reads numbers like "B 7"?',
    choices: [{ emoji: '♟️', label: 'Chess' }, { emoji: '🎱', label: 'Bingo' }, { emoji: '⛳', label: 'Golf' }, { emoji: '🎾', label: 'Tennis' }],
    answer: 1,
  },
  {
    question: 'On which day of the week does Unified Social Club meet?',
    choices: [{ emoji: '📅', label: 'Friday' }, { emoji: '📅', label: 'Monday' }, { emoji: '📅', label: 'Tuesday' }, { emoji: '📅', label: 'Sunday' }],
    answer: 0,
  },
  {
    question: 'What do you do at karaoke?',
    choices: [{ emoji: '🏊', label: 'Swim' }, { emoji: '😴', label: 'Sleep' }, { emoji: '🎤', label: 'Sing songs' }, { emoji: '🍳', label: 'Cook' }],
    answer: 2,
  },
  {
    question: 'Which of these is a board game?',
    choices: [{ emoji: '🏀', label: 'Basketball' }, { emoji: '🎹', label: 'Piano' }, { emoji: '🏊', label: 'Swimming' }, { emoji: '🏁', label: 'Checkers' }],
    answer: 3,
  },
  {
    question: 'Which food is round and has cheese and sauce on top?',
    choices: [{ emoji: '🍕', label: 'Pizza' }, { emoji: '🍌', label: 'Banana' }, { emoji: '🥕', label: 'Carrot' }, { emoji: '🧊', label: 'Ice cube' }],
    answer: 0,
  },
  {
    question: 'How many players from one basketball team play on the court at a time?',
    choices: [{ emoji: '2️⃣', label: '2' }, { emoji: '5️⃣', label: '5' }, { emoji: '9️⃣', label: '9' }, { emoji: '🔟', label: '10' }],
    answer: 1,
  },
  {
    question: 'Mix red paint and yellow paint. What color do you get?',
    choices: [{ emoji: '🟣', label: 'Purple' }, { emoji: '🔵', label: 'Blue' }, { emoji: '🟠', label: 'Orange' }, { emoji: '⚫', label: 'Black' }],
    answer: 2,
  },
  {
    question: 'What do you use to paint a picture?',
    choices: [{ emoji: '🍴', label: 'A fork' }, { emoji: '👟', label: 'A shoe' }, { emoji: '🛏️', label: 'A pillow' }, { emoji: '🖌️', label: 'A paintbrush' }],
    answer: 3,
  },
  {
    question: 'Unified Social Club meets in which city?',
    choices: [{ emoji: '🏡', label: 'Poway' }, { emoji: '🗽', label: 'New York' }, { emoji: '🗼', label: 'Paris' }, { emoji: '🗾', label: 'Tokyo' }],
    answer: 0,
  },
  {
    question: 'If you need help at club, who can you ask?',
    choices: [{ emoji: '🐦', label: 'A bird' }, { emoji: '🙋', label: 'A volunteer' }, { emoji: '🪑', label: 'A chair' }, { emoji: '📺', label: 'The TV' }],
    answer: 1,
  },
];
