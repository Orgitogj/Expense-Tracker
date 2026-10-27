import { Image, View } from "react-native";

const Index = () => {
  return (
    <View className="flex-1 items-center justify-center bg-neutral-900">
      <Image
        className="aspect-square h-[20%]"
        resizeMode="contain"
        source={require("../../assets/images/splashImage.png")}
      />
    </View>
  );
};

export default Index;
