import { auth } from '@/config/firebase';
import { useAuth } from '@/context/authContext';
import {
  checkEmailVerification,
  requestEmailVerification,
} from '@/services/authService';
import { getProfileImage } from '@/services/imageService';
import Header from '@/src/components/Header';
import ScreenWrapper from '@/src/components/ScreenWrapper';
import Typo from '@/src/components/Typo';
import {
  colors,
  radius,
  spacingX,
  spacingY,
} from '@/src/constants/theme';
import { accountOptionType } from '@/types';
import { verticalScale } from '@/utils/styling';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import * as Icons from 'phosphor-react-native';
import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  AppState,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();

  const [isEmailVerified, setIsEmailVerified] = useState(
    auth.currentUser?.emailVerified ?? false
  );
  const [verificationAction, setVerificationAction] = useState<
    'send' | 'check' | null
  >(null);
  const verificationBusyRef = useRef(false);
  const autoCheckBusyRef = useRef(false);
  const isFocusedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;

      const runAutoCheck = async () => {
        if (autoCheckBusyRef.current || verificationBusyRef.current) return;

        const currentUser = auth.currentUser;
        if (!currentUser) return;

        if (currentUser.emailVerified) {
          setIsEmailVerified(true);
          return;
        }

        autoCheckBusyRef.current = true;

        try {
          const result = await checkEmailVerification();

          if (!isFocusedRef.current || auth.currentUser !== currentUser) return;

          if (result.success) {
            setIsEmailVerified(result.verified);
          }
        } finally {
          autoCheckBusyRef.current = false;
        }
      };

      void runAutoCheck();

      const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          void runAutoCheck();
        }
      });

      return () => {
        isFocusedRef.current = false;
        subscription.remove();
      };
    }, [])
  );

  const accountOptions: accountOptionType[] = [
    {
      title: 'Edit profile',
      icon: (
        <Icons.UserIcon
          size={26}
          color={colors.white}
          weight="fill"
        />
      ),
      routeName: '/(modals)/profileModal',
      bgColor: '#6366f1',
    },
    {
      title: 'Settings',
      icon: (
        <Icons.GearSixIcon
          size={26}
          color={colors.white}
          weight="fill"
        />
      ),
      bgColor: '#059669',
    },
    {
      title: 'Privacy Policy',
      icon: (
        <Icons.LockIcon
          size={26}
          color={colors.white}
          weight="fill"
        />
      ),
      bgColor: colors.neutral600,
    },
    {
      title: 'Logout',
      icon: (
        <Icons.PowerIcon
          size={26}
          color={colors.white}
          weight="fill"
        />
      ),
      bgColor: '#e11d48',
    },
  ];

  const handleVerification = async (action: 'send' | 'check') => {
    if (verificationBusyRef.current) return;

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    verificationBusyRef.current = true;
    setVerificationAction(action);

    try {
      if (action === 'send') {
        const result = await requestEmailVerification();

        if (auth.currentUser !== currentUser) return;

        if (!result.success) {
          Alert.alert('Email verification', result.msg);
          return;
        }

        setIsEmailVerified(currentUser.emailVerified);

        Alert.alert(
          'Email verification',
          currentUser.emailVerified
            ? 'Your email is already verified.'
            : 'Verification email sent. Check your inbox and spam folder.'
        );
      } else {
        const result = await checkEmailVerification();

        if (auth.currentUser !== currentUser) return;

        if (!result.success) {
          Alert.alert('Email verification', result.msg);
          return;
        }

        setIsEmailVerified(result.verified);

        Alert.alert(
          'Email verification',
          result.verified
            ? 'Your email has been verified.'
            : 'Your email is not verified yet. Open the link in your email, then check again.'
        );
      }
    } finally {
      verificationBusyRef.current = false;
      setVerificationAction(null);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      Alert.alert(
        'Logout',
        'Could not sign out. Please try again.'
      );
    }
  };

  const showLogoutAlert = () => {
    Alert.alert(
      'Confirm',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => {
            void handleLogout();
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handlePress = (item: accountOptionType) => {
    if (item.title === 'Logout') {
      showLogoutAlert();
      return;
    }

    if (item.routeName) {
      router.push(item.routeName);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title="Profile"
          style={{ marginVertical: spacingY._10 }}
        />

        <View style={styles.userInfo}>
          <Image
            source={getProfileImage(user?.image)}
            style={styles.avatar}
            contentFit="cover"
            transition={100}
          />

          <View style={styles.nameContainer}>
            <Typo
              size={24}
              fontWeight="600"
              color={colors.neutral100}
            >
              {user?.name}
            </Typo>

            <Typo size={15} color={colors.neutral400}>
              {user?.email}
            </Typo>
          </View>
        </View>

        <View style={styles.verificationCard}>
          <Typo size={16} fontWeight="600">
            {isEmailVerified
              ? 'Email verified'
              : 'Email not verified'}
          </Typo>

          {!isEmailVerified && (
            <>
              <Typo size={14} color={colors.neutral400}>
                Verify your email to confirm that it belongs to you.
              </Typo>

              <TouchableOpacity
                onPress={() => {
                  void handleVerification('send');
                }}
                disabled={verificationAction !== null}
                accessibilityRole="button"
                style={[
                  styles.verificationButton,
                  verificationAction !== null &&
                    styles.disabledButton,
                ]}
              >
                <Typo
                  color={colors.primary}
                  fontWeight="600"
                >
                  {verificationAction === 'send'
                    ? 'Sending...'
                    : 'Send verification email'}
                </Typo>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  void handleVerification('check');
                }}
                disabled={verificationAction !== null}
                accessibilityRole="button"
                style={[
                  styles.verificationButton,
                  verificationAction !== null &&
                    styles.disabledButton,
                ]}
              >
                <Typo
                  color={colors.primary}
                  fontWeight="600"
                >
                  {verificationAction === 'check'
                    ? 'Checking...'
                    : 'I have verified my email'}
                </Typo>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.accountOptions}>
          {accountOptions.map((item, index) => (
            <Animated.View
              key={item.title}
              entering={FadeInDown.delay(index * 50)
                .springify()
                .damping(14)}
              style={styles.listItem}
            >
              <TouchableOpacity
                onPress={() => handlePress(item)}
                style={styles.flexRow}
                accessibilityRole="button"
              >
                <View
                  style={[
                    styles.listIcon,
                    { backgroundColor: item.bgColor },
                  ]}
                >
                  {item.icon}
                </View>

                <Typo
                  size={16}
                  style={{ flex: 1 }}
                  fontWeight="500"
                >
                  {item.title}
                </Typo>

                <Icons.CaretRightIcon
                  size={verticalScale(20)}
                  weight="bold"
                  color={colors.white}
                />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._30,
  },
  userInfo: {
    marginTop: verticalScale(30),
    alignItems: 'center',
    gap: spacingY._20,
  },
  avatar: {
    alignSelf: 'center',
    backgroundColor: colors.neutral300,
    height: verticalScale(135),
    width: verticalScale(135),
    borderRadius: 200,
  },
  nameContainer: {
    gap: verticalScale(4),
    alignItems: 'center',
  },
  verificationCard: {
    marginTop: spacingY._20,
    padding: spacingX._15,
    gap: spacingY._10,
    backgroundColor: colors.neutral800,
    borderRadius: radius._15,
  },
  verificationButton: {
    paddingVertical: spacingY._10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  listIcon: {
    height: verticalScale(44),
    width: verticalScale(44),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius._15,
    borderCurve: 'continuous',
  },
  listItem: {
    marginBottom: verticalScale(17),
  },
  accountOptions: {
    marginTop: spacingY._35,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._10,
  },
});