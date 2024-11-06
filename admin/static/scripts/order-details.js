/* code để truyền order từ API và hiển thị nó ra trang web */
async function viewOrderDetails(orderID) {
  try {
    const response = await fetch(`http://localhost:8082/api/order-details?order_id=${orderID}`); // Adjust the URL as needed
    const orderDetails = await response.json();
    renderOrderDetails(orderDetails);
  } catch (error) {
    console.error("Error fetching order details:", error);
  }
}
function renderOrderDetails(orderDetails) {
  //overlay cho background của order details
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  document.body.appendChild(overlay);

  // Tắt order/hiệu ứng order khi click vào ngoài vùng order.
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeOrderDetails();
    }
  });

  // tạo model mới cho order.
  const orderDetailsContainer = document.createElement("div");
  orderDetailsContainer.className = "order-details-container"; // Add a class for styling

  // Chuyển về múi giờ GMT+7
  const ConvertToGMT7 = (dateString) => {
    const date = new Date(dateString);
    const gmt7Offset = 7 * 60 * 60 * 1000; // GMT+7, millisec
    return new Date(date.getTime() + gmt7Offset);
  };

  // chuyển chuỗi ngày tháng năm thành chữ (vì 08/11 ở VN là 8 tháng 11, nhưng nước ngoài gọi nó là 11 tháng 8)
  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);

    // Add suffix to the day (st, nd, rd, th)
    const day = date.getDate();
    const suffix = (day) => {
      if (day > 3 && day < 21) return 'th'; // 11th, 12th, 13th...
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };

    return `${formattedDate.replace(/\d+/, day + suffix(day))}`; // Chuyển hoá ngày.
  };


  // Add the order ID and other order details
  orderDetailsContainer.innerHTML = `
    <button onclick="closeOrderDetails();">X</button>

    <h2><span style="text-decoration: underline;">Order ID:</span> ${orderDetails.order_id}</h2>
    
    <div style="display:flex; flex-direction:row; justify-content:space-between;">
      <p><strong>User ID</strong>: ${orderDetails.user_id}</p>
      <p><strong>Total Cost</strong>: $${(orderDetails.order_cost_cents / 100).toFixed(2)}</p>
      <p><strong>Order Created At</strong>: ${ConvertToGMT7(orderDetails.order_created_at).toLocaleString()} (GMT+7)</p>
    </div>
    
    <ul class="order-products-list">
      ${orderDetails.products.map(product => `
        <li style="position: relative;">
          <strong style="font-size:18px; color:rgba(255, 38, 0, 0.882);">${product.product_name}</strong>
          <br>
          
          <div style="display:flex; flex-direction:row; justify-content:space-between;">
            <div>
              <strong>Product ID:</strong> ${product.product_id}
              <br>
              
              <strong>Quantity:</strong> ${product.quantity}
              <br>
            </div>

            <img style="
              width:100px; 
              height:100px; 
              object-fit: fill; 
              align-items:center; 
              border: solid 1px black;
              cursor: pointer;
            " 
              src="../${product.product_image}"}
            <br>
          </div>
      
          <strong>Estimated Delivery Time:</strong> ${formatDate(ConvertToGMT7(product.estimated_delivery_time))}
        </li>
      `).join("")}
    </ul>
  `;

  // Append the order details container to the body or a specific section
  document.body.appendChild(orderDetailsContainer);
}

// Xoá blur/thêm blur với nút close/
function closeOrderDetails() {
  const overlay = document.querySelector(".overlay");
  const orderDetailsContainer = document.querySelector(".order-details-container");

  // Add fade-out animation for smooth closing effect
  overlay.classList.add("fade-out");
  orderDetailsContainer.classList.add("fade-out");

  // Wait for transition to complete before removing elements
  setTimeout(() => {
    if (overlay) overlay.remove();
    if (orderDetailsContainer) orderDetailsContainer.remove();
  }, 250); // Adjust based on transition duration in CSS
}