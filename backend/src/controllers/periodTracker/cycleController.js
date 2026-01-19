import Cycle from '../../models/periodTracker/Cycle.js';
import Symptom from '../../models/periodTracker/Symptom.js';
import { pool } from '../../db/connection.js';

export const createCycle = async (req, res) => {
  try {
    // Get authenticated user ID from middleware
    const userId = req.user?.id || 1;
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      // Create default user if it doesn't exist
      await pool.query(`
        INSERT INTO users (id, email, password_hash, full_name, created_at)
        VALUES (?, 'default@fitfare.com', '$2a$10$dummyhash', 'Default User', NOW())
      `, [userId]);
      console.log('✅ Created default user on-the-fly');
    }

    // Calculate period length (inclusive of both start and end dates)
    let periodLength = null;
    if (req.body.period_start_date && req.body.period_end_date) {
      const startDate = new Date(req.body.period_start_date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(req.body.period_end_date);
      endDate.setHours(0, 0, 0, 0);
      const diffTime = endDate.getTime() - startDate.getTime();
      // Calculate exact days including both start and end date
      // Nov 4 to Nov 7 = 4 days (4, 5, 6, 7)
      periodLength = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    // Calculate cycle_length from previous cycle
    let cycleLength = null;
    const previousCycles = await Cycle.getAllByUser(userId);
    if (previousCycles.length > 0) {
      const lastCycle = previousCycles[0];
      if (lastCycle.period_start_date) {
        const lastStartDate = new Date(lastCycle.period_start_date);
        lastStartDate.setHours(0, 0, 0, 0);
        const currentStartDate = new Date(req.body.period_start_date);
        currentStartDate.setHours(0, 0, 0, 0);
        const diffTime = currentStartDate.getTime() - lastStartDate.getTime();
        // Calculate exact days between periods (not including the start day)
        const daysDiff = Math.round(diffTime / (1000 * 60 * 60 * 24));

        // Only use positive values; ignore if user logs an earlier date
        if (daysDiff > 0) {
          cycleLength = daysDiff;

          // Update the previous cycle's cycle_length if it wasn't set
          if (!lastCycle.cycle_length && cycleLength > 0) {
            await pool.query(
              'UPDATE cycles SET cycle_length = ? WHERE id = ?',
              [cycleLength, lastCycle.id]
            );
          }
        }
      }
    }

    const cycleData = {
      user_id: userId,
      user_guid: req.user?.guid,
      period_start_date: req.body.period_start_date,
      period_end_date: req.body.period_end_date || null,
      flow_intensity: req.body.flow_intensity || null,
      fluid_type: req.body.fluid_type || null,
      notes: req.body.notes || null,
      period_length: periodLength,
      cycle_length: cycleLength,
    };

    const cycle = await Cycle.create(cycleData);

    // Add symptoms if provided
    if (req.body.symptoms && Array.isArray(req.body.symptoms) && req.body.symptoms.length > 0) {
      for (const symptom of req.body.symptoms) {
        try {
          await Symptom.create({
            user_id: userId,
            user_guid: req.user?.guid,
            cycle_id: cycle.id,
            symptom_type: symptom,
            severity: 'mild',
            date: req.body.period_start_date,
          });
        } catch (symptomError) {
          console.error(`Error creating symptom ${symptom}:`, symptomError);
        }
      }
    }

    // Create/update prediction for next period
    try {
      const stats = await Cycle.getStatistics(userId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const cycleLengthToUse = cycleLength || stats.avg_cycle_length || 28;
      const nextPeriodDate = new Date(req.body.period_start_date);
      nextPeriodDate.setDate(nextPeriodDate.getDate() + Math.round(cycleLengthToUse));
      
      // Calculate ovulation (typically 14 days before next period)
      const ovulationDate = new Date(nextPeriodDate);
      ovulationDate.setDate(ovulationDate.getDate() - 14);
      
      // Fertile window (5 days: 2 days before ovulation to 2 days after)
      const fertileStart = new Date(ovulationDate);
      fertileStart.setDate(fertileStart.getDate() - 2);
      const fertileEnd = new Date(ovulationDate);
      fertileEnd.setDate(fertileEnd.getDate() + 2);

      // Check if prediction exists for this user
      const [existingPred] = await pool.query(
        'SELECT * FROM predictions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
        [userId]
      );

      if (existingPred.length > 0) {
        // Update existing prediction
        await pool.query(
          `UPDATE predictions SET 
            next_period_date = ?, 
            ovulation_date = ?, 
            fertile_window_start = ?, 
            fertile_window_end = ?,
            confidence_score = 0.98,
            updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [
            nextPeriodDate.toISOString().split('T')[0],
            ovulationDate.toISOString().split('T')[0],
            fertileStart.toISOString().split('T')[0],
            fertileEnd.toISOString().split('T')[0],
            existingPred[0].id
          ]
        );
      } else {
        // Create new prediction
        await pool.query(
          `INSERT INTO predictions 
            (user_id, user_guid, next_period_date, ovulation_date, fertile_window_start, fertile_window_end, confidence_score)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            req.user?.guid,
            nextPeriodDate.toISOString().split('T')[0],
            ovulationDate.toISOString().split('T')[0],
            fertileStart.toISOString().split('T')[0],
            fertileEnd.toISOString().split('T')[0],
            0.98
          ]
        );
      }
    } catch (predError) {
      console.error('Error creating/updating prediction:', predError);
      // Don't fail the cycle creation if prediction fails
    }

    // Fetch cycle with symptoms
    const cycleWithSymptoms = await Cycle.getById(cycle.id);
    const cycleSymptoms = await Symptom.getByCycle(cycle.id);

    res.status(201).json({
      success: true,
      message: 'Cycle logged successfully',
      data: {
        ...cycleWithSymptoms,
        symptoms: cycleSymptoms,
      },
    });
  } catch (error) {
    console.error('Error creating cycle:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
    });
    res.status(500).json({
      success: false,
      message: 'Error creating cycle',
      error: error.sqlMessage || error.message || 'Unknown error occurred',
    });
  }
};

export const getAllCycles = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const cycles = await Cycle.getRecentWithSymptoms(userId, 50);

    res.json({
      success: true,
      data: cycles,
    });
  } catch (error) {
    console.error('Error fetching cycles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cycles',
      error: error.message,
    });
  }
};

export const getCycleById = async (req, res) => {
  try {
    const { id } = req.params;
    const cycle = await Cycle.getById(id);

    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: 'Cycle not found',
      });
    }

    // Get symptoms for this cycle
    const symptoms = await Symptom.getByCycle(id);

    res.json({
      success: true,
      data: {
        ...cycle,
        symptoms,
      },
    });
  } catch (error) {
    console.error('Error fetching cycle:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cycle',
      error: error.message,
    });
  }
};

export const updateCycle = async (req, res) => {
  try {
    const { id } = req.params;
    const cycle = await Cycle.update(id, req.body);

    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: 'Cycle not found',
      });
    }

    res.json({
      success: true,
      message: 'Cycle updated successfully',
      data: cycle,
    });
  } catch (error) {
    console.error('Error updating cycle:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating cycle',
      error: error.message,
    });
  }
};

export const deleteCycle = async (req, res) => {
  try {
    const { id } = req.params;
    const cycle = await Cycle.delete(id);

    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: 'Cycle not found',
      });
    }

    res.json({
      success: true,
      message: 'Cycle deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting cycle:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting cycle',
      error: error.message,
    });
  }
};

export const getCycleStatistics = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const stats = await Cycle.getStatistics(userId);
    const commonSymptoms = await Symptom.getMostCommon(userId, 10);

    res.json({
      success: true,
      data: {
        ...stats,
        common_symptoms: commonSymptoms,
      },
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message,
    });
  }
};

export const getCycleInsights = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const cycles = await Cycle.getAllByUser(userId);
    const stats = await Cycle.getStatistics(userId);
    const symptoms = await Symptom.getStatistics(userId);

    // Get previous cycle data for insights.
    // We want to ALWAYS give the user a meaningful number (no 0, no --)
    // as long as at least one cycle exists.
    let previousCycleLength = null;
    let previousPeriodLength = null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (cycles.length > 0) {
      const currentCycle = cycles[0];
      const prevCycle = cycles.length > 1 ? cycles[1] : cycles[0];

      // 1) Previous Cycle Length
      // Prefer stored positive cycle_length if available
      if (prevCycle.cycle_length && prevCycle.cycle_length > 0) {
        previousCycleLength = prevCycle.cycle_length;
      } else {
        // Otherwise derive from dates:
        // if we have two cycles, use days between their start dates.
        if (cycles.length > 1 && currentCycle.period_start_date && prevCycle.period_start_date) {
          const currentStart = new Date(currentCycle.period_start_date);
          const prevStart = new Date(prevCycle.period_start_date);
          currentStart.setHours(0, 0, 0, 0);
          prevStart.setHours(0, 0, 0, 0);
          const diffTime = currentStart.getTime() - prevStart.getTime();
          const days = Math.round(diffTime / (1000 * 60 * 60 * 24));
          if (days > 0) {
            previousCycleLength = days;
          }
        }

        // If still null and we only have one cycle, use days since that cycle started.
        if (previousCycleLength === null && prevCycle.period_start_date) {
          const prevStart = new Date(prevCycle.period_start_date);
          prevStart.setHours(0, 0, 0, 0);
          const diffTime = today.getTime() - prevStart.getTime();
          const days = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
          previousCycleLength = days;
        }
      }

      // 2) Previous Period Length
      // Always recalculate from actual dates to ensure accuracy
      // Only use stored period_length if it's valid (3-14 days) and dates are not available
      if (prevCycle.period_start_date) {
        const prevStart = new Date(prevCycle.period_start_date);
        prevStart.setHours(0, 0, 0, 0);

        // If we have an end date, use it (inclusive)
        if (prevCycle.period_end_date) {
          const prevEnd = new Date(prevCycle.period_end_date);
          prevEnd.setHours(0, 0, 0, 0);
          const diffTime = prevEnd.getTime() - prevStart.getTime();
          const days = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
          // Validate: period length should be between 1-14 days (reasonable range)
          if (days >= 1 && days <= 14) {
            previousPeriodLength = days;
          } else {
            // Invalid period length - ignore stored value and recalculate
            previousPeriodLength = null;
          }
        } else {
          // If no end date, use days so far in this period (up to today)
          const diffTime = today.getTime() - prevStart.getTime();
          const days = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
          // Only use if reasonable (not more than 14 days)
          if (days <= 14) {
            previousPeriodLength = days;
          } else {
            previousPeriodLength = null;
          }
        }
      } else if (prevCycle.period_length && prevCycle.period_length > 0 && prevCycle.period_length <= 14) {
        // Fallback: only use stored value if it's valid (1-14 days)
        previousPeriodLength = prevCycle.period_length;
      }
    }

    // Calculate insights with proper null handling
    const insights = {
      avg_cycle_length: stats.avg_cycle_length ? Math.round(stats.avg_cycle_length) : null,
      avg_period_length: stats.avg_period_length ? Math.round(stats.avg_period_length) : null,
      previous_cycle_length: previousCycleLength,
      previous_period_length: previousPeriodLength,
      total_cycles: stats.total_cycles || 0,
      regularity: calculateRegularity(cycles),
      most_common_symptoms: symptoms || [],
      recent_cycles: cycles.slice(0, 5),
    };

    res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching insights',
      error: error.message,
    });
  }
};

// Dashboard endpoint - get current cycle status and next period prediction
export const getDashboard = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    
    // Get the most recent cycle
    const cycles = await Cycle.getAllByUser(userId);
    const stats = await Cycle.getStatistics(userId);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let nextPeriodDays = 0;
    let nextPeriodDate = null;
    let currentCycleDay = 0;
    let currentCycle = null;
    let avgCycleLength = stats.avg_cycle_length || 28;
    
    if (cycles.length > 0) {
      currentCycle = cycles[0];
      const lastPeriodStart = new Date(currentCycle.period_start_date);
      lastPeriodStart.setHours(0, 0, 0, 0);
      
      // Calculate current cycle day (day 1 is the start date)
      const diffTime = today.getTime() - lastPeriodStart.getTime();
      currentCycleDay = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);
      
      // Calculate next period date
      // Use cycle_length if available and positive, otherwise use average cycle length
      const cycleLengthToUse = currentCycle.cycle_length && currentCycle.cycle_length > 0
        ? currentCycle.cycle_length
        : avgCycleLength;
      const nextPeriod = new Date(lastPeriodStart);
      nextPeriod.setDate(nextPeriod.getDate() + Math.round(cycleLengthToUse));
      nextPeriodDate = nextPeriod;
      
      // Calculate days until next period (exact calculation)
      const daysDiff = nextPeriodDate.getTime() - today.getTime();
      nextPeriodDays = Math.max(0, Math.round(daysDiff / (1000 * 60 * 60 * 24)));
    }
    
    // Get cycle insights - only use completed cycles
    const completedCycles = cycles.filter(c => c.cycle_length !== null && c.cycle_length > 0);
    const insights = {
      previous_cycle_length: completedCycles.length > 0 && completedCycles[0].cycle_length ? completedCycles[0].cycle_length : null,
      previous_period_length: completedCycles.length > 0 && completedCycles[0].period_length ? completedCycles[0].period_length : null,
    };
    
    res.json({
      success: true,
      data: {
        next_period_days: nextPeriodDays,
        next_period_date: nextPeriodDate ? nextPeriodDate.toISOString().split('T')[0] : null,
        current_cycle_day: currentCycleDay,
        current_cycle: currentCycle,
        avg_cycle_length: Math.round(avgCycleLength),
        avg_period_length: Math.round(stats.avg_period_length || 5),
        insights: insights,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message,
    });
  }
};

// Helper function to calculate regularity
function calculateRegularity(cycles) {
  if (cycles.length < 2) return 'Normal';
  
  const cycleLengths = cycles
    .filter((c) => c.cycle_length)
    .map((c) => c.cycle_length);

  if (cycleLengths.length === 0) return 'Normal';

  const avg = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
  const variance = cycleLengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / cycleLengths.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev < 3) return 'Regular';
  if (stdDev < 7) return 'Normal';
  return 'Irregular';
}


