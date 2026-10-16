import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { GENRES as CATALOGUE_GENRES } from '../constants/genres';

// Same 18 genres as the book catalogue (Book.genre enum); styles are only visual
const GENRE_STYLES = {
  'Self-Help': { icon: '🌱', color: 'from-green-400 to-emerald-400' },
  Programming: { icon: '💻', color: 'from-blue-500 to-cyan-500' },
  'Computer Science': { icon: '🖥️', color: 'from-blue-600 to-indigo-600' },
  Finance: { icon: '💰', color: 'from-green-600 to-emerald-600' },
  Business: { icon: '💼', color: 'from-amber-500 to-orange-500' },
  Fiction: { icon: '📖', color: 'from-rose-500 to-pink-500' },
  'Non-Fiction': { icon: '📕', color: 'from-slate-500 to-gray-600' },
  History: { icon: '📚', color: 'from-yellow-600 to-amber-600' },
  Biography: { icon: '👤', color: 'from-blue-500 to-indigo-500' },
  Science: { icon: '🔬', color: 'from-green-500 to-emerald-500' },
  Technology: { icon: '📱', color: 'from-violet-500 to-purple-500' },
  Startup: { icon: '🚀', color: 'from-pink-500 to-rose-500' },
  Motivation: { icon: '⭐', color: 'from-yellow-400 to-orange-400' },
  Psychology: { icon: '🧠', color: 'from-purple-600 to-pink-600' },
  Database: { icon: '🗄️', color: 'from-cyan-600 to-blue-600' },
  Networking: { icon: '🔗', color: 'from-teal-500 to-cyan-500' },
  'Cyber Security': { icon: '🔒', color: 'from-gray-600 to-gray-800' },
  'AI & Machine Learning': { icon: '🤖', color: 'from-indigo-500 to-purple-500' },
};

const GENRES = CATALOGUE_GENRES.map((name) => ({
  name,
  ...(GENRE_STYLES[name] || { icon: '📘', color: 'from-slate-500 to-slate-700' }),
}));

export const Onboarding = () => {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { updateUser, user } = useAuth();

  // Ensure user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#020713] via-[#0a0f1e] to-[#1a1f3a] flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  const toggleGenre = (genreName) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genreName)) {
        return prev.filter((g) => g !== genreName);
      } else if (prev.length < 5) {
        return [...prev, genreName];
      }
      return prev;
    });
  };

  const handleContinue = async () => {
    if (selectedGenres.length < 2) {
      toast.error('Please select at least 2 genres');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.completeOnboarding({ favoriteGenres: selectedGenres });
      if (res?.data?.success) {
        toast.success('Welcome to LibVerse! 🎉');
        updateUser(res.data.user);
        navigate('/student/dashboard');
      } else {
        setError(res?.data?.message || 'Failed to complete onboarding');
        toast.error(res?.data?.message || 'Failed to complete onboarding');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to complete onboarding';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020713] via-[#0a0f1e] to-[#1a1f3a] flex items-center justify-center p-4">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-500/20 rounded-full"
            initial={{
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
            }}
            animate={{
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-6xl"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
          >
            Welcome to LibVerse 👋
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-slate-300 mb-2"
          >
            Let's personalize your library experience.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-slate-400"
          >
            Choose your favorite genres to receive better book recommendations.
          </motion.p>
        </div>

        {/* Genre Selection */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {GENRES.map((genre, index) => {
              const isSelected = selectedGenres.includes(genre.name);
              return (
                <motion.button
                  key={genre.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.03 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleGenre(genre.name)}
                  className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                    isSelected
                      ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/50'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800/80'
                  }`}
                >
                  {/* Glow effect for selected */}
                  {isSelected && (
                    <motion.div
                      layoutId="glow"
                      className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="text-4xl mb-3">{genre.icon}</div>
                    <h3 className="text-sm font-semibold text-slate-200 mb-1">{genre.name}</h3>

                    {/* Checkmark for selected */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                        >
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Selection Counter & Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <p className="text-slate-400 text-sm">
            {selectedGenres.length === 0 && 'Select at least 2 genres'}
            {selectedGenres.length === 1 && 'Select 1 more genre'}
            {selectedGenres.length >= 2 && selectedGenres.length < 5 && `${selectedGenres.length} genres selected`}
            {selectedGenres.length === 5 && 'Maximum genres selected!'}
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleContinue}
            disabled={selectedGenres.length < 2 || loading}
            className={`px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
              selectedGenres.length >= 2
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/50 cursor-pointer'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              'Continue'
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

