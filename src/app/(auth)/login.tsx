import { StyleSheet, View } from 'react-native'
import ScreenWrapper from '@/src/components/ScreenWrapper'
import { colors, spacingX, spacingY } from '@/src/constants/theme'
import { verticalScale } from '@/utils/styling'
import BackButton from '@/src/components/BackButton'
import Typo from '@/src/components/Typo'
import Input from '@/src/components/Input'
import * as Icons from 'phosphor-react-native'

const Login = () => {
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton iconSize={28} />

        <View style={styles.welcomeContainer}>
          <Typo size={30} fontWeight="800">
            Hey,
          </Typo>

          <Typo size={30} fontWeight="800">
            Welcome back
          </Typo>
        </View>

        <View style={styles.form}>
          <Typo size={16} color={colors.textLight}>
            Log in now to track all your expenses
          </Typo>

          <Input
            placeholder="Enter your email"
            icon={<Icons.At size={verticalScale(16)} />}
          />
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacingY._30,
    paddingHorizontal: spacingX._20,
  },

  welcomeContainer: {
    gap: 5,
    marginTop: spacingY._20,
  },

  form: {
    gap: spacingY._20,
  },

  forgotPassword: {
    textAlign: 'right',
    fontWeight: '500',
    color: colors.text,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },

  footerText: {
    textAlign: 'center',
    color: colors.text,
    fontSize: verticalScale(15),
  },
})