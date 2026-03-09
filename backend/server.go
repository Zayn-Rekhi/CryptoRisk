package main

import (
	"fmt"
	"net/http"
	"os"

	"log/slog"

	"github.com/Zayn-Rekhi/cryptorisk/internal/auth"
	"github.com/Zayn-Rekhi/cryptorisk/internal/database"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"

	"github.com/Zayn-Rekhi/cryptorisk/graph"
	"github.com/vektah/gqlparser/v2/ast"

	"github.com/go-chi/chi/v5"
)

const defaultPort = "8080"

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	logger := slog.New(slog.NewTextHandler(os.Stderr, nil))
	slog.SetDefault(logger)

	database.Connect()
	defer database.Disconnect()

	router := chi.NewRouter()
	router.Use(auth.Middleware())

	srv := handler.New(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{}}))

	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})

	srv.SetQueryCache(lru.New[*ast.QueryDocument](1000))

	srv.Use(extension.Introspection{})
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})

	router.Handle("/", playground.Handler("GraphQL playground", "/query"))
	router.Handle("/query", srv)

	slog.Info("Info Level: ", "url", fmt.Sprintf("connect to http://localhost:%s/ for GraphQL playground", port))
	slog.Error("Error Level: ", "err", fmt.Sprintf("Ended with Error: %s", http.ListenAndServe(":"+port, router).Error()))
}
