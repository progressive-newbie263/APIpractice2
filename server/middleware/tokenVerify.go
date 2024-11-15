package middleware

import (
	"fmt"
	"net/http"
	"github.com/dgrijalva/jwt-go" // Import the JWT package
)

// VerifyTokenMiddleware checks if the token is valid
func VerifyTokenMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get the token from the "jwt" cookie
		cookie, err := r.Cookie("token")
		if err != nil || cookie == nil {
			http.Error(w, "Missing or invalid token", http.StatusUnauthorized)
			return
		}

		tokenString := cookie.Value // Get the token value from the cookie

		// Parse the token
		token, err := parseToken(tokenString)
		if err != nil || !token.Valid {
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		// Add the token claims to the request context if needed
		// r = r.WithContext(context.WithValue(r.Context(), "user", token.Claims))

		// If valid, continue to the next handler
		next.ServeHTTP(w, r)
	})
}

// Helper function to parse the token and validate it
func parseToken(tokenString string) (*jwt.Token, error) {
	// Define the JWT secret key (use the same key that was used to sign the token)
	secretKey := "your-secret-key"

	// Parse the JWT token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Check if the signing method is HMAC
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method %v", token.Header["alg"])
		}
		// Return the secret key for validation
		return []byte(secretKey), nil
	})

	if err != nil {
		return nil, err
	}
	return token, nil
}
