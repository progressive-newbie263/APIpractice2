package adminHandler

import (
  "net/http"
  "html/template"
)

func AdminPageHandler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("../admin/index.html")
	if err != nil {
		http.Error(w, "Unable to load admin page", http.StatusInternalServerError)
		return
	}
	tmpl.Execute(w, nil)
}

func ProductPageHandler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("../admin/product.html")
	if err != nil {
		http.Error(w, "Unable to load admin page", http.StatusInternalServerError)
		return
	}
	tmpl.Execute(w, nil)
}