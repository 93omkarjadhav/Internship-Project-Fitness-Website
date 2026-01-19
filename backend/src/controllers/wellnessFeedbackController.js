import { pool } from '../db/connection.js';

export const submitFeedback = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { rating, feedback } = req.body;

    if (!rating || !feedback) {
      return res
        .status(400)
        .json({ message: 'Rating and feedback text are required.' });
    }

    await pool.query('INSERT INTO user_feedback SET ?', [
      {
        user_id: userId,
        user_guid: req.user?.guid,
        rating: parseInt(rating, 10),
        feedback_text: feedback,
      },
    ]);

    res.json({ message: 'Feedback submitted successfully.' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getHelpArticles = async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM help_articles ORDER BY id ASC');
    res.json(
      rows.length > 0
        ? rows
        : [{ id: 1, title: 'No help articles yet', content: 'Please check back soon.' }]
    );
  } catch (error) {
    console.error('Error fetching help articles:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

