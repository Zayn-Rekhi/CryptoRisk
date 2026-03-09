package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

const baseURL string = "mongodb+srv://%s:%s@cluster0.5xcduqq.mongodb.net/?appName=Cluster0"

var Client *mongo.Client

func Connect() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal(err)
	}

	dbusername := os.Getenv("MONGOUSERNAME")
	dbpassword := os.Getenv("MONGOPASSWORD")
	connectURL := fmt.Sprintf(baseURL, dbusername, dbpassword)

	serverAPI := options.ServerAPI(options.ServerAPIVersion1)
	maxWait := time.Duration(5 * time.Second)
	opts := options.Client()
	opts.ApplyURI(connectURL)
	opts.SetServerAPIOptions(serverAPI)

	opts.ConnectTimeout = &maxWait
	client, err := mongo.Connect(opts)

	if err != nil {
		log.Fatal(err)
	}

	Client = client
}

func Disconnect() {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	Client.Disconnect(ctx)
}
