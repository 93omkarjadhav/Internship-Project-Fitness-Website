import { pool } from '../db/connection.js';
import crypto from 'crypto';

// @route   GET /api/referrals/code
// @desc    Get (or generate) user's unique referral code
export const getReferralCode = async (req, res) => {
  try {
    // 1. Check if user already has a code in the 'users' table
    const [users] = await pool.query(
      'SELECT referral_code, full_name FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    if (user.referral_code) {
      // Get referral stats
      const [stats] = await pool.query(
        `SELECT 
          COUNT(*) as totalInvites,
          SUM(CASE WHEN status = 'joined' THEN 1 ELSE 0 END) as successfulInvites,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingInvites
        FROM user_referrals
        WHERE referrer_user_id = ?`,
        [req.user.id]
      );

      // Return existing code with stats
      return res.json({
        code: user.referral_code,
        totalInvites: stats[0]?.totalInvites || 0,
        successfulInvites: stats[0]?.successfulInvites || 0,
        pendingInvites: stats[0]?.pendingInvites || 0,
      });
    }

    // 2. If NO code, generate a new unique one
    const namePart = user.full_name
      ? user.full_name.replace(/\s/g, '').substring(0, 4).toUpperCase()
      : 'USER';

    const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();
    const newCode = `${namePart}${randomPart}`;

    // 3. Save it to the database
    await pool.query('UPDATE users SET referral_code = ? WHERE id = ?', [
      newCode,
      req.user.id,
    ]);

    // 4. Return the new code
    res.json({
      code: newCode,
      totalInvites: 0,
      successfulInvites: 0,
      pendingInvites: 0,
    });
  } catch (err) {
    console.error('Error in getReferralCode:', err);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @route   GET /api/referrals/contacts
// @desc    Get list of contacts
export const getContacts = async (req, res) => {
  try {
    const [contacts] = await pool.query(
      'SELECT * FROM user_contacts WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(contacts);
  } catch (err) {
    console.error('Error in getContacts:', err);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @route   POST /api/referrals/contacts/invite/:contactId
// @desc    Invite a specific contact
export const inviteContact = async (req, res) => {
  try {
    // Update contact status
    const [result] = await pool.query(
      'UPDATE user_contacts SET is_invited = true, invited_at = NOW() WHERE id = ? AND user_id = ?',
      [req.params.contactId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Get contact details
    const [contacts] = await pool.query(
      'SELECT contact_name, contact_phone, contact_email FROM user_contacts WHERE id = ?',
      [req.params.contactId]
    );

    if (contacts && contacts.length > 0) {
      const contact = contacts[0];
      
      // Create referral record
      await pool.query(
        'INSERT INTO user_referrals (referrer_user_id, referrer_user_guid, referred_contact_name, referred_contact_phone, referred_contact_email, status) VALUES (?, ?, ?, ?, ?, ?)',
        [
          req.user.id,
          req.user.guid,
          contact.contact_name,
          contact.contact_phone,
          contact.contact_email,
          'pending',
        ]
      );
    }

    res.json({ msg: 'Invitation sent!' });
  } catch (err) {
    console.error('Error in inviteContact:', err);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @route   POST /api/referrals/contacts/add
// @desc    Manually add a new contact
export const addContact = async (req, res) => {
  const { name, phone, email } = req.body;

  console.log('📞 Add Contact Request:', {
    userId: req.user?.id,
    name,
    phone,
    email: email || 'not provided',
  });

  if (!name || !phone) {
    console.log('❌ Validation failed: Missing required fields');
    return res.status(400).json({ error: 'Name and phone are required' });
  }

  if (!req.user || !req.user.id) {
    console.log('❌ Authentication failed: No user ID in request');
    return res.status(401).json({ error: 'Unauthorized - Please sign in again' });
  }

  try {
    // Check if contact already exists
    const [existing] = await pool.query(
      'SELECT id FROM user_contacts WHERE user_id = ? AND contact_phone = ?',
      [req.user.id, phone]
    );

    if (existing && existing.length > 0) {
      console.log('⚠️  Contact already exists:', phone);
      return res.status(400).json({ error: 'Contact already exists' });
    }

    // Add new contact
    const [result] = await pool.query(
      'INSERT INTO user_contacts (user_id, user_guid, contact_name, contact_phone, contact_email) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, req.user.guid, name, phone, email || null]
    );

    console.log('✅ Contact added successfully:', { contactId: result.insertId, name, phone });
    res.json({ msg: 'Contact added successfully', contactId: result.insertId });
  } catch (err) {
    console.error('❌ Error in addContact:', err.message);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ error: 'Server Error: ' + err.message });
  }
};

// @route   POST /api/referrals/validate
// @desc    Validate and apply referral code during signup
export const validateReferralCode = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Referral code is required' });
  }

  try {
    // Find the referrer by code
    const [users] = await pool.query(
      'SELECT id, full_name FROM users WHERE referral_code = ?',
      [code.toUpperCase()]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'Invalid referral code' });
    }

    res.json({
      valid: true,
      referrer_name: users[0].full_name,
      referrer_id: users[0].id,
    });
  } catch (err) {
    console.error('Error in validateReferralCode:', err);
    res.status(500).json({ error: 'Server Error' });
  }
};

