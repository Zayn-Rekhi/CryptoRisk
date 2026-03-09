package users

import (
	"context"
	"fmt"
	"time"

	"golang.org/x/crypto/bcrypt"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"

	"github.com/Zayn-Rekhi/cryptorisk/internal/database"
)

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func GetUserByUsername(username string) (*User, error) {

	collection := database.Client.Database("Main").Collection("auth")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"username": username}

	var user User

	err := collection.FindOne(ctx, filter).Decode(&user)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("no document found for username")
		}

		return nil, err
	}

	return &user, nil

}

func AddProfileForUserByUsername(user User, ref bson.ObjectID) error {
	collection := database.Client.Database("Main").Collection("auth")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"username": user.Username}
	update := bson.D{{Key: "$push", Value: bson.D{{Key: "profile_references", Value: ref}}}}

	_, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("User not found")
	}

	return nil
}

func RemoveProfileForUserByUsername(user User, ref bson.ObjectID) error {
	collection := database.Client.Database("Main").Collection("auth")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"username": user.Username}
	update := bson.D{{Key: "$pull", Value: bson.D{{Key: "profile_references", Value: ref}}}}

	_, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("User not found")
	}

	return nil
}
