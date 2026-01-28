// src/components/admin/FinanceAdjustments/FinanceAdjustments.jsx
// Component for managing accounting adjustments in the Finance Analytics tab

import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import {
  createAdjustment,
  updateAdjustment,
  deleteAdjustment
} from '../../../services/finance/adjustmentService';
import { toast } from 'react-toastify';
import './FinanceAdjustments.css';

const FinanceAdjustments = ({ adjustments = [], onAdjustmentsChange }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'refund',
    amount: 0,
    orderId: '',
    reason: '',
    adminNotes: '',
    status: 'approved'
  });

  const adjustmentTypes = [
    { value: 'refund', label: 'Refund (Cash back)' },
    { value: 'return', label: 'Return (Goods returned)' },
    { value: 'cancellation', label: 'Cancellation (Order cancelled)' },
    { value: 'correction', label: 'Correction (Data fix)' },
    { value: 'discount', label: 'Discount (Applied discount)' },
    { value: 'fee', label: 'Fee (Additional charge)' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        // Update existing
        const result = await updateAdjustment(editingId, {
          reason: formData.reason,
          adminNotes: formData.adminNotes,
          status: formData.status
        });

        if (result.success) {
          toast.success('Adjustment updated successfully');
          setEditingId(null);
          setShowForm(false);
        } else {
          toast.error('Failed to update adjustment: ' + result.error);
        }
      } else {
        // Create new
        const result = await createAdjustment(formData);

        if (result.success) {
          toast.success('Adjustment created successfully');
          setFormData({
            type: 'refund',
            amount: 0,
            orderId: '',
            reason: '',
            adminNotes: '',
            status: 'approved'
          });
          setShowForm(false);
        } else {
          toast.error('Failed to create adjustment: ' + result.error);
        }
      }

      // Refresh adjustments
      if (onAdjustmentsChange) {
        onAdjustmentsChange();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (adjustment) => {
    setFormData({
      type: adjustment.type,
      amount: adjustment.amount,
      orderId: adjustment.orderId,
      reason: adjustment.reason,
      adminNotes: adjustment.adminNotes || '',
      status: adjustment.status || 'approved'
    });
    setEditingId(adjustment.id);
    setShowForm(true);
  };

  const handleDelete = async (adjustmentId) => {
    if (!window.confirm('Are you sure you want to delete this adjustment?')) {
      return;
    }

    setLoading(true);
    try {
      const result = await deleteAdjustment(adjustmentId);

      if (result.success) {
        toast.success('Adjustment deleted successfully');
        if (onAdjustmentsChange) {
          onAdjustmentsChange();
        }
      } else {
        toast.error('Failed to delete adjustment: ' + result.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const getTypeColor = (type) => {
    const colors = {
      refund: 'bg-red-100 text-red-800',
      return: 'bg-orange-100 text-orange-800',
      cancellation: 'bg-yellow-100 text-yellow-800',
      correction: 'bg-blue-100 text-blue-800',
      discount: 'bg-green-100 text-green-800',
      fee: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="finance-adjustments">
      <div className="adjustments-header">
        <h3>Accounting Adjustments</h3>
        <p className="text-sm text-gray-600">
          Manage refunds, returns, and corrections to keep financial records accurate
        </p>
        <button
          className="btn-new-adjustment"
          onClick={() => {
            setEditingId(null);
            setFormData({
              type: 'refund',
              amount: 0,
              orderId: '',
              reason: '',
              adminNotes: '',
              status: 'approved'
            });
            setShowForm(!showForm);
          }}
        >
          <FiPlus size={18} />
          New Adjustment
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="adjustment-form-container">
          <form onSubmit={handleSubmit} className="adjustment-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Adjustment Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  {adjustmentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Amount (KES) *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Order ID *</label>
                <input
                  type="text"
                  name="orderId"
                  value={formData.orderId}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., ORD-123456"
                  disabled={editingId !== null}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="applied">Applied</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Reason *</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Customer returned goods in person, refund processed..."
                  rows="3"
                />
              </div>

              <div className="form-group full-width">
                <label>Admin Notes (Optional)</label>
                <textarea
                  name="adminNotes"
                  value={formData.adminNotes}
                  onChange={handleInputChange}
                  placeholder="Additional notes for reference..."
                  rows="2"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={loading}
                className="btn-submit"
              >
                {loading ? 'Processing...' : editingId ? 'Update Adjustment' : 'Create Adjustment'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Adjustments List */}
      <div className="adjustments-list">
        {adjustments.length === 0 ? (
          <div className="empty-state">
            <p>No adjustments recorded yet</p>
            <p className="text-sm text-gray-600">Create one when you process returns, refunds, or corrections</p>
          </div>
        ) : (
          <div className="adjustments-table">
            <div className="table-header">
              <div className="col-type">Type</div>
              <div className="col-order">Order ID</div>
              <div className="col-amount">Amount</div>
              <div className="col-reason">Reason</div>
              <div className="col-status">Status</div>
              <div className="col-date">Created</div>
              <div className="col-actions">Actions</div>
            </div>

            {adjustments.map(adjustment => (
              <div key={adjustment.id} className="table-row">
                <div className="col-type">
                  <span className={`badge ${getTypeColor(adjustment.type)}`}>
                    {adjustmentTypes.find(t => t.value === adjustment.type)?.label || adjustment.type}
                  </span>
                </div>
                <div className="col-order">{adjustment.orderId}</div>
                <div className="col-amount">
                  <span className={adjustment.amount < 0 ? 'negative' : 'positive'}>
                    {formatCurrency(adjustment.amount)}
                  </span>
                </div>
                <div className="col-reason" title={adjustment.reason}>
                  {adjustment.reason.substring(0, 50)}...
                </div>
                <div className="col-status">
                  <span className={`status-badge status-${adjustment.status}`}>
                    {adjustment.status || 'approved'}
                  </span>
                </div>
                <div className="col-date">
                  {adjustment.createdAt ? new Date(adjustment.createdAt.toDate?.() || adjustment.createdAt).toLocaleDateString() : 'N/A'}
                </div>
                <div className="col-actions">
                  <button
                    onClick={() => handleEdit(adjustment)}
                    className="btn-action edit"
                    title="Edit"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(adjustment.id)}
                    disabled={loading}
                    className="btn-action delete"
                    title="Delete"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceAdjustments;
