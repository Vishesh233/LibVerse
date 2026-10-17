import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { authAPI } from '../../services/api';
import { Button } from '../UI';
import { GENRES, genreAccentStyle } from '../../constants/genres';
import { CheckIcon } from './ProfileIcons';

// Same limits as PUT /api/auth/update-favorite-genres
const MIN_GENRES = 2;
const MAX_GENRES = 5;

const sameSet = (a, b) => a.length === b.length && a.every((g) => b.includes(g));

/** Student reading preferences: pick 2-5 of the catalogue genres */
export const PreferencesTab = ({ user, onUserChange }) => {
  const savedGenres = user?.favoriteGenres || [];
  const [selected, setSelected] = useState(savedGenres);
  const [saving, setSaving] = useState(false);

  const dirty = !sameSet(selected, savedGenres);
  useEffect(() => {
    if (!dirty) setSelected(user?.favoriteGenres || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.favoriteGenres]);

  const count = selected.length;
  const atMax = count >= MAX_GENRES;
  const valid = count >= MIN_GENRES && count <= MAX_GENRES;

  const toggle = (genre) =>
    setSelected((prev) => {
      if (prev.includes(genre)) return prev.filter((g) => g !== genre);
      return prev.length < MAX_GENRES ? [...prev, genre] : prev;
    });

  const handleSave = async () => {
    if (!valid || !dirty) return;
    setSaving(true);
    try {
      const res = await authAPI.updateFavoriteGenres({ favoriteGenres: selected });
      onUserChange(res.data.user);
      toast.success('Reading preferences saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save reading preferences');
    } finally {
      setSaving(false);
    }
  };

  const status =
    count < MIN_GENRES
      ? `Pick ${MIN_GENRES - count} more to save (choose ${MIN_GENRES}-${MAX_GENRES})`
      : atMax
      ? `${count} of ${MAX_GENRES} selected - that's the maximum`
      : `${count} of ${MAX_GENRES} selected`;

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-400">
        Choose {MIN_GENRES} to {MAX_GENRES} genres you enjoy. Your dashboard recommendations are built from them.
      </p>

      <div role="group" aria-labelledby="genres-heading" aria-describedby="genres-status" className="flex flex-wrap gap-2">
        <h3 id="genres-heading" className="sr-only">Favourite genres</h3>
        {GENRES.map((genre) => {
          const isOn = selected.includes(genre);
          const blocked = !isOn && atMax;
          return (
            <button
              key={genre}
              type="button"
              aria-pressed={isOn}
              disabled={blocked}
              onClick={() => toggle(genre)}
              style={genreAccentStyle(genre)}
              className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                isOn
                  ? 'border-[rgb(var(--genre-accent)/0.55)] bg-[rgb(var(--genre-accent)/0.16)] text-white'
                  : 'border-border bg-input/60 text-slate-300 hover:border-[rgb(var(--genre-accent)/0.45)] hover:text-white'
              }`}
            >
              <span
                className={`grid h-4 w-4 place-items-center rounded-full ${isOn ? 'bg-[rgb(var(--genre-accent))] text-slate-950' : 'border border-[rgb(var(--genre-accent)/0.6)]'}`}
                aria-hidden="true"
              >
                {isOn && <CheckIcon className="h-3 w-3" strokeWidth={3} />}
              </span>
              {genre}
            </button>
          );
        })}
      </div>

      <p id="genres-status" aria-live="polite" className={`text-xs ${count < MIN_GENRES ? 'text-amber-300' : 'text-slate-400'}`}>
        {status}
      </p>

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" fullWidth={false} onClick={() => setSelected(savedGenres)} disabled={!dirty || saving} className="sm:min-w-[120px]">
          Cancel
        </Button>
        <Button type="button" variant="primary" fullWidth={false} onClick={handleSave} loading={saving} disabled={!dirty || !valid} className="sm:min-w-[140px]">
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
};

export default PreferencesTab;
