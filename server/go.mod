module server

go 1.23.0

require github.com/gorilla/mux v1.8.1 // direct

require github.com/lib/pq v1.10.9 // direct

require github.com/rs/cors v1.11.1 // direct

require (
	github.com/dgrijalva/jwt-go v3.2.0+incompatible // direct
	//github.com/gofiber/fiber/v2 v2.52.5 // indirect
	golang.org/x/crypto v0.28.0 // direct
)
