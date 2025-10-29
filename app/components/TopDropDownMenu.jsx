import { router } from 'expo-router';
import { useState } from 'react';
import { Appbar, Menu } from 'react-native-paper';


export default function TopDropDownMenu() {
const [visible, setVisible] = useState(false);
return (
<Appbar.Header>
<Appbar.Content title="Catálogo de Filmes" />
<Menu visible={visible} onDismiss={() => setVisible(false)} anchor={<Appbar.Action icon="dots-vertical" onPress={() => setVisible(true)} />}>
<Menu.Item onPress={() => router.push('/view/movieListView')} title="Filmes" />
<Menu.Item onPress={() => router.push('/view/contatoListView')} title="Contatos" />
<Menu.Item onPress={() => router.push('/view/usuarioListView')} title="Usuários" />
<Menu.Item onPress={() => router.push('/view/compromissoListView')} title="Compromissos" />
<Menu.Item onPress={() => router.push('/view/TarefaListView')} title="Tarefas" />
<Menu.Item onPress={() => router.push('/view/dataImportanteListView')} title="Datas Importantes" />
</Menu>
</Appbar.Header>
);
}