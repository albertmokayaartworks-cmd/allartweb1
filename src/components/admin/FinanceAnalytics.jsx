import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiDollarSign, FiShoppingCart, FiUsers, FiDownload, FiBarChart2, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useNotifications } from '../../context/NotificationContext';
import FinanceAdjustments from './FinanceAdjustments/FinanceAdjustments';
import { getAllAdjustments, calculateTotalAdjustments } from '../../services/finance/adjustmentService';

const FinanceAnalytics = ({ orders = [], products = [] }) => {
  const { addNotification } = useNotifications();
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    totalCommission: 0,
    totalProfit: 0,
    sellerPayouts: 0,
    totalAdjustments: 0,
    adjustedRevenue: 0,
    monthlyRevenue: [],
    orderStats: {
      total: 0,
      completed: 0,
      pending: 0,
      processing: 0,
      cancelled: 0,
      returned: 0
    },
    topProducts: []
  });
  const [adjustments, setAdjustments] = useState([]);
  const [loadingAdjustments, setLoadingAdjustments] = useState(false);

  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const currencySymbol = 'KES';
  const commissionRate = 0.04;

  useEffect(() => {
    calculateFinancials();
    fetchAdjustments();
  }, [orders, products, selectedPeriod]);

  const fetchAdjustments = async () => {
    try {
      setLoadingAdjustments(true);
      const data = await getAllAdjustments();
      setAdjustments(data);
    } catch (error) {
      console.error('Error fetching adjustments:', error);
      addNotification('Failed to load adjustments', 'error');
    } finally {
      setLoadingAdjustments(false);
    }
  };

  const filterOrdersByPeriod = (orders) => {
    if (selectedPeriod === 'all') return orders;

    const now = new Date();
    const daysAgo = selectedPeriod === 'week' ? 7 : 30;
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    return orders.filter(order => {
      const orderDate = order.createdAt ? new Date(order.createdAt) : new Date(0);
      return orderDate >= cutoffDate;
    });
  };

  const calculateFinancials = () => {
    const filteredOrders = filterOrdersByPeriod(orders);

    let totalRevenue = 0;
    const monthlyData = {};
    const productSales = {};

    // Process all orders
    filteredOrders.forEach(order => {
      // Try both 'total' and 'totalAmount' fields
      const orderAmount = parseFloat(order.total || order.totalAmount || 0);
      totalRevenue += orderAmount;

      // Monthly breakdown
      if (order.createdAt) {
        const date = order.createdAt?.toDate?.() || new Date(order.createdAt);
        if (!isNaN(date.getTime())) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlyData[monthKey] = (monthlyData[monthKey] || 0) + orderAmount;
        }
      }

      // Product sales tracking
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          // Try both 'productId' and 'id' fields
          const productId = item.productId || item.id;
          const quantity = item.quantity || 1;
          productSales[productId] = (productSales[productId] || 0) + quantity;
        });
      }
    });

    // Calculate commissions and payouts
    const totalCommission = totalRevenue * commissionRate;
    const sellerPayouts = totalRevenue * (1 - commissionRate);
    const totalProfit = totalCommission;

    // Order statistics
    const orderStats = {
      total: filteredOrders.length,
      completed: filteredOrders.filter(o => o.status === 'completed').length,
      pending: filteredOrders.filter(o => o.status === 'pending').length,
      processing: filteredOrders.filter(o => o.status === 'processing').length,
      cancelled: filteredOrders.filter(o => o.status === 'cancelled').length,
      returned: filteredOrders.filter(o => o.status === 'returned').length
    };

    // Top products calculation
    const topProducts = Object.entries(productSales)
      .map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        const price = parseFloat(product?.price) || 0;
        return {
          productId,
          name: product?.name || 'Unknown Product',
          quantity,
          revenue: quantity * price
        };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Monthly revenue array for chart
    const monthlyRevenue = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({
        month: new Date(`${month}-01`).toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        }),
        amount
      }));

    // Calculate total adjustments (approved and applied only)
    const approvedAdjustments = adjustments.filter(adj => adj.status === 'approved' || adj.status === 'applied');
    const totalAdjustments = approvedAdjustments.reduce((sum, adj) => sum + parseFloat(adj.amount || 0), 0);
    
    // Calculate adjusted revenue (accounts for refunds/returns)
    const adjustedRevenue = totalRevenue - totalAdjustments;
    const adjustedCommission = adjustedRevenue * commissionRate;
    const adjustedSellerPayouts = adjustedRevenue * (1 - commissionRate);
    const adjustedProfit = adjustedCommission;

    setFinancialData({
      totalRevenue,
      totalCommission: adjustedCommission,
      totalProfit: adjustedProfit,
      sellerPayouts: adjustedSellerPayouts,
      totalAdjustments,
      adjustedRevenue,
      monthlyRevenue,
      orderStats,
      topProducts
    });
  };

  const formatCurrency = (amount) => {
    return `${currencySymbol} ${Number(amount).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const getPeriodText = () => {
    switch(selectedPeriod) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      default: return 'All Time';
    }
  };

  const downloadReport = async () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      addNotification({
        type: 'warning',
        title: 'Pop-ups Required',
        message: 'Please allow pop-ups to download the report'
      });
      return;
    }
    
    const periodText = getPeriodText();
    
    // Get current date/time for timestamp stamp
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    
    // Get admin user info from localStorage
    const adminUser = JSON.parse(localStorage.getItem('user') || '{}');
    const adminName = adminUser.displayName || 'Admin User';
    const adminEmail = adminUser.email || 'admin@aruviah.com';
    
    // Get logo URL
    const logoUrl = localStorage.getItem('logoUrl') || '/logo.png';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Finance Report - ${periodText}</title>
        <meta charset="utf-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #1f2937;
            line-height: 1.6;
          }
          
          .page {
            width: 8.5in;
            height: 11in;
            margin: 0 auto;
            padding: 0.5in 0.75in;
            background: white;
            position: relative;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          
          /* Letterhead */
          .letterhead {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 20px;
            border-bottom: 3px solid #ff9800;
            margin-bottom: 20px;
          }
          
          .logo-section {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          
          .logo-section img {
            height: 60px;
            width: auto;
          }
          
          .company-info {
            text-align: left;
          }
          
          .company-info h1 {
            color: #ff9800;
            font-size: 24px;
            margin: 0;
            font-weight: 700;
          }
          
          .company-info p {
            color: #6b7280;
            font-size: 12px;
            margin: 3px 0;
          }
          
          .timestamp-stamp {
            text-align: right;
            border: 2px solid #ff9800;
            padding: 8px 12px;
            border-radius: 8px;
            background: #fff3e0;
            font-size: 11px;
          }
          
          .timestamp-stamp strong {
            display: block;
            color: #ff9800;
            font-size: 12px;
            margin-bottom: 3px;
          }
          
          /* Content */
          .content {
            min-height: 6.5in;
          }
          
          .report-title {
            text-align: center;
            margin-bottom: 5px;
          }
          
          .report-title h2 {
            color: #ff9800;
            font-size: 20px;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .report-subtitle {
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            margin-bottom: 20px;
          }
          
          .header-info {
            background: #fef3c7;
            padding: 12px 15px;
            border-radius: 6px;
            margin-bottom: 20px;
            border-left: 4px solid #ff9800;
            font-size: 13px;
          }
          
          .header-info p {
            margin: 4px 0;
          }
          
          .header-info strong {
            color: #ff9800;
          }
          
          h3 {
            color: #374151;
            font-size: 14px;
            margin-top: 15px;
            margin-bottom: 10px;
            border-bottom: 2px solid #ff9800;
            padding-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .metrics-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 20px;
          }
          
          .metric-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 12px;
            border-radius: 6px;
            border-left: 4px solid #ff9800;
          }
          
          .metric-label {
            font-size: 11px;
            color: #6b7280;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .metric-value {
            font-size: 16px;
            font-weight: bold;
            color: #ff9800;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
            font-size: 12px;
          }
          
          th, td {
            padding: 8px 10px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          
          th {
            background: #f3f4f6;
            font-weight: 600;
            color: #374151;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          tr:last-child td {
            border-bottom: none;
          }
          
          .commission-info {
            background: #fef3c7;
            padding: 10px 12px;
            border-radius: 6px;
            margin: 12px 0;
            border-left: 4px solid #ff9800;
            font-size: 12px;
          }
          
          /* Footer */
          .footer {
            position: absolute;
            bottom: 0.5in;
            left: 0.75in;
            right: 0.75in;
            padding-top: 15px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 10px;
          }
          
          .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }
          
          .footer-left, .footer-center, .footer-right {
            flex: 1;
          }
          
          .footer-center {
            text-align: center;
          }
          
          .footer-right {
            text-align: right;
          }
          
          .admin-info {
            font-size: 10px;
            color: #6b7280;
          }
          
          .admin-info strong {
            color: #374151;
          }
          
          .page-number {
            font-size: 10px;
          }
          
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            .page {
              box-shadow: none;
              margin: 0;
              width: 100%;
              height: 100%;
              break-after: page;
            }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <!-- Letterhead -->
          <div class="letterhead">
            <div class="logo-section">
              <img src="${logoUrl}" alt="Aruviah Logo" />
              <div class="company-info">
                <h1>ARUVIAH</h1>
                <p>E-Commerce Platform</p>
                <p>Financial Analytics Report</p>
              </div>
            </div>
            <div class="timestamp-stamp">
              <strong>⏱ GENERATED</strong>
              ${timestamp}<br/>
              <span style="font-size: 10px;">System Timestamp</span>
            </div>
          </div>
          
          <!-- Content -->
          <div class="content">
            <div class="report-title">
              <h2>Finance Analytics Report</h2>
              <div class="report-subtitle">Period: ${periodText}</div>
            </div>
            
            <div class="header-info">
              <p><strong>Report Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Period:</strong> ${periodText}</p>
              <p><strong>Total Orders:</strong> ${financialData.orderStats.total}</p>
            </div>

            <h3>Financial Overview</h3>
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-label">Total Revenue</div>
                <div class="metric-value">${formatCurrency(financialData.totalRevenue)}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Platform Profit</div>
                <div class="metric-value">${formatCurrency(financialData.totalProfit)}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Seller Payouts</div>
                <div class="metric-value">${formatCurrency(financialData.sellerPayouts)}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Total Commission</div>
                <div class="metric-value">${formatCurrency(financialData.totalCommission)}</div>
              </div>
            </div>
            
            <div class="commission-info">
              <strong>Commission Structure:</strong> Platform retains 4% commission on all transactions. Sellers receive 96% of transaction value.
            </div>

            <h3>Order Statistics</h3>
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th style="text-align: right;">Count</th>
                  <th style="text-align: right;">Percentage</th>
                </tr>
              </thead>
              <tbody>
                <tr style="background: #f0fdf4;">
                  <td><strong>Total Orders</strong></td>
                  <td style="text-align: right;"><strong>${financialData.orderStats.total}</strong></td>
                  <td style="text-align: right;"><strong>100%</strong></td>
                </tr>
                <tr>
                  <td>Completed</td>
                  <td style="text-align: right;">${financialData.orderStats.completed}</td>
                  <td style="text-align: right;">${financialData.orderStats.total > 0 ? 
                    ((financialData.orderStats.completed / financialData.orderStats.total) * 100).toFixed(1) : 0}%</td>
                </tr>
                <tr>
                  <td>Processing</td>
                  <td style="text-align: right;">${financialData.orderStats.processing}</td>
                  <td style="text-align: right;">${financialData.orderStats.total > 0 ? 
                    ((financialData.orderStats.processing / financialData.orderStats.total) * 100).toFixed(1) : 0}%</td>
                </tr>
                <tr>
                  <td>Pending</td>
                  <td style="text-align: right;">${financialData.orderStats.pending}</td>
                  <td style="text-align: right;">${financialData.orderStats.total > 0 ? 
                    ((financialData.orderStats.pending / financialData.orderStats.total) * 100).toFixed(1) : 0}%</td>
                </tr>
                <tr>
                  <td>Cancelled</td>
                  <td style="text-align: right;">${financialData.orderStats.cancelled}</td>
                  <td style="text-align: right;">${financialData.orderStats.total > 0 ? 
                    ((financialData.orderStats.cancelled / financialData.orderStats.total) * 100).toFixed(1) : 0}%</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <div class="footer-content">
              <div class="footer-left">
                <div class="admin-info">Downloaded by: <strong>${adminName}</strong></div>
                <div class="admin-info">${adminEmail}</div>
              </div>
              <div class="footer-center">
                <div class="page-number">© ${new Date().getFullYear()} Aruviah - Confidential</div>
              </div>
              <div class="footer-right">
                <div class="page-number">Report #ARV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}</div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  };

  const MetricCard = ({ icon: Icon, label, value, color }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${color}-500`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{label}</p>
          <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
        </div>
        <Icon className={`text-${color}-500 text-4xl opacity-20`} />
      </div>
    </div>
  );

  const OrderStatCard = ({ label, count, bgColor, textColor }) => (
    <div className={`text-center p-4 ${bgColor} rounded-lg`}>
      <p className="text-gray-600 text-sm">{label}</p>
      <p className={`text-2xl font-bold ${textColor}`}>{count}</p>
    </div>
  );

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Finance Analytics</h1>
      </div>

      {/* Period Selector */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <button
          onClick={() => setSelectedPeriod('week')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            selectedPeriod === 'week'
              ? 'bg-orange-500 text-white shadow-lg'
              : 'bg-white text-gray-800 hover:bg-gray-100 shadow'
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setSelectedPeriod('month')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            selectedPeriod === 'month'
              ? 'bg-orange-500 text-white shadow-lg'
              : 'bg-white text-gray-800 hover:bg-gray-100 shadow'
          }`}
        >
          This Month
        </button>
        <button
          onClick={() => setSelectedPeriod('all')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            selectedPeriod === 'all'
              ? 'bg-orange-500 text-white shadow-lg'
              : 'bg-white text-gray-800 hover:bg-gray-100 shadow'
          }`}
        >
          All Time
        </button>
        <button
          onClick={downloadReport}
          className="ml-auto px-6 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-all shadow-lg flex items-center gap-2"
        >
          <FiDownload /> Download PDF Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          icon={FiDollarSign}
          label="Total Revenue"
          value={formatCurrency(financialData.totalRevenue)}
          color="orange"
        />
        <MetricCard 
          icon={FiTrendingUp}
          label="Adjustments"
          value={formatCurrency(financialData.totalAdjustments)}
          color="red"
        />
        <MetricCard 
          icon={FiTrendingUp}
          label="Adjusted Revenue"
          value={formatCurrency(financialData.adjustedRevenue)}
          color="green"
        />
        <MetricCard 
          icon={FiUsers}
          label="Seller Payouts"
          value={formatCurrency(financialData.sellerPayouts)}
          color="blue"
        />
        <MetricCard 
          icon={FiShoppingCart}
          label="Platform Profit"
          value={formatCurrency(financialData.totalProfit)}
          color="purple"
        />
      </div>

      {/* Order Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Order Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <OrderStatCard label="Total" count={financialData.orderStats.total} bgColor="bg-gray-50" textColor="text-gray-900" />
          <OrderStatCard label="Completed" count={financialData.orderStats.completed} bgColor="bg-green-50" textColor="text-green-600" />
          <OrderStatCard label="Pending" count={financialData.orderStats.pending} bgColor="bg-yellow-50" textColor="text-yellow-600" />
          <OrderStatCard label="Processing" count={financialData.orderStats.processing} bgColor="bg-blue-50" textColor="text-blue-600" />
          <OrderStatCard label="Cancelled" count={financialData.orderStats.cancelled} bgColor="bg-red-50" textColor="text-red-600" />
          <OrderStatCard label="Returned" count={financialData.orderStats.returned} bgColor="bg-orange-50" textColor="text-orange-600" />
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      {financialData.monthlyRevenue.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Monthly Revenue</h3>
          <div className="space-y-3">
            {financialData.monthlyRevenue.map((item, index) => {
              const maxRevenue = Math.max(...financialData.monthlyRevenue.map(m => m.amount));
              const percentage = maxRevenue > 0 ? (item.amount / maxRevenue) * 100 : 0;
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-28 text-sm font-semibold text-gray-600">{item.month}</div>
                  <div className="flex-grow bg-gray-200 rounded-full h-10 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-orange-400 to-orange-600 h-full flex items-center justify-end pr-3 text-white text-sm font-semibold transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    >
                      {item.amount > 0 && formatCurrency(item.amount)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Products */}
      {financialData.topProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Top Selling Products</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Product Name</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Quantity Sold</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {financialData.topProducts.map((product, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-600">#{index + 1}</td>
                    <td className="py-3 px-4">{product.name}</td>
                    <td className="py-3 px-4 text-right text-gray-700">{product.quantity}</td>
                    <td className="py-3 px-4 text-right font-semibold text-orange-600">
                      {formatCurrency(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Finance Adjustments */}
      <FinanceAdjustments 
        adjustments={adjustments}
        onAdjustmentsChange={fetchAdjustments}
      />

      {/* Finance Summary */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-md p-8 text-white">
        <h3 className="text-2xl font-bold mb-6">Finance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-orange-100 mb-2">Platform Commission Rate</p>
            <p className="text-5xl font-bold">4%</p>
            <p className="text-orange-100 text-sm mt-2">Per transaction on seller orders</p>
          </div>
          <div>
            <p className="text-orange-100 mb-2">Average Seller Payout</p>
            <p className="text-5xl font-bold">96%</p>
            <p className="text-orange-100 text-sm mt-2">Of total transaction value</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceAnalytics;