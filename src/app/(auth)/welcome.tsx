import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/src/components/ScreenWrapper'
import Typo from '@/src/components/Typo'

const Welcome = () => {
  return (
    <ScreenWrapper>
      <Typo size={30} fontWeight={"700"}color='red'>Welcome page</Typo>
    </ScreenWrapper>
  )
}

export default Welcome

const styles = StyleSheet.create({})