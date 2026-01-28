// src/services/finance/adjustmentService.js
// Service for managing accounting adjustments (returns, refunds, cancellations, etc.)

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Create a new accounting adjustment
 * Used when orders are cancelled, returned, or corrected
 * 
 * @param {Object} adjustmentData - {
 *   type: 'refund|return|cancellation|correction|discount|fee',
 *   amount: number (can be negative for deductions),
 *   orderId: string,
 *   reason: string,
 *   adminNotes: string (optional),
 *   status: 'pending|approved|applied' (optional, defaults to 'approved')
 * }
 * @returns {Promise<Object>} - { success, adjustmentId, error }
 */
export const createAdjustment = async (adjustmentData) => {
  try {
    const {
      type,
      amount,
      orderId,
      reason,
      adminNotes = '',
      status = 'approved'
    } = adjustmentData;

    // Validation
    if (!type || !['refund', 'return', 'cancellation', 'correction', 'discount', 'fee'].includes(type)) {
      return { success: false, error: 'Invalid adjustment type' };
    }

    if (typeof amount !== 'number') {
      return { success: false, error: 'Amount must be a number' };
    }

    if (!orderId || orderId.trim().length === 0) {
      return { success: false, error: 'Order ID is required' };
    }

    if (!reason || reason.trim().length === 0) {
      return { success: false, error: 'Reason is required' };
    }

    const adjustment = {
      type,
      amount,
      orderId,
      reason,
      adminNotes,
      status,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'accounting_adjustments'), adjustment);

    console.log('✅ Adjustment created:', docRef.id);
    return {
      success: true,
      adjustmentId: docRef.id
    };
  } catch (error) {
    console.error('❌ Error creating adjustment:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all accounting adjustments
 * 
 * @returns {Promise<Array>} - Array of adjustment documents with IDs
 */
export const getAllAdjustments = async () => {
  try {
    const q = query(
      collection(db, 'accounting_adjustments'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const adjustments = [];

    snapshot.forEach(doc => {
      adjustments.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return adjustments;
  } catch (error) {
    console.error('❌ Error fetching adjustments:', error);
    return [];
  }
};

/**
 * Get adjustments for a specific order
 * 
 * @param {string} orderId - The order ID to filter by
 * @returns {Promise<Array>} - Array of adjustments for that order
 */
export const getAdjustmentsByOrder = async (orderId) => {
  try {
    const q = query(
      collection(db, 'accounting_adjustments'),
      where('orderId', '==', orderId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const adjustments = [];

    snapshot.forEach(doc => {
      adjustments.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return adjustments;
  } catch (error) {
    console.error('❌ Error fetching adjustments for order:', error);
    return [];
  }
};

/**
 * Get adjustments by type
 * 
 * @param {string} type - The adjustment type (refund, return, cancellation, etc.)
 * @returns {Promise<Array>} - Array of adjustments of that type
 */
export const getAdjustmentsByType = async (type) => {
  try {
    const q = query(
      collection(db, 'accounting_adjustments'),
      where('type', '==', type),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const adjustments = [];

    snapshot.forEach(doc => {
      adjustments.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return adjustments;
  } catch (error) {
    console.error('❌ Error fetching adjustments by type:', error);
    return [];
  }
};

/**
 * Update an existing adjustment
 * 
 * @param {string} adjustmentId - The adjustment document ID
 * @param {Object} updates - Fields to update { reason, adminNotes, status }
 * @returns {Promise<Object>} - { success, error }
 */
export const updateAdjustment = async (adjustmentId, updates) => {
  try {
    const adjustmentRef = doc(db, 'accounting_adjustments', adjustmentId);

    // Only allow updating these fields
    const allowedUpdates = {};
    if (updates.reason) allowedUpdates.reason = updates.reason;
    if (updates.adminNotes) allowedUpdates.adminNotes = updates.adminNotes;
    if (updates.status) allowedUpdates.status = updates.status;

    allowedUpdates.updatedAt = serverTimestamp();

    await updateDoc(adjustmentRef, allowedUpdates);

    console.log('✅ Adjustment updated:', adjustmentId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating adjustment:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete an adjustment
 * 
 * @param {string} adjustmentId - The adjustment document ID
 * @returns {Promise<Object>} - { success, error }
 */
export const deleteAdjustment = async (adjustmentId) => {
  try {
    await deleteDoc(doc(db, 'accounting_adjustments', adjustmentId));

    console.log('✅ Adjustment deleted:', adjustmentId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting adjustment:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Calculate total adjustments for financial reporting
 * 
 * @param {Array} adjustments - Array of adjustment documents
 * @param {string} type - Optional: filter by type
 * @returns {number} - Total adjustment amount
 */
export const calculateTotalAdjustments = (adjustments = [], type = null) => {
  if (!Array.isArray(adjustments)) return 0;

  let total = 0;
  adjustments.forEach(adjustment => {
    // Only count approved adjustments
    if (adjustment.status === 'approved' || adjustment.status === 'applied') {
      if (!type || adjustment.type === type) {
        total += adjustment.amount || 0;
      }
    }
  });

  return total;
};

/**
 * Get adjustment summary for financial analytics
 * 
 * @param {Array} adjustments - Array of adjustment documents
 * @returns {Object} - Summary of adjustments by type
 */
export const getAdjustmentSummary = (adjustments = []) => {
  if (!Array.isArray(adjustments)) return {};

  const summary = {
    refunds: 0,
    returns: 0,
    cancellations: 0,
    corrections: 0,
    discounts: 0,
    fees: 0,
    total: 0
  };

  adjustments.forEach(adjustment => {
    if (adjustment.status === 'approved' || adjustment.status === 'applied') {
      const type = adjustment.type || 'corrections';
      const amount = adjustment.amount || 0;

      if (summary.hasOwnProperty(type)) {
        summary[type] += amount;
      }

      summary.total += amount;
    }
  });

  return summary;
};
