package controllers

import (
	"encoding/json"
	"net/http"
	"server/database"
	"strconv"
	"time"
	"log"
	"golang.org/x/crypto/bcrypt"
	"github.com/dgrijalva/jwt-go"
)

const SecretKey = "secret"

func Register(w http.ResponseWriter, r *http.Request) {
	var data map[string]string

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	password, _ := bcrypt.GenerateFromPassword([]byte(data["password"]), 14)

	user := database.User{
		Name:     data["name"],
		Email:    data["email"],
		Password: password,
		Role: "client",
	}

	// Raw SQL query to insert user data
	query := `
		INSERT INTO users (name, email, password, role, location) 
		VALUES ($1, $2, $3, $4, $5) 
		RETURNING id;
	`
	// Execute the query and retrieve the new user's ID
	var userID int
	err = database.DB.QueryRow(query, user.Name, user.Email, user.Password, user.Role, user.Location).Scan(&userID)
	if err != nil {
		http.Error(w, "Failed to insert user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return the user information along with the new ID
	user.ID = userID

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func Login(w http.ResponseWriter, r *http.Request) {
	var data map[string]string

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var user database.User

	query := `SELECT id, name, email, password, role, location FROM users WHERE email = $1 LIMIT 1`

	// Execute the query and scan the result into the user struct
	err := database.DB.QueryRow(query, data["email"]).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.Location)

	if err != nil {
		// User not found in the database
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	if err := bcrypt.CompareHashAndPassword(user.Password, []byte(data["password"])); err != nil {
		http.Error(w, "Incorrect password", http.StatusBadRequest)
		return
	}

	// JWT token part
	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.StandardClaims{
		Issuer:    strconv.Itoa(int(user.ID)),
		ExpiresAt: time.Now().Add(time.Hour * 24).Unix(), // 1 day
	})

	token, err := claims.SignedString([]byte(SecretKey))
	if err != nil {
		http.Error(w, "Could not login", http.StatusInternalServerError)
		return
	}

	// Set cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    token,
		Expires:  time.Now().Add(time.Hour * 24), // 1 day
		HttpOnly: true,
		//notice: this is added. to make sure it is accessible across site.
		Path: "/",
		SameSite: http.SameSiteNoneMode, //cross-origin access 
	})

	role := user.Role
	var redirectURL string

	if role == "admin" {
		redirectURL = "http://localhost:8082/admin" // Redirect to admin page
	} else {
		redirectURL = "./client/amazon.html" // Redirect to client page
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Login successfully",
		"user": user,
		"redirect_url": redirectURL,
		"token":        token,
	})
}

func User(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("token")
	if err != nil {
		http.Error(w, "Could not login", http.StatusUnauthorized)
		return
	}

	// Debugging: Print the cookie value to see if it's being received correctly
	log.Println("JWT Cookie:", cookie.Value)

	token, err := jwt.ParseWithClaims(cookie.Value, &jwt.StandardClaims{}, func(t *jwt.Token) (interface{}, error) {
		return []byte(SecretKey), nil
	})

	if err != nil {
		http.Error(w, "Could not login", http.StatusUnauthorized)
		return
	}

	claims := token.Claims.(*jwt.StandardClaims)

	var user database.User

	query := `SELECT id, name, email, password, role, location FROM users WHERE id = $1 LIMIT 1`

	err = database.DB.QueryRow(query, claims.Issuer).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.Location)

	if err != nil {
		// User not found in the database
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func Logout(w http.ResponseWriter, r *http.Request) {
	// Xóa cookie jwt bằng cách đặt giá trị trống và thời gian hết hạn trong quá khứ
	http.SetCookie(w, &http.Cookie{
		Name:     "token", // Tên cookie
		Value:    "",    // Xóa giá trị cookie
		Expires:  time.Now().Add(-time.Hour), // Đặt thời gian hết hạn về một giờ trước
		HttpOnly: true,  // Đảm bảo cookie không thể truy cập qua JavaScript
		Secure:   false, // Nếu sử dụng HTTPS, đặt là true
		Path:     "/",   // Đảm bảo cookie áp dụng cho toàn bộ site
	})

	// Đặt header cho nội dung trả về là JSON
	w.Header().Set("Content-Type", "application/json")

	// Trả về thông báo JSON khi logout thành công
	json.NewEncoder(w).Encode(map[string]string{"message": "Logged out"})
}
