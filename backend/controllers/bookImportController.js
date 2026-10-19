const { analyse, importBooks, ImportError, COLUMNS, GENRES, MAX_ROWS } = require('../services/bookImportService');
const recommendationService = require('../services/recommendationService');
const { audit } = require('../utils/audit');

const fail = (res, error) => {
  if (error instanceof ImportError) return res.status(400).json({ success: false, message: error.message });
  console.error('Book import failed:', error.message);
  return res.status(500).json({ success: false, message: 'The import could not be completed. Try again.' });
};

/**
 * @route POST /api/books/import/preview
 * @desc Check a CSV of books without saving anything: per-row status (ready / error / duplicate)
 *       and problems. Body: { csv: string }
 * @access Private/Staff
 */
exports.previewImport = async (req, res) => {
  try {
    const result = await analyse(req.body?.csv);
    res.status(200).json({ success: true, ...result, columns: { ...result.columns, expected: COLUMNS }, genres: GENRES, maxRows: MAX_ROWS });
  } catch (error) {
    fail(res, error);
  }
};

/**
 * @route POST /api/books/import
 * @desc Add every valid, non-duplicate row of a CSV to the catalogue. Body: { csv: string,
 *       checkCovers?: boolean } (checkCovers looks up each ISBN's cover on Open Library)
 * @access Private/Staff
 */
exports.importBooks = async (req, res) => {
  try {
    const result = await importBooks(req.body?.csv, { checkCovers: req.body?.checkCovers === true });
    if (result.imported > 0) {
      await audit(req, 'book.import', { type: 'System' },
        `Imported ${result.imported} book${result.imported === 1 ? '' : 's'} (${result.copies} cop${result.copies === 1 ? 'y' : 'ies'}) from CSV${result.skipped ? `, ${result.skipped} row${result.skipped === 1 ? '' : 's'} skipped` : ''}`,
        { imported: result.imported, skipped: result.skipped, copies: result.copies, coversFound: result.covers?.found });
      recommendationService.scheduleRetrain();
    }
    res.status(result.imported ? 201 : 200).json({
      success: true,
      message: result.imported
        ? `${result.imported} book${result.imported === 1 ? '' : 's'} added to the catalogue`
        : 'No books were added: every row has a problem or is already in the catalogue',
      ...result,
    });
  } catch (error) {
    fail(res, error);
  }
};
