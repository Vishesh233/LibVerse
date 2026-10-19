export const GENRES = [
  'Self-Help',
  'Programming',
  'Computer Science',
  'Finance',
  'Business',
  'Fiction',
  'Non-Fiction',
  'History',
  'Biography',
  'Science',
  'Technology',
  'Startup',
  'Motivation',
  'Psychology',
  'Database',
  'Networking',
  'Cyber Security',
  'AI & Machine Learning',
];

/**
 * One accent per genre for card borders, glow and genre badges on the dark theme.
 * Badge text is the accent lightened 20% toward white on a 14% accent tint: every pair is >= 6.1:1.
 */
export const GENRE_ACCENTS = {
  'Self-Help': '#FB923C',
  Programming: '#22D3EE',
  'Computer Science': '#60A5FA',
  Finance: '#FBBF24',
  Business: '#C084FC',
  Fiction: '#F472B6',
  'Non-Fiction': '#CBD5E1',
  History: '#E0B354',
  Biography: '#D6A77A',
  Science: '#4ADE80',
  Technology: '#2DD4BF',
  Startup: '#A3E635',
  Motivation: '#F87171',
  Psychology: '#E879F9',
  Database: '#818CF8',
  Networking: '#38BDF8',
  'Cyber Security': '#34D399',
  'AI & Machine Learning': '#A78BFA',
};

export const DEFAULT_GENRE_ACCENT = '#6366F1'; // primary accent

export const getGenreAccent = (genre) => GENRE_ACCENTS[genre] || DEFAULT_GENRE_ACCENT;

/** Inline style exposing the accent as an "r g b" triplet (--genre-accent) for rgb(... / alpha) in CSS */
export const genreAccentStyle = (genre) => {
  const hex = getGenreAccent(genre).slice(1);
  const rgb = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(' ');
  return { '--genre-accent': rgb };
};
