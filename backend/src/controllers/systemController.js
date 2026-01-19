import { pool } from '../db/connection.js';

/**
 * Check system status for maintenance mode and app version updates
 * GET /api/system/status?version=1.0.0
 */
export const checkSystemStatus = async (req, res) => {
  try {
    const userAppVersion = req.query.version; // e.g., ?version=1.0.0

    // Fetch system settings
    const [rows] = await pool.execute('SELECT * FROM system_settings WHERE id = 1');
    const settings = rows[0];

    if (!settings) {
      return res.json({
        status: 'ok',
        message: 'System operational'
      });
    }

    // 1. Check Maintenance Mode
    if (settings.maintenance_mode) {
      return res.status(503).json({
        type: 'MAINTENANCE',
        status: 'maintenance',
        message: settings.maintenance_message || 'Server is under maintenance',
        come_back_time: settings.maintenance_end_time,
        status_code: 503
      });
    }

    // 2. Check Force Update
    // Simple version comparison (in production, use semver package)
    if (userAppVersion && settings.min_app_version && 
        compareVersions(userAppVersion, settings.min_app_version) < 0) {
      return res.status(426).json({ // 426 = Upgrade Required
        type: 'UPDATE_REQUIRED',
        status: 'update_required',
        message: `Update Required. v${settings.latest_app_version} is live.`,
        latest_version: settings.latest_app_version,
        min_version: settings.min_app_version,
        status_code: 426
      });
    }

    // 3. System Healthy
    res.json({
      status: 'ok',
      message: 'System operational',
      latest_version: settings.latest_app_version,
      privacy_policy_url: settings.privacy_policy_url,
      terms_url: settings.terms_url
    });

  } catch (error) {
    console.error('Error checking system status:', error);
    res.status(500).json({
      type: 'SERVER_ERROR',
      message: 'Failed to check system status',
      error: error.message,
      status_code: 500
    });
  }
};

/**
 * Submit support ticket
 * POST /api/system/support
 * Body: { subject, message, user_id (optional) }
 */
export const submitSupportTicket = async (req, res) => {
  try {
    const { subject, message, priority = 'medium' } = req.body;
    const user_id = req.user?.id || null; // Get from auth token if available

    // Validate required fields
    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required'
      });
    }

    // Insert support ticket
    const [result] = await pool.execute(
      `INSERT INTO support_tickets (user_id, user_guid, subject, message, priority, status) 
       VALUES (?, ?, ?, ?, ?, 'open')`,
      [user_id, req.user?.guid, subject, message, priority]
    );

    res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully',
      ticket_id: result.insertId
    });
  } catch (error) {
    console.error('Error submitting support ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit support ticket',
      error: error.message
    });
  }
};

/**
 * Get support tickets for a user
 * GET /api/system/support/my-tickets
 */
export const getMyTickets = async (req, res) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const [tickets] = await pool.execute(
      `SELECT id, subject, message, status, priority, created_at, updated_at, resolved_at
       FROM support_tickets
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [user_id]
    );

    res.json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
      error: error.message
    });
  }
};

/**
 * Get all support tickets (admin only)
 * GET /api/system/support/all
 */
export const getAllTickets = async (req, res) => {
  try {
    const { status, priority, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT st.*, u.full_name, u.email
      FROM support_tickets st
      LEFT JOIN users u ON st.user_id = u.id
    `;
    
    const conditions = [];
    const params = [];
    
    if (status) {
      conditions.push('st.status = ?');
      params.push(status);
    }
    
    if (priority) {
      conditions.push('st.priority = ?');
      params.push(priority);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY st.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [tickets] = await pool.execute(query, params);

    res.json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    console.error('Error fetching all tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
      error: error.message
    });
  }
};

/**
 * Update support ticket status (admin only)
 * PATCH /api/system/support/:id
 */
export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_to } = req.body;

    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
      
      if (status === 'resolved' || status === 'closed') {
        updates.push('resolved_at = NOW()');
      }
    }

    if (assigned_to) {
      updates.push('assigned_to = ?');
      params.push(assigned_to);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No updates provided'
      });
    }

    params.push(id);
    const query = `UPDATE support_tickets SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      message: 'Ticket updated successfully'
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket',
      error: error.message
    });
  }
};

/**
 * Update system settings (admin only)
 * PUT /api/system/settings
 */
export const updateSystemSettings = async (req, res) => {
  try {
    const {
      maintenance_mode,
      maintenance_end_time,
      maintenance_message,
      min_app_version,
      latest_app_version,
      privacy_policy_url,
      terms_url
    } = req.body;

    const updates = [];
    const params = [];

    if (maintenance_mode !== undefined) {
      updates.push('maintenance_mode = ?');
      params.push(maintenance_mode);
    }
    if (maintenance_end_time) {
      updates.push('maintenance_end_time = ?');
      params.push(maintenance_end_time);
    }
    if (maintenance_message) {
      updates.push('maintenance_message = ?');
      params.push(maintenance_message);
    }
    if (min_app_version) {
      updates.push('min_app_version = ?');
      params.push(min_app_version);
    }
    if (latest_app_version) {
      updates.push('latest_app_version = ?');
      params.push(latest_app_version);
    }
    if (privacy_policy_url) {
      updates.push('privacy_policy_url = ?');
      params.push(privacy_policy_url);
    }
    if (terms_url) {
      updates.push('terms_url = ?');
      params.push(terms_url);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No updates provided'
      });
    }

    const query = `UPDATE system_settings SET ${updates.join(', ')} WHERE id = 1`;
    await pool.execute(query, params);

    res.json({
      success: true,
      message: 'System settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating system settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update system settings',
      error: error.message
    });
  }
};

/**
 * Get system settings (public - limited info)
 * GET /api/system/settings
 */
export const getSystemSettings = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT latest_app_version, privacy_policy_url, terms_url, support_email, support_phone FROM system_settings WHERE id = 1'
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'System settings not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching system settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system settings',
      error: error.message
    });
  }
};

/**
 * Simple version comparison helper
 * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    
    if (part1 < part2) return -1;
    if (part1 > part2) return 1;
  }
  
  return 0;
}

