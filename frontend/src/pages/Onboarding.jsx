import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { GENRES as CATALOGUE_GENRES } from '../constants/genres';
import { LogoMark } from '../components/LogoMark';

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
            className="absolute w-2 h-2 bg-indigo-400/20 rounded-full"
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
        <div className="text-center mb-10">
          <div className="mb-6 flex justify-center">
            <LogoMark size="md" />
          </div>
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-slate-50"
          >
            Welcome to <span className="brand-wordmark">Lib<span className="brand-wordmark-accent">Verse</span></span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg sm:text-xl text-slate-300 mb-2"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
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
                  type="button"
                  onClick={() => toggleGenre(genre.name)}
                  aria-pressed={isSelected}
                  disabled={!isSelected && selectedGenres.length >= 5}
                  className={`relative p-4 sm:p-6 rounded-2xl border transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
                    isSelected
                      ? 'border-cyan-400/70 bg-indigo-500/15 shadow-glow-accent'
                      : 'border-border bg-surface/70 hover:border-indigo-500/40 hover:bg-surface-raised'
                  }`}
                >
                  {/* Glow effect for selected */}
                  {isSelected && (
                    <motion.div
                      layoutId="glow"
                      className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-cyan-400/10 rounded-2xl blur-xl"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="text-3xl sm:text-4xl mb-2 sm:mb-3" aria-hidden="true">{genre.icon}</div>
                    <h3 className="text-sm font-semibold text-slate-200 mb-1">{genre.name}</h3>

                    {/* Checkmark for selected */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          className="absolute top-2 right-2 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center"
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
            role="alert"
            className="mb-6 p-4 bg-rose-500/10 border border-rose-500/40 rounded-xl text-rose-200 text-center"
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
          <p className="text-slate-400 text-sm" aria-live="polite">
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
            className="btn-primary !min-h-[52px] !px-12 !text-base disabled:cursor-not-allowed"
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

