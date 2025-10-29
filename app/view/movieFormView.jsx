import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import MovieService from '../services/MovieService';


export default function MovieFormView() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const id = params.id;


    const [form, setForm] = useState({
        id: null,
        title: '',
        synopsis: '',
        category: '',
        genre: '',
        staff: '',
        whereToWatch: '',
        releaseDate: '',
    });
    const [saving, setSaving] = useState(false);


    useEffect(() => {
        if (id) {
            MovieService.buscarPorId(id).then(m => {
                if (m) setForm({ ...m });
            }).catch(e => Toast.show({ type: 'error', text1: 'Erro', text2: String(e.message) }));
        }
    }, [id]);


    const onChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));


    const save = async () => {
        try {
            setSaving(true);
            if (form.id) {
                await MovieService.atualizarMovie(form);
                Toast.show({ type: 'success', text1: 'Atualizado com sucesso!' });
            } else {
                await MovieService.criarMovie(form);
                Toast.show({ type: 'success', text1: 'Criado com sucesso!' });
            }
                router.back();
        } catch (e) {
                Toast.show({ type: 'error', text1: 'Erro ao salvar', text2: String(e.message) });
        } finally {
                setSaving(false);
        }
    };


    return (
        <ScrollView contentContainerStyle={styles.container}>
        <TextInput label="Título" value={form.title} onChangeText={v => onChange('title', v)} style={styles.input} />
        <TextInput label="Sinopse" value={form.synopsis} onChangeText={v => onChange('synopsis', v)} style={styles.input} multiline />
        <TextInput label="Categoria" value={form.category} onChangeText={v => onChange('category', v)} style={styles.input} />
        <TextInput label="Gênero" value={form.genre} onChangeText={v => onChange('genre', v)} style={styles.input} />
        <TextInput label="Elenco / Staff" value={form.staff} onChangeText={v => onChange('staff', v)} style={styles.input} />
        <TextInput label="Onde assistir" value={form.whereToWatch} onChangeText={v => onChange('whereToWatch', v)} style={styles.input} />
        <TextInput label="Data lançamento (YYYY-MM-DD)" value={form.releaseDate} onChangeText={v => onChange('releaseDate', v)} style={styles.input} />


        <View style={styles.buttons}>
        <Button mode="contained" onPress={save} loading={saving}>Salvar</Button>
        <Button onPress={() => router.back()} style={{ marginLeft: 8 }}>Cancelar</Button>
        </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#021123',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});
