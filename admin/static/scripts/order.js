// Constants for pagination
let currentPage = 1; // Track the current page
const ordersPerPage = 5; // Display 5 orders per page

// Reusable render pagination controls function
function renderPaginationControls(itemArray, displayFunction) {
  const paginationContainer = document.getElementById("paginationControls");
  const prevButton = document.getElementById("prevPage");
  const nextButton = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");

  const totalPages = Math.ceil(itemArray.length / ordersPerPage);

  // Update page info
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

  // Set up Previous button
  prevButton.disabled = currentPage === 1;
  prevButton.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      displayFunction(itemArray);
    }
  };

  // Set up Next button
  nextButton.disabled = currentPage === totalPages;
  nextButton.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayFunction(itemArray);
    }
  };
}


// Function to fetch and display orders with pagination
async function showOrders() {
  try {
    const response = await fetch("http://localhost:8082/api/all-orders");
    const orders = await response.json();
    renderOrderList(orders); // Initial render of orders with pagination
    renderPaginationControls(orders, renderOrderList); // Set up pagination controls
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
}

// Render orders list with pagination
function renderOrderList(orderArray) {
  const ordersTableBody = document.querySelector("#ordersTable tbody");
  ordersTableBody.innerHTML = ""; // Clear any previous data

  // Pagination logic
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const ordersToDisplay = orderArray.slice(startIndex, endIndex);

  ordersToDisplay.forEach(order => {
    const row = document.createElement("tr");

    // Convert to GMT+7
    const date = new Date(order.order_created_at);
    const gmt7Offset = 17 * 60 * 60 * 1000; // tham chiếu thời gian lệch phải cộng 17 tiếng thay vì 7 tiếng. Có vẻ giờ gốc là GMT-10.
    const localDate = new Date(date.getTime() + gmt7Offset);

    // Format date as "Month Day, Year, HH:MM AM/PM"
    const formattedDate = localDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    row.innerHTML = `
      <td>${order.order_id}</td>
      <td>${order.user_id}</td>
      <td>$${(order.order_cost_cents / 100).toFixed(2)}</td>
      <td>${formattedDate}</td>
      <td style="text-align: center;"><button onclick="viewOrderDetails('${order.order_id}')">View</button></td>
    `;
    ordersTableBody.appendChild(row);
  });

  // Call pagination controls
  renderPaginationControls(orderArray, renderOrderList);
}

// Function to handle the "View Details" button click
function viewOrderDetails(orderID) {
  //Redirect to order details page
  window.location.href = `/admin/orders`;
}

// Initialize showOrders when the page loads
document.addEventListener("DOMContentLoaded", showOrders);







