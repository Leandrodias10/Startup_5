import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import MovieListView from './view/movieListView'; // ajuste o caminho conforme a estrutura

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <MovieListView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#021123',
  },
});