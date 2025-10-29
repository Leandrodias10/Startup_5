import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';


export default function ButtomMenu(){
return (
<View style={styles.container} pointerEvents="box-none">
<Pressable style={styles.button} onPress={() => router.push('/') } accessibilityLabel="Início">
<Text style={styles.text}>🏠 Início</Text>
</Pressable>
</View>
);
}


const styles = StyleSheet.create({
container: { position: 'absolute', bottom: 18, left: 0, right: 0, alignItems: 'center' },
button: { backgroundColor: '#222', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 24 },
text: { color: '#fff', fontWeight: '600' },
});