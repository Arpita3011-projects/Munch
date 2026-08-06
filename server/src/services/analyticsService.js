const Order = require('../models/Order');

/**
 * Analytics service — aggregates real order data from MongoDB.
 *
 * Every metric is computed live from the orders collection. There are
 * no hardcoded figures. The Order model stores monetary values in integer
 * cents; we convert to dollars for the client (matching the rest of the
 * API, e.g. orderController.formatOrder).
 */

function centsToDollars(cents) {
  return Number((cents / 100).toFixed(2));
}

class AnalyticsService {
  /**
   * Build the complete dashboard analytics payload.
   *
   * Aggregates:
   *  - Order counts (total, today, per status)
   *  - Revenue (total, today) — excludes cancelled orders
   *  - Average order value
   *  - Top selling items (by quantity)
   *  - Most ordered categories (by quantity)
   *  - Recent orders (last 10, with customer info)
   *  - Monthly revenue (last 12 months)
   */
  async getDashboardAnalytics() {
    const now = new Date();

    // Start of today (local server time).
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Start of the current month.
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Run the independent queries in parallel for speed.
    const [totalOrders, ordersToday, revenueAgg, todayRevenueAgg, avgAgg, recentOrders] =
      await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ createdAt: { $gte: startOfToday } }),
        Order.aggregate([
          { $match: { status: { $ne: 'cancelled' } } },
          { $group: { _id: null, totalCents: { $sum: '$totalCents' } } },
        ]),
        Order.aggregate([
          {
            $match: {
              status: { $ne: 'cancelled' },
              createdAt: { $gte: startOfToday },
            },
          },
          { $group: { _id: null, totalCents: { $sum: '$totalCents' } } },
        ]),
        Order.aggregate([
          { $match: { status: { $ne: 'cancelled' } } },
          { $group: { _id: null, avgCents: { $avg: '$totalCents' } } },
        ]),
        Order.find()
          .sort({ createdAt: -1 })
          .limit(10)
          .populate({ path: 'user', model: 'User', select: 'name email' })
          .lean(),
      ]);

    // Status counts.
    const statusPipeline = [
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ];
    const [statusCounts] = await Promise.all([
      Order.aggregate(statusPipeline),
    ]);

    const statusCountMap = {};
    for (const row of statusCounts) {
      statusCountMap[row._id] = row.count;
    }

    // Revenue.
    const totalRevenueCents = revenueAgg[0]?.totalCents || 0;
    const todayRevenueCents = todayRevenueAgg[0]?.totalCents || 0;

    // Average order value (cents) — fall back to 0 when no orders.
    const avgCents = avgAgg[0]?.avgCents || 0;

    // Top selling items (by total quantity sold across all orders).
    const topSelling = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          quantity: { $sum: '$items.quantity' },
          revenueCents: {
            $sum: { $multiply: ['$items.priceCents', '$items.quantity'] },
          },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 5 },
    ]);

    // Most ordered categories — requires joining to the MenuItem collection.
    const categoryAgg = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'menuitems',
          localField: 'items.menuItemId',
          foreignField: '_id',
          as: 'menuItem',
        },
      },
      { $unwind: { path: '$menuItem', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ['$menuItem.category', 'Uncategorized'] },
          quantity: { $sum: '$items.quantity' },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 6 },
    ]);

    // Monthly revenue — last 12 months, excluding cancelled orders.
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' },
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenueCents: { $sum: '$totalCents' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format recent orders (reuse a lightweight shape).
    const recentOrdersFormatted = recentOrders.map((order) => ({
      _id: order._id,
      customer: order.user
        ? { _id: order.user._id, name: order.user.name, email: order.user.email }
        : null,
      items: (order.items || []).map((item) => ({
        name: item.name,
        quantity: item.quantity,
      })),
      total: centsToDollars(order.totalCents || 0),
      status: order.status,
      paymentMethod: order.paymentMethod || 'Cash on Delivery',
      createdAt: order.createdAt,
    }));

    return {
      totalOrders,
      ordersToday,
      statusCounts: {
        pending: statusCountMap.pending || 0,
        confirmed: statusCountMap.confirmed || 0,
        preparing: statusCountMap.preparing || 0,
        ready: statusCountMap.ready || 0,
        delivered: statusCountMap.delivered || 0,
        cancelled: statusCountMap.cancelled || 0,
      },
      totalRevenue: centsToDollars(totalRevenueCents),
      todayRevenue: centsToDollars(todayRevenueCents),
      averageOrderValue: centsToDollars(avgCents),
      topSellingItems: topSelling.map((row) => ({
        name: row._id,
        quantity: row.quantity,
        revenue: centsToDollars(row.revenueCents),
      })),
      topCategories: categoryAgg.map((row) => ({
        category: row._id,
        quantity: row.quantity,
      })),
      recentOrders: recentOrdersFormatted,
      monthlyRevenue: monthlyRevenue.map((row) => ({
        year: row._id.year,
        month: row._id.month,
        revenue: centsToDollars(row.revenueCents),
        count: row.count,
      })),
    };
  }
}

module.exports = new AnalyticsService();

