import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import ButtomMenu from './components/ButtomMenu';
import { PaperProvider } from 'react-native-paper';
import TopDropDownMenu from './components/TopDropDownMenu';
import Toast from "react-native-toast-message";

export default function Layout() {

  return (
    <PaperProvider>
      <View style={styles.container}>
        <TopDropDownMenu />
        <Toast />
        <Slot />
        <ButtomMenu />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
});
