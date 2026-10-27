import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import React, { useState } from "react";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";

import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import Header from "@/components/ui/Header";
import Input from "@/components/ui/Input";
import ModalWrapper from "@/components/ui/ModalWrapper";
import Typo from "@/components/ui/Typo";
import { useAuth } from "@/features/auth/context/authContext";
import { getProfileImage } from "@/features/profile/api/imageService";
import { updateUser } from "@/features/profile/api/userService";
import { UserDataType } from "@/features/profile/types";
import { colors } from "@/theme";

const ProfileModal = () => {
  const { user, updateUserData } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<UserDataType>({
    name: user?.name || "",
    image: user?.image || null,
  });
  const [loading, setLoading] = useState(false);
  const onPickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo access to change your avatar.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setUserData({ ...userData, image: result.assets[0] });
    }
  };
  const onSubmit = async () => {
    let { name } = userData;
    if (!name.trim()) {
      Alert.alert("User", "Please  fill all the fields");
      return;
    }
    setLoading(true);
    const res = await updateUser(user?.uid as string, {
      ...userData,
      name: name.trim(),
    });
    if (res.success) {
      await updateUserData(user?.uid as string);
      setLoading(false);
      router.back();
    } else {
      setLoading(false);
      Alert.alert("User", res.msg);
    }
  };
  return (
    <ModalWrapper>
      <View className="flex-1 justify-between px-5">
        <Header
          title="Update profile"
          leftIcon={<BackButton />}
          className="mb-2.5"
        />
        <ScrollView contentContainerClassName="mt-[15px] gap-[30px]">
          <View className="relative self-center">
            <Image
              className="h-[135px] w-[135px] self-center rounded-full border border-neutral-500 bg-neutral-300"
              source={getProfileImage(userData.image)}
              contentFit="cover"
              transition={100}
            />
            <TouchableOpacity
              onPress={onPickImage}
              className="android:shadow-[0px_0px_4px_#000000] ios:shadow-[0px_0px_10px_rgba(0,0,0,0.25)] absolute bottom-[5px] right-[7px] rounded-full bg-neutral-100 p-[7px]"
            >
              <Icons.PencilIcon size={20} color={colors.neutral800} />
            </TouchableOpacity>
          </View>
          <View className="gap-2.5">
            <Typo className="text-neutral-200">Name</Typo>
            <Input
              placeholder="Name"
              value={userData.name}
              onChangeText={(value) =>
                setUserData({ ...userData, name: value })
              }
            />
          </View>
        </ScrollView>
      </View>
      <View className="mb-[5px] flex-row items-center gap-3 border-t border-neutral-700 px-5 pt-[15px]">
        <Button onPress={onSubmit} className="flex-1" loading={loading}>
          <Typo className="font-bold text-black">Update</Typo>
        </Button>
      </View>
    </ModalWrapper>
  );
};

export default ProfileModal;
