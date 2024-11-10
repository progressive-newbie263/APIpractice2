document.addEventListener("DOMContentLoaded", function() {
  // Fetch total sales
  fetch('/admin/total-sales')
    .then(response => response.json())
    .then(data => {
      document.getElementById('total-sales').innerText = `$${(data.totalSales/100).toFixed(2)}`;
    })
    .catch(err => console.error('Error fetching total sales:', err));

  // Fetch total orders
  fetch('/admin/total-orders')
    .then(response => response.json())
    .then(data => {
      document.getElementById('total-orders').innerText = data.totalOrders;
    })
    .catch(err => console.error('Error fetching total orders:', err));

  // Fetch total users
  fetch('/admin/total-users')
    .then(response => response.json())
    .then(data => {
      document.getElementById('total-users').innerText = data.totalUsers;
    })
    .catch(err => console.error('Error fetching total users:', err));
});
