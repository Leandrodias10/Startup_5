import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, TextInput, useTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import MovieService from '../services/MovieService';


export default function MovieFormView() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const id = params.id;
    const theme = useTheme();


    const [form, setForm] = useState({
        id: null,
        title: '',
        synopsis: '',
        category: [],
        genre: [],
        staff: '',
        releaseDate: '',
        imageURL: '',
        watchLinks: {},
    });
    
    const [newLinkPlatform, setNewLinkPlatform] = useState('');
    const [newLinkUrl, setNewLinkUrl] = useState('');
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


    const addWatchLink = () => {
        if (newLinkPlatform && newLinkUrl) {
            setForm(prev => ({
                ...prev,
                watchLinks: {
                    ...prev.watchLinks,
                    [newLinkPlatform]: newLinkUrl
                }
            }));
            setNewLinkPlatform('');
            setNewLinkUrl('');
        }
    };

    const removeWatchLink = (platform) => {
        setForm(prev => {
            const newWatchLinks = { ...prev.watchLinks };
            delete newWatchLinks[platform];
            return { ...prev, watchLinks: newWatchLinks };
        });
    };

    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
        <TextInput 
            label="Título" 
            value={form.title} 
            onChangeText={v => onChange('title', v)} 
            style={styles.input}
            mode="outlined"
            textColor={theme.colors.onSurface}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
            placeholderTextColor={theme.colors.onSurfaceVariant}
        />
        <TextInput 
            label="Sinopse" 
            value={form.synopsis} 
            onChangeText={v => onChange('synopsis', v)} 
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={4}
            textColor={theme.colors.onSurface}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
        />
        <TextInput 
            label="Categoria (separe por vírgulas)" 
            value={Array.isArray(form.category) ? form.category.join(', ') : ''} 
            onChangeText={v => onChange('category', v.split(',').map(item => item.trim()))} 
            style={styles.input}
            mode="outlined"
            textColor={theme.colors.onSurface}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
        />
        <TextInput 
            label="Gênero (separe por vírgulas)" 
            value={Array.isArray(form.genre) ? form.genre.join(', ') : ''} 
            onChangeText={v => onChange('genre', v.split(',').map(item => item.trim()))} 
            style={styles.input}
            mode="outlined"
            textColor={theme.colors.onSurface}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
        />
        <TextInput 
            label="Elenco / Staff" 
            value={form.staff} 
            onChangeText={v => onChange('staff', v)} 
            style={styles.input}
            mode="outlined"
            textColor={theme.colors.onSurface}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
        />
        <TextInput 
            label="Data lançamento (YYYY-MM-DD)" 
            value={form.releaseDate} 
            onChangeText={v => onChange('releaseDate', v)} 
            style={styles.input}
            mode="outlined"
            textColor={theme.colors.onSurface}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
        />
        <TextInput 
            label="URL da Imagem" 
            value={form.imageURL} 
            onChangeText={v => onChange('imageURL', v)} 
            style={styles.input}
            mode="outlined"
            textColor={theme.colors.onSurface}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
        />


        <View style={[styles.linkSection, { backgroundColor: theme.colors.elevation.level1 }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Links de Streaming</Text>
            <TextInput 
                label="Plataforma (ex: YouTube, Netflix)" 
                value={newLinkPlatform} 
                onChangeText={setNewLinkPlatform}
                style={styles.input}
                mode="outlined"
                textColor={theme.colors.onSurface}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
            />
            <TextInput 
                label="URL do vídeo/filme" 
                value={newLinkUrl} 
                onChangeText={setNewLinkUrl}
                style={styles.input}
                mode="outlined"
                textColor={theme.colors.onSurface}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
            />
            <Button 
                mode="contained-tonal" 
                onPress={addWatchLink} 
                style={styles.addButton}
                icon="link-plus"
            >
                Adicionar Link
            </Button>
        </View>

        {/* Lista de links adicionados */}
        {Object.entries(form.watchLinks).map(([platform, url]) => (
            <View key={platform} style={[styles.linkItem, { backgroundColor: theme.colors.elevation.level1 }]}>
                <Text style={[styles.linkText, { color: theme.colors.onSurface }]}>{platform}: {url}</Text>
                <Button 
                    onPress={() => removeWatchLink(platform)}
                    mode="outlined"
                    icon="delete"
                    textColor={theme.colors.error}
                >
                    Remover
                </Button>
            </View>
        ))}

        <View style={styles.buttons}>
            <Button 
                mode="contained" 
                onPress={save} 
                loading={saving}
                icon="content-save"
                style={styles.saveButton}
            >
                Salvar
            </Button>
            <Button 
                onPress={() => router.back()} 
                style={styles.cancelButton}
                icon="close"
            >
                Cancelar
            </Button>
        </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  input: {
    marginBottom: 12,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  linkSection: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 12,
  },
  addButton: {
    marginTop: 8,
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  linkText: {
    flex: 1,
    marginRight: 10,
  },
  saveButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
});
