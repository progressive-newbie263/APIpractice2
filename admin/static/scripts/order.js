let currentPage = 1;
const ordersPerPage = 5; // 5 orders per page.

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

// Function to fetch and display orders based on status
async function filterOrders(status) {
  try {
    let url = "http://localhost:8082/api/all-orders";
    
    // If status is provided (Pending or Delivered), filter orders
    if (status !== '') {
      url += `?order_status=${status}`;
    }
    const response = await fetch(url);
    const orders = await response.json();
    
    // Sắp xếp đơn hàng. Mới nhất ở trước.
    orders.sort((a, b) => new Date(b.order_created_at) - new Date(a.order_created_at));
    
    renderOrderList(orders); // Initial render of orders with pagination
    renderPaginationControls(orders, renderOrderList); // Set up pagination controls
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
}


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
    const gmt7Offset = 17 * 60 * 60 * 1000; // Time offset for GMT+7
    const gmt7OneDayOff = 24 * 60 * 60 * 1000; // Adjust for day mismatch
    const localDate = new Date(date.getTime() + gmt7Offset - gmt7OneDayOff);

    // Format date as "Month Day, Year, HH:MM AM/PM"
    const formattedDate = localDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    // Create status column with image and color-coding
    const statusCell = document.createElement("td");

    // Create a container for both the text and icon
    const statusContainer = document.createElement("div");
    statusContainer.style.display = "flex";
    statusContainer.style.alignItems = "center"; // Vertically align the content
    statusContainer.style.gap = "8px"; // Add some space between text and icon

    const statusText = document.createElement("span");
    statusText.style.fontWeight = "bold"; // Optional: Make text bold
    statusText.style.fontSize = "14px"; // Optional: Adjust font size

    // Create and style the image (checkmark icon)
    const statusImg = document.createElement("img");
    statusImg.style.width = "25px";  // Adjust size as needed
    statusImg.style.height = "25px"; // Adjust size as needed

    if (order.order_status === "Delivered") {
      statusImg.src = "images/waiting-status/checked.svg"; // Assuming you have a checkmark image
      statusText.textContent = "Delivered";
      statusCell.style.backgroundColor = "green";
      statusText.style.color = "white"; // Optional: Make text color white for better contrast
    } else if (order.order_status === "Pending") {
      statusImg.src = "images/waiting-status/pending.png"; // Your pending icon
      statusText.textContent = "Pending";
      statusCell.style.backgroundColor = "#FF9800";
      statusText.style.color = "white"; // Optional: Make text color white for better contrast
    }

    // Append the icon and text to the container
    statusContainer.appendChild(statusText);
    statusContainer.appendChild(statusImg);
    statusCell.appendChild(statusContainer); // Append the container to the status cell

    // Add data to the table row
    row.innerHTML = `
      <td>${order.order_id}</td>
      <td>${order.user_id}</td>
      <td>$${(order.order_cost_cents / 100).toFixed(2)}</td>
      <td>${formattedDate}</td>
    `;

    row.appendChild(statusCell); // Append the status cell
    row.innerHTML += `<td style="text-align: center;"><button onclick="viewOrderDetails('${order.order_id}')">View</button></td>`;

    ordersTableBody.appendChild(row);
  });

  // Call pagination controls
  renderPaginationControls(orderArray, renderOrderList);
}


// Function to handle the "View Details" button click
function viewOrderDetails(orderID) {
  // Redirect to order details page
  window.location.href = `/admin/orders/${orderID}`;
}

// Initialize the 'All' orders when the page loads
document.addEventListener("DOMContentLoaded", () => filterOrders('all'));
