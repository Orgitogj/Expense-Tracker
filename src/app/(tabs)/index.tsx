import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useAuth } from '@/context/authContext'
import { signOut } from 'firebase/auth';
import { auth } from '@/config/firebase';
import Button from '@/src/components/Button';
import { colors } from '@/src/constants/theme';
import Typo from '@/src/components/Typo';
import ScreenWrapper from '@/src/components/ScreenWrapper';

const Home = () => {
  const {user}=useAuth();
  
  return (
    
    <ScreenWrapper>
      <Typo>Home</Typo>
     
      
    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({})