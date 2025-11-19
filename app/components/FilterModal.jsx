import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Divider, Modal, Portal, Text, TextInput, useTheme } from 'react-native-paper';
import { useState, useEffect } from 'react';
import TmdbApi from '../api/TmdbApi';

export default function FilterModal({ 
  visible, 
  onDismiss, 
  onApply,
  currentFilters = {
    yearFrom: '',
    yearTo: '',
    genreIds: [],
    minRating: 0,
  }
}) {
  const theme = useTheme();
  const [filters, setFilters] = useState(currentFilters);
  const [availableGenres, setAvailableGenres] = useState([]);

  // Carrega gêneros disponíveis
  useEffect(() => {
    const loadGenres = async () => {
      try {
        // Garante que o cache está inicializado
        if (!TmdbApi.genreCache) {
          await TmdbApi.initGenreCache();
        }
        
        // Acessa o cache diretamente
        if (TmdbApi.genreCache && TmdbApi.genreCache.genres) {
          setAvailableGenres(TmdbApi.genreCache.genres);
        }
      } catch (error) {
        console.error('Erro ao carregar gêneros:', error);
      }
    };
    
    loadGenres();
  }, []);

  // Atualiza os filtros quando o modal abre
  useEffect(() => {
    if (visible) {
      setFilters(currentFilters);
    }
  }, [visible, currentFilters]);

  const ratings = [
    { value: 0, label: 'Todas' },
    { value: 5, label: '5+' },
    { value: 6, label: '6+' },
    { value: 7, label: '7+' },
    { value: 8, label: '8+' },
    { value: 9, label: '9+' },
  ];

  const toggleGenre = (genreId) => {
    setFilters(prev => {
      const currentGenreIds = prev.genreIds || [];
      return {
        ...prev,
        genreIds: currentGenreIds.includes(genreId)
          ? currentGenreIds.filter(id => id !== genreId)
          : [...currentGenreIds, genreId]
      };
    });
  };

  const setRating = (rating) => {
    setFilters(prev => ({
      ...prev,
      minRating: rating
    }));
  };

  const setAllTime = () => {
    setFilters(prev => ({
      ...prev,
      yearFrom: '',
      yearTo: ''
    }));
  };

  const clearAll = () => {
    const emptyFilters = {
      yearFrom: '',
      yearTo: '',
      genreIds: [],
      minRating: 0,
    };
    setFilters(emptyFilters);
  };

  const handleApply = () => {
    onApply(filters);
    onDismiss();
  };

  const countActiveFilters = () => {
    let count = 0;
    if (filters.yearFrom !== '' || filters.yearTo !== '') count++;
    if (filters.genreIds && filters.genreIds.length > 0) count += filters.genreIds.length;
    if (filters.minRating > 0) count++;
    return count;
  };

  // Valida anos
  const validateYear = (year) => {
    if (year === '') return true;
    const num = parseInt(year);
    return !isNaN(num) && num >= 1900 && num <= new Date().getFullYear() + 5;
  };

  const isYearValid = validateYear(filters.yearFrom) && validateYear(filters.yearTo);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modal,
          { backgroundColor: theme.colors.surface }
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            Filtros
          </Text>
          {countActiveFilters() > 0 && (
            <Chip 
              mode="flat" 
              compact
              style={[styles.badge, { backgroundColor: theme.colors.primaryContainer }]}
              textStyle={{ color: theme.colors.onPrimaryContainer }}
            >
              {countActiveFilters()}
            </Chip>
          )}
        </View>

        <Divider style={{ backgroundColor: theme.colors.outline }} />

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          {/* Filtro por Período */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              📅 Período de Lançamento
            </Text>
            
            <View style={styles.yearInputsContainer}>
              <TextInput
                label="De (ano)"
                value={filters.yearFrom}
                onChangeText={(text) => setFilters(prev => ({ ...prev, yearFrom: text }))}
                keyboardType="numeric"
                mode="outlined"
                style={styles.yearInput}
                maxLength={4}
                error={!validateYear(filters.yearFrom)}
                placeholder="Ex: 2020"
              />
              <TextInput
                label="Até (ano)"
                value={filters.yearTo}
                onChangeText={(text) => setFilters(prev => ({ ...prev, yearTo: text }))}
                keyboardType="numeric"
                mode="outlined"
                style={styles.yearInput}
                maxLength={4}
                error={!validateYear(filters.yearTo)}
                placeholder="Ex: 2024"
              />
            </View>

            <Button
              mode="text"
              compact
              onPress={setAllTime}
              style={styles.allTimeButton}
              icon="calendar-blank"
            >
              Todos os tempos
            </Button>
          </View>

          {/* Filtro por Gênero */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              🎭 Gêneros ({(filters.genreIds || []).length} selecionado{(filters.genreIds || []).length !== 1 ? 's' : ''})
            </Text>
            <View style={styles.chipContainer}>
              {availableGenres.map(genre => (
                <Chip
                  key={genre.id}
                  selected={(filters.genreIds || []).includes(genre.id)}
                  onPress={() => toggleGenre(genre.id)}
                  style={styles.chip}
                  mode={(filters.genreIds || []).includes(genre.id) ? 'flat' : 'outlined'}
                >
                  {genre.name}
                </Chip>
              ))}
            </View>
          </View>

          {/* Filtro por Avaliação */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              ⭐ Avaliação Mínima
            </Text>
            <View style={styles.chipContainer}>
              {ratings.map(rating => (
                <Chip
                  key={rating.value}
                  selected={filters.minRating === rating.value}
                  onPress={() => setRating(rating.value)}
                  style={styles.chip}
                  mode={filters.minRating === rating.value ? 'flat' : 'outlined'}
                >
                  {rating.label}
                </Chip>
              ))}
            </View>
          </View>
        </ScrollView>

        <Divider style={{ backgroundColor: theme.colors.outline }} />

        <View style={styles.footer}>
          <Button
            mode="outlined"
            onPress={clearAll}
            style={styles.button}
            disabled={countActiveFilters() === 0}
          >
            Limpar Tudo
          </Button>
          <Button
            mode="contained"
            onPress={handleApply}
            style={styles.button}
            disabled={!isYearValid}
          >
            Aplicar
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 20,
    borderRadius: 16,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  badge: {
    height: 28,
  },
  content: {
    padding: 20,
    maxHeight: 500,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  yearInputsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  yearInput: {
    flex: 1,
  },
  allTimeButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  button: {
    flex: 1,
  },
});