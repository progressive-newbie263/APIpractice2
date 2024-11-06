export function renderPaginationControls(totalItems, itemsPerPage, currentPage, onPageChange) {
  const paginationContainer = document.getElementById("paginationControls");
  paginationContainer.innerHTML = ""; // Clear existing buttons

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages > 0) {
    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement("button");
      button.textContent = i;
      button.className = i === currentPage ? "active" : "";

      button.addEventListener("click", () => {
        onPageChange(i);
      });

      paginationContainer.appendChild(button);
    }
  }
}
