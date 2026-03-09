package users

import (
	"context"
	"log"
	"os"
	"time"

	"log/slog"

	"github.com/Zayn-Rekhi/cryptorisk/internal/database"
	"go.mongodb.org/mongo-driver/v2/bson"
	"google.golang.org/api/idtoken"
)

type User struct {
	ID                bson.ObjectID   `json:"_id" bson:"_id"`
	Username          string          `json:"username" bson:"username"`
	Password          string          `json:"password" bson:"password"`
	ProfileReferences []bson.ObjectID `json:"profile_references" bson:"profile_references"`
}

var clientID = os.Getenv("GOOGLE_OAUTH_CLIENT_ID")

func (user *User) InitializeGoogleUser(tokenId string) {
	ctx := context.Background()
	payload, err := idtoken.Validate(ctx, tokenId, clientID)
	if err != nil {
		slog.Error("Error Level: ", "description", "InitializeGoogleUser()", "tokenId", tokenId, "clientID", clientID, "error", err)
		return
	}

	email := payload.Claims["email"].(string)

	found, err := GetUserByUsername(email)

	if err != nil {
		user.Username = email
		user.Password = ""
		user.CreateUser()
		return
	}

	user.ID = found.ID
	user.Username = found.Username
	user.Password = found.Password
	user.ProfileReferences = found.ProfileReferences
}

func (user *User) CreateUser() {
	hashedPassword, err := HashPassword(user.Password)
	if err != nil {
		log.Fatal(err)
	}

	user.ID = bson.NewObjectID()
	user.Password = hashedPassword
	user.ProfileReferences = []bson.ObjectID{}
	user.SaveNewUser()
}

func (user *User) SaveNewUser() {
	collection := database.Client.Database("Main").Collection("auth")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)

	defer cancel()

	_, err := collection.InsertOne(ctx, user)
	if err != nil {
		log.Fatal(err)
	}
}

func (user *User) Authenticate() bool {
	user_found, err := GetUserByUsername(user.Username)
	if err != nil {
		log.Fatal(err)
	}

	return CheckPasswordHash(user.Password, user_found.Password)
}
