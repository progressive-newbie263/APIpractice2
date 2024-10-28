package main

import (
	"log"
	"mime"
	"net/http"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"

	//internal:
	"server/API/adminHandler"
	"server/API/productHandler"
	"server/API/userHandler"
	"server/API/cartHandler"
	"server/controllers"
	"server/database"

	//"server/middleware"
	"github.com/rs/cors"
)

//built-in middleware function:
func corsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
}

func handleRequests() {
	myRouter := mux.NewRouter().StrictSlash(true)

	//static (js and css)
	mime.AddExtensionType(".js", "application/javascript")
	mime.AddExtensionType(".css", "text/css")
	
	//mime errors handler for images.
	mime.AddExtensionType(".jpg", "image/jpg")
	mime.AddExtensionType(".jpeg", "image/jpeg")
	mime.AddExtensionType(".png", "image/png")
	mime.AddExtensionType(".gif", "image/gif")
	mime.AddExtensionType(".svg", "image/svg+xml")
	mime.AddExtensionType(".bmp", "image/bmp")
	mime.AddExtensionType(".webp", "image/webp")

	//admin page route
	myRouter.HandleFunc("/admin", adminHandler.AdminPageHandler).Methods("GET")
	myRouter.HandleFunc("/admin/products", adminHandler.ProductPageHandler).Methods("GET")
	myRouter.PathPrefix("/images/").Handler(http.StripPrefix("/images/", http.FileServer(http.Dir("../images"))))
	myRouter.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("../admin/static"))))

	//products API
	myRouter.HandleFunc("/api/products", database.GetProductsHandler).Methods("GET")
	myRouter.HandleFunc("/api/products/{id}", productHandler.SearchProductByIDHandler).Methods("GET")	//getting a specific product via searching its ID, finished successfully
	myRouter.HandleFunc("/api/products", productHandler.CreateProductHandler).Methods("POST")		//posting/creating a brand new product, finished successfully
	myRouter.HandleFunc("/api/products", productHandler.UpdateProductHandler).Methods("PUT")		//updating an existing product, finished successfully
	myRouter.HandleFunc("/api/products", productHandler.DeleteProductHandler).Methods("DELETE")	//deleting a product from database

	//users API, test cho vui. Khong su dung doan crud api user nay.
	myRouter.HandleFunc("/users", database.GetUsersHandler).Methods("GET") //getting all users inside database //done
	myRouter.HandleFunc("/users", userHandler.CreateUserHandler).Methods("POST") //create a new user. //done
	myRouter.HandleFunc("/users", userHandler.DeleteUserHandler).Methods("DELETE")	//deleting a product from database // done
	myRouter.HandleFunc("/users", userHandler.UpdateUserHandler).Methods("PUT")		//updating an user account //done.
	
	//login API
	myRouter.HandleFunc("/api/login", controllers.Login).Methods("POST") 
	myRouter.HandleFunc("/api/register", controllers.Register).Methods("POST") 
	myRouter.HandleFunc("/api/user", controllers.User).Methods("GET")	
	myRouter.HandleFunc("/api/logout", controllers.Logout).Methods("POST")
	
	myRouter.HandleFunc("/api/cart", cartHandler.SaveCartToDatabase).Methods("POST")
	myRouter.HandleFunc("/api/cart", cartHandler.GetCartFromDatabase).Methods("GET") 

	//middleware code which allows connections to database from outer source (?)
	c := cors.New(cors.Options{
		AllowedOrigins: []string{
			"http://127.0.0.1:5500", 
			"http://localhost:8082", 
			"http://localhost:5500"}, //frontend origin location
		
		AllowCredentials: true,
		
		//maybe only 'GET' ?
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},//{"GET"} only  
		
		AllowedHeaders: []string{"Authorization", "Content-Type"},
	})

	// Apply CORS to the router
	handler := c.Handler(myRouter)

	//set port 8082 for project
	log.Fatal(http.ListenAndServe(":8082", handler))
}

func main() {
	psqlconn := "postgres://postgres:26032004@localhost/ecommerce-db?sslmode=disable"
	database.Connect(psqlconn)
	defer database.DB.Close()

  handleRequests()
}