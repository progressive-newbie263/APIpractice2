package productHandler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"server/database"
)

// Hàm để toggle trạng thái sản phẩm
func ToggleProductStatus(productID string) error {
	query := `
		UPDATE products 
		SET is_active = NOT is_active 
		WHERE id = $1
		RETURNING is_active
	`
	var newStatus bool
	err := database.DB.QueryRow(query, productID).Scan(&newStatus)
	if err != nil {
		return fmt.Errorf("failed to toggle product status: %v", err)
	}

	fmt.Printf("Product ID %s new status: %v\n", productID, newStatus) // Log trạng thái mới
	return nil
}

// Handler để xử lý toggle trạng thái sản phẩm
func ToggleProductStatusHandler(w http.ResponseWriter, r *http.Request) {
	// Chỉ cho phép phương thức PUT
	if r.Method != http.MethodPut {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Lấy ID sản phẩm từ request body
	var product struct {
		ID string `json:"id"`
	}

	err := json.NewDecoder(r.Body).Decode(&product)
	if err != nil {
		http.Error(w, "Failed to parse request body", http.StatusBadRequest)
		return
	}

	// Gọi hàm ToggleProductStatus để thay đổi trạng thái sản phẩm
	err = ToggleProductStatus(product.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Trả về phản hồi thành công
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Product status toggled successfully")
}
