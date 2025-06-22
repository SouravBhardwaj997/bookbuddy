import {
  View,
  Text,
  Alert,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { API_URL } from "../../constants/api";
import { useAuthStore } from "../../store/authStore";
import styles from "../../assets/styles/profile.styles";
import ProfileHeader from "../../components/ProfileHeader";
import LogoutButton from "../../components/LogoutButton";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import Loader from "../../components/Loader";
import { Image } from "expo-image";
export default function Profile() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteBookId, setDeleteBookId] = useState(null);
  const { token } = useAuthStore();
  const router = useRouter();

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i < rating ? "star" : "star-outline"}
          size={14}
          color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      );
    }
    return <View style={styles.ratingContainer}>{stars}</View>;
  };

  const handleDeleteBook = async (bookId) => {
    try {
      setDeleteBookId(bookId);
      const response = await fetch(`${API_URL}/books/${bookId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to delete the recommendation");
      setBooks(books.filter((book) => book._id !== bookId));
      Alert.alert("Success", "Recommendation delete successfully");
    } catch (error) {
      Alert.alert("error", error.message || "Something went wrong");
    } finally {
      setDeleteBookId(null);
    }
  };

  const sleep = (ms) => new Promise((res, rej) => setTimeout(res, ms));

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await sleep(500);
    await fetchData();
    setIsRefreshing(false);
  };

  const confirmDelete = (bookId) => {
    Alert.alert(
      "Delete Recommendation",
      "Are you sure you want to delete this recommendation?",
      [
        { text: "cancel", style: "cancel" },
        {
          text: "logout",
          onPress: () => handleDeleteBook(bookId),
          style: "destructive",
        },
      ]
    );
  };
  const renderBookItem = ({ item }) => {
    // console.log("item 123:", item);
    console.log("item image 2:", item.image);
    // console.log("item rating 1:", item.rating);
    return (
      <View style={styles.bookItem}>
        <Image source={{ uri: item.image }} style={styles.bookImage} />
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle}>{item.title}</Text>
          <Text style={styles.ratingContainer}>
            {renderRatingStars(item.rating)}
          </Text>
          <Text style={styles.bookCaption} numberOfLines={2}>
            {item.caption}
          </Text>
          <Text style={styles.bookDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDelete(item._id)}
        >
          {deleteBookId == item._id ? (
            <ActivityIndicator size={"small"} color={COLORS.primary} />
          ) : (
            <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>
    );
  };
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/books/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch user's books");
      console.log("data:", data);
      setBooks(data);
    } catch (error) {
      console.log("Error while fetching books", error);
      Alert.alert("Error", "Failed to fetch user data pull down to refresh");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => fetchData(), []);

  if (isLoading && !isRefreshing) return <Loader />;
  return (
    <View style={styles.container}>
      <ProfileHeader />
      <LogoutButton />

      {/* YOUR RECOMMENDATION  */}
      <View style={styles.booksHeader}>
        <Text style={styles.bookTitle}>Your Recommendation</Text>
        <Text style={styles.booksCount}>{books?.length}</Text>
      </View>
      <FlatList
        data={books}
        renderItem={renderBookItem}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={styles.booksList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="book-outline"
              size={50}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyText}>No Recommendation Yet</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/create")}
            >
              <Text style={styles.addButtonText}>Add Your First Book</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
