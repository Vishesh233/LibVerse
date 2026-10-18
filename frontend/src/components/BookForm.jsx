import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { GENRES } from '../constants/genres';
import { booksAPI } from '../services/api';
import { getBookCoverCandidates, DEFAULT_BOOK_COVER } from '../utils/bookCover';

export const BookForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  submitting = false,
  submitLabel = 'Create Book',
  submittingLabel = 'Creating...',
}) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    publisher: '',
    publicationYear: '',
    description: '',
    totalCopies: '',
    availableCopies: '',
    issuedCopies: '',
    rating: '',
    pages: '',
    language: '',
    coverImage: '', // uploaded file or saved cover
    imageUrl: '',   // URL-provided cover
  });
  const [uploadedImage, setUploadedImage] = useState('');
  const [formError, setFormError] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverCandidateIndex, setCoverCandidateIndex] = useState(0);
  const fileInputRef = useRef(null);

  // Helper to safely check if a value is a string (prevents startsWith crash)
  const isString = (value) => typeof value === 'string';

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      const existingCover = initialData.coverImage || '';
      const existingImageUrl = initialData.imageUrl || '';
      // Safely check if it's a data URL - only call startsWith on strings
      const isDataUrl = isString(existingCover) && existingCover.startsWith('data:image/');
      // Also check if it's an uploaded server URL
      const isServerUpload = isString(existingCover) && existingCover.includes('/uploads/');
      // Determine which image takes priority for preview:
      // uploaded cover first, then imageUrl
      const previewImage = existingCover && (isDataUrl || isServerUpload) ? existingCover : '';
      setFormData({
        title: initialData.title || '',
        author: initialData.author || '',
        isbn: initialData.isbn || '',
        genre: initialData.genre || '',
        publisher: initialData.publisher || '',
        publicationYear: initialData.publicationYear
          ? String(initialData.publicationYear)
          : initialData.publishedYear
          ? String(initialData.publishedYear)
          : '',
        description: initialData.description || '',
        totalCopies: String(initialData.totalCopies ?? initialData.availableCopies ?? ''),
        availableCopies: String(initialData.availableCopies ?? initialData.copiesAvailable ?? ''),
        issuedCopies: String(initialData.issuedCopies ?? 0),
        rating: initialData.rating ? String(initialData.rating) : '',
        pages: initialData.pages ? String(initialData.pages) : '',
        language: initialData.language || '',
        coverImage: existingCover,
        imageUrl: existingImageUrl,
      });
      setUploadedImage(previewImage);
      setFormError('');
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  // Handle URL input for cover image - stores in imageUrl field
  const handleCoverUrlChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      imageUrl: value,
    }));
    // Clear uploaded image flag when typing in URL field
    if (uploadedImage) {
      setUploadedImage('');
    }
    setFormError('');
  };

  // Upload image file to server via /books/upload-cover endpoint
  const handleFileUpload = useCallback(async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type || !file.type.startsWith('image/')) {
      setFormError('Please upload an image file only');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image must be less than 5MB');
      return;
    }

    setUploadingCover(true);
    setFormError('');

    try {
      const formData = new FormData();
      formData.append('coverImage', file);

      const res = await booksAPI.uploadCover(formData);

      if (res.data && res.data.success && res.data.coverUrl) {
        const coverUrl = res.data.coverUrl;
        // Show preview immediately
        setUploadedImage(coverUrl);
        setFormData((prev) => ({ ...prev, coverImage: coverUrl }));
        setFormError('');
      } else {
        setFormError(res.data?.message || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Cover upload error:', err);
      setFormError(err.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploadingCover(false);
    }
  }, []);

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Server upload flow - handles validation, upload, preview, and errors internally
      handleFileUpload(file);
    }
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    setUploadedImage('');
    setFormData((prev) => ({ ...prev, coverImage: '', imageUrl: '' }));
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    // Validate required fields
    const required = [
      ['title', 'Book Title'],
      ['author', 'Author'],
      ['isbn', 'ISBN'],
      ['genre', 'Category'],
      ['description', 'Description'],
      ['totalCopies', 'Total Copies'],
    ];
    for (const [field, label] of required) {
      if (!formData[field] || String(formData[field]).trim() === '') {
        setFormError(`Please fill in ${label}`);
        return;
      }
    }

    if (parseInt(formData.totalCopies, 10) < 1) {
      setFormError('Total Copies must be at least 1');
      return;
    }

    const submitData = {
      title: formData.title.trim(),
      author: formData.author.trim(),
      isbn: formData.isbn.trim(),
      genre: formData.genre,
      publisher: formData.publisher.trim(),
      publicationYear: formData.publicationYear ? parseInt(formData.publicationYear, 10) : undefined,
      description: formData.description.trim(),
      totalCopies: parseInt(formData.totalCopies, 10),
      availableCopies: formData.availableCopies ? parseInt(formData.availableCopies, 10) : undefined,
      issuedCopies: formData.issuedCopies ? parseInt(formData.issuedCopies, 10) : undefined,
      rating: formData.rating === '' ? 0 : parseFloat(formData.rating),
      pages: formData.pages ? parseInt(formData.pages, 10) : undefined,
      language: formData.language || undefined,
      coverImage: formData.coverImage,
      imageUrl: formData.imageUrl || undefined,
    };

    onSubmit(submitData);
  };

  // Build candidate list for preview using the proper fallback chain:
  // 1. Uploaded image preview (formData.coverImage when it's a data URL or server upload)
  // 2. Image URL preview (formData.imageUrl)
  // 3. Existing saved cover (formData.coverImage from initialData)
  // 4. OpenLibrary ISBN cover
  // 5. Default placeholder (inline SVG, never breaks)
  const coverCandidates = useMemo(() => {
    const bookForCover = {
      coverImage: uploadedImage || formData.coverImage,
      imageUrl: formData.imageUrl,
      isbn: formData.isbn,
    };
    return getBookCoverCandidates(bookForCover);
  }, [uploadedImage, formData.coverImage, formData.imageUrl, formData.isbn]);

  // Reset candidate index when coverImage, imageUrl or isbn changes
  useEffect(() => {
    setCoverCandidateIndex(0);
  }, [formData.coverImage, formData.imageUrl, formData.isbn]);

  const previewSrc = coverCandidates[coverCandidateIndex] || DEFAULT_BOOK_COVER;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
          <span className="flex items-center gap-2 text-sm text-rose-300">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {formError}
          </span>
          <button
            type="button"
            onClick={() => setFormError('')}
            className="text-rose-300 hover:text-rose-100 transition-colors"
            aria-label="Dismiss error"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-8">
        {/* Image Preview & Upload */}
        <div className="space-y-4">
          <div className="card p-4">
            <label className="block text-sm font-semibold text-slate-300 mb-3">Book Cover</label>

            <div className="flex justify-center">
              <div className="relative">
                <div className="h-64 w-44 overflow-hidden rounded-2xl bg-input border border-border shadow-glow">
                  <img
                    src={previewSrc}
                    alt="Book cover preview"
                    onError={() => {
                      if (coverCandidateIndex < coverCandidates.length - 1) {
                        setCoverCandidateIndex((i) => i + 1);
                      }
                    }}
                    className="h-full w-full object-cover"
                  />
                </div>

                {(formData.coverImage || formData.imageUrl) && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    title="Remove image"
                    className="absolute -top-2 -right-2 grid h-8 w-8 place-items-center rounded-full bg-rose-500/90 text-white shadow-lg transition-all hover:bg-rose-600 hover:scale-110"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingCover || submitting}
              className="mt-4 w-full rounded-xl border border-dashed border-indigo-500/40 bg-indigo-500/5 px-4 py-3 text-sm font-semibold text-indigo-300 transition-all hover:border-indigo-500/70 hover:bg-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                {uploadingCover ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Upload Book Cover
                  </>
                )}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <p className="mt-2 text-center text-xs text-slate-500">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Book Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter book title"
              className="w-full input-amo"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Author <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Enter author name"
              className="w-full input-amo"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              ISBN <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              placeholder="Enter ISBN"
              className="w-full input-amo"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Category <span className="text-rose-400">*</span>
            </label>
            <select
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className="w-full input-amo"
              disabled={submitting}
            >
              <option value="">Select a category</option>
              {GENRES.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Publisher
            </label>
            <input
              type="text"
              name="publisher"
              value={formData.publisher}
              onChange={handleChange}
              placeholder="Enter publisher name"
              className="w-full input-amo"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Published Year
            </label>
            <input
              type="number"
              name="publicationYear"
              value={formData.publicationYear}
              onChange={handleChange}
              placeholder="e.g. 2024"
              min="1000"
              max="2100"
              className="w-full input-amo"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Total Copies <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              name="totalCopies"
              value={formData.totalCopies}
              onChange={handleChange}
              placeholder="Enter number of copies"
              min="1"
              className="w-full input-amo"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Available Copies
            </label>
            <input
              type="number"
              name="availableCopies"
              value={formData.availableCopies}
              onChange={handleChange}
              placeholder="Enter available copies"
              min="0"
              className="w-full input-amo"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Issued Copies
            </label>
            <input
              type="number"
              name="issuedCopies"
              value={formData.issuedCopies}
              onChange={handleChange}
              placeholder="Enter issued copies"
              min="0"
              className="w-full input-amo"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Rating (0-5)
            </label>
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              placeholder="e.g. 4.5"
              min="0"
              max="5"
              step="0.1"
              className="w-full input-amo"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Pages
            </label>
            <input
              type="number"
              name="pages"
              value={formData.pages}
              onChange={handleChange}
              placeholder="e.g. 350"
              min="1"
              className="w-full input-amo"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Language
            </label>
            <input
              type="text"
              name="language"
              value={formData.language}
              onChange={handleChange}
              placeholder="e.g. English"
              className="w-full input-amo"
              disabled={submitting}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Image URL <span className="text-slate-500">(optional)</span>
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl || ''}
              onChange={handleCoverUrlChange}
              placeholder="https://example.com/book-cover.jpg"
              className="w-full input-amo"
              disabled={submitting || uploadingCover}
            />
            <p className="text-xs text-slate-500 mt-1">
              Enter a URL or upload a cover image above. The preview updates as you type.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter a meaningful description of the book..."
              rows="5"
              className="w-full input-amo resize-none"
              disabled={submitting}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? submittingLabel : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-6 rounded-xl border border-border bg-slate-800/80 text-slate-300 font-semibold transition-all hover:bg-slate-700 hover:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};