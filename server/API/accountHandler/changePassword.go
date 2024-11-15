package accountHandler

import (
	"encoding/json"
	"net/http"
	"server/database"
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

// Đổi mật khẩu người dùng dựa trên userID và các trường khác từ payload
func UpdatePassword(w http.ResponseWriter, r *http.Request) {
	var data map[string]interface{}

	// Decode dữ liệu JSON từ request
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	//xem data ok chưa ?
	fmt.Println("Decoded data:", data) 

	// Lấy dữ liệu từ payload
	newPassword, ok1 := data["newPassword"].(string)
	currentPassword, ok2 := data["currentPassword"].(string)
	userID, ok3 := data["userID"].(float64) // userID là integer trong bảng users, cần convert sang

	if !ok1 || !ok2 || !ok3 {
		http.Error(w, "Missing or invalid required fields", http.StatusBadRequest)
		return
	}

	// Convert userID sang kiểu int
	userIDInt := int(userID)

	// Kiểm tra nếu mật khẩu mới hoặc mật khẩu hiện tại bị bỏ trống
	if newPassword == "" || currentPassword == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	// Lấy mật khẩu đã mã hóa của người dùng từ cơ sở dữ liệu
	var hashedPassword string
	err := database.DB.QueryRow(`SELECT password FROM users WHERE id = $1`, userIDInt).Scan(&hashedPassword)
	if err != nil {
		http.Error(w, "User not found or unable to retrieve password", http.StatusUnauthorized)
		return
	}

	// Kiểm tra mật khẩu hiện tại có đúng không
	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(currentPassword))
	if err != nil {
		http.Error(w, "Invalid current password", http.StatusUnauthorized)
		return
	}

	// Mã hóa mật khẩu mới
	newPasswordHash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Failed to hash the new password", http.StatusInternalServerError)
		return
	}

	// Cập nhật mật khẩu mới trong cơ sở dữ liệu
	_, err = database.DB.Exec(`UPDATE users SET password = $1 WHERE id = $2`, newPasswordHash, userIDInt)
	if err != nil {
		http.Error(w, "Failed to update password", http.StatusInternalServerError)
		return
	}

	// Gửi phản hồi thành công
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Password updated successfully"})
}
