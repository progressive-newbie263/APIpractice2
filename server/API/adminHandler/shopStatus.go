package adminHandler


import (
	"fmt"
	"net/http"
	_ "github.com/lib/pq"
	"server/database" 
)

//API trả về tổng doanh thu
func GetTotalSales(w http.ResponseWriter, r *http.Request) {
	var totalSales float64

	//sau này cần thêm status 'completed' vào db. Sẽ có đơn hàng bị huỷ/hoãn/hoàn lại.
	err := database.DB.QueryRow("SELECT SUM(order_cost_cents) FROM orders").Scan(&totalSales)
	if err != nil {
		http.Error(w, "Could not calculate total sales", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"totalSales": %.0f}`, totalSales)
}

// API trả về tổng số lượng đơn hàng
func GetTotalOrders(w http.ResponseWriter, r *http.Request) {
	var totalOrders int
	err := database.DB.QueryRow("SELECT COUNT(*) FROM orders").Scan(&totalOrders)
	if err != nil {
		http.Error(w, "Could not calculate total orders", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"totalOrders": %d}`, totalOrders)
}

//API trả về tổng số lượng người dùng
func GetTotalUsers(w http.ResponseWriter, r *http.Request) {
	var totalUsers int
	err := database.DB.QueryRow("SELECT COUNT(*) FROM users").Scan(&totalUsers)
	if err != nil {
		http.Error(w, "Could not calculate total users", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"totalUsers": %d}`, totalUsers)
}
