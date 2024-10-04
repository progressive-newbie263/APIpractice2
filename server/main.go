package main

import (
	"log"
	"net/http"
	"mime"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"

	//internal:
	"server/API/adminHandler"
	"server/API/productHandler"
	"server/API/userHandler"
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
	myRouter.HandleFunc("/products", database.GetProductsHandler).Methods("GET")
	myRouter.HandleFunc("/products/{id}", productHandler.SearchProductByIDHandler).Methods("GET")	//getting a specific product via searching its ID, finished successfully
	myRouter.HandleFunc("/products", productHandler.CreateProductHandler).Methods("POST")		//posting/creating a brand new product, finished successfully
	myRouter.HandleFunc("/products", productHandler.UpdateProductHandler).Methods("PUT")		//updating an existing product, finished successfully
	myRouter.HandleFunc("/products", productHandler.DeleteProductHandler).Methods("DELETE")	//deleting a product from database

	//users API
	myRouter.HandleFunc("/users", database.GetUsersHandler).Methods("GET") //getting all users inside database //done
	myRouter.HandleFunc("/users", userHandler.CreateUserHandler).Methods("POST") //create a new user. //done
	myRouter.HandleFunc("/users", userHandler.DeleteUserHandler).Methods("DELETE")	//deleting a product from database // done
	myRouter.HandleFunc("/users", userHandler.UpdateUserHandler).Methods("PUT")		//updating an user account //done.
	
	//middleware code which allows connections to database from outer source (?)
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://127.0.0.1:5500"}, //frontend origin location
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