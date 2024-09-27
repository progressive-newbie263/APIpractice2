package main

import (
	"log"
	"net/http"
	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
	//internal:
	"github.com/progressive-newbie263/APIpractice2APIpractice2/server/database"
	"github.com/progressive-newbie263/APIpractice2/server/API/productHandler"
	"github.com/progressive-newbie263/APIpractice2/server/API/userHandler"
)

func handleRequests() {
	myRouter := mux.NewRouter().StrictSlash(true)

	//testing getting products API
	myRouter.HandleFunc("/products", database.GetProductsHandler).Methods("GET")
	myRouter.HandleFunc("/products/{id}", productHandler.SearchProductByIDHandler).Methods("GET")	//getting a specific product via searching its ID, finished successfully
	myRouter.HandleFunc("/products", productHandler.CreateProductHandler).Methods("POST")		//posting/creating a brand new product, finished successfully
	myRouter.HandleFunc("/products", productHandler.UpdateProductHandler).Methods("PUT")		//updating an existing product, finished successfully
	myRouter.HandleFunc("/products", productHandler.DeleteProductHandler).Methods("DELETE")	//deleting a product from database

	//testing getting users API
	myRouter.HandleFunc("/users", database.GetUsersHandler).Methods("GET") //getting all users inside database //done
	myRouter.HandleFunc("/users", userHandler.CreateUserHandler).Methods("POST") //create a new user. //done
	myRouter.HandleFunc("/users", userHandler.DeleteUserHandler).Methods("DELETE")	//deleting a product from database // done
	myRouter.HandleFunc("/users", userHandler.UpdateUserHandler).Methods("PUT")		//updating an user account //done.

	//set port 8082 for project
	log.Fatal(http.ListenAndServe(":8082", myRouter))
}

func main() {
	psqlconn := "postgres://postgres:26032004@localhost/ecommerce-db?sslmode=disable"
	database.Connect(psqlconn)
	defer database.DB.Close()

  handleRequests()
}