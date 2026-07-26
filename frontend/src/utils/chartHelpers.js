export const generateLast6MonthsData = (orders = []) => {
  const data = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Find the latest order date to use as the anchor
  let latestDate = new Date();
  if (orders.length > 0) {
    const validOrders = orders.filter(o => o.paymentStatus === 'paid' && o.createdAt);
    if (validOrders.length > 0) {
      validOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      latestDate = new Date(validOrders[0].createdAt);
    }
  }

  const now = latestDate;
  
  // Initialize last 6 months with 0
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    data.push({
      monthKey: `${d.getFullYear()}-${d.getMonth()}`,
      name: monthNames[d.getMonth()],
      value: 0
    });
  }

  // Aggregate orders
  orders.forEach(order => {
    if (order.paymentStatus === 'paid' && order.createdAt) {
      const orderDate = new Date(order.createdAt);
      const key = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
      
      const monthData = data.find(d => d.monthKey === key);
      if (monthData) {
        monthData.value += (order.amount || order.totalAmount || 0);
      }
    }
  });

  return data;
};
