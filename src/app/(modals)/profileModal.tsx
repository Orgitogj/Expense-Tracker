import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { colors, spacingX, spacingY } from '@/src/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import ScreenWrapper from '@/src/components/ScreenWrapper'
import ModalWrapper from '@/src/components/ModalWrapper'

const ProfileModal = () => {
  return (
    <ModalWrapper>
      <View style={styles.container}></View>
    </ModalWrapper>
  )
}

export default ProfileModal

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:"space-between",
        paddingHorizontal:spacingY._20,
    },
    form:{
        gap:spacingY._30,
        marginTop:spacingY._15,
    },
    footer:{
        alignItems:"center",
        flexDirection:"row",
        paddingHorizontal:spacingX._20,
        paddingTop:spacingY._15,
        gap:scale(12),
        borderTopColor:colors.neutral700,
        marginBottom:spacingY._5,
        borderTopWidth:1,
    },
    avatarContainer:{
        position:"relative",
        alignSelf:"center",
    },
    avatar:{
        alignSelf:"center",
        backgroundColor:colors.neutral300,
        height:verticalScale(135),
        width:verticalScale(135),
        borderRadius:200,
        borderWidth:1,
        borderColor:colors.neutral500,
    },
    editIcon:{
        position:"absolute",
        bottom:spacingY._5,
        right:spacingY._7,
        borderRadius:100,
        backgroundColor:colors.neutral100,
        shadowColor:colors.black,
        shadowOffset:{width:0,height:0},
        shadowOpacity:0.25,
        shadowRadius:10,
        elevation:4,
        padding:spacingY._7,
    },
    inputContainer:{
        gap:spacingY._10,
    },
})