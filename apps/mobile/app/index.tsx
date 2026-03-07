import { View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-3xl font-bold text-gray-900">
        AI Tourist Guide
      </Text>
      <Text className="mt-4 text-lg text-gray-500">
        Hello World!
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}
