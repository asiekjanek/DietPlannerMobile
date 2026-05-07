import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = 'http://10.0.2.2:5278/api';

type Screen = 'dashboard' | 'profileSelect' | 'manager' | 'dayPlanner';
type FieldType = 'text' | 'number' | 'date' | 'boolean';

type FieldConfig = {
  key: string;
  label: string;
  type: FieldType;
};

type EntityConfig = {
  key: string;
  title: string;
  endpoint: string;
  fields: FieldConfig[];
  displayFields: string[];
};

type FormData = Record<string, string>;

const profileEntity: EntityConfig = {
  key: 'userprofiles',
  title: 'Profil',
  endpoint: 'userprofiles',
  fields: [
    { key: 'fullName', label: 'Imię i nazwisko', type: 'text' },
    { key: 'gender', label: 'Płeć', type: 'text' },
    { key: 'age', label: 'Wiek', type: 'number' },
    { key: 'heightCm', label: 'Wzrost (cm)', type: 'number' },
  ],
  displayFields: ['fullName', 'gender', 'age', 'heightCm'],
};

const entities: EntityConfig[] = [
  {
    key: 'bodymeasurements',
    title: 'Pomiary',
    endpoint: 'bodymeasurements',
    fields: [
      { key: 'weightKg', label: 'Waga (kg)', type: 'number' },
      { key: 'bmi', label: 'BMI', type: 'number' },
      { key: 'measurementDate', label: 'Data pomiaru', type: 'date' },
      { key: 'userProfileId', label: 'Profil', type: 'number' },
    ],
    displayFields: ['weightKg', 'bmi', 'measurementDate'],
  },
  {
    key: 'goals',
    title: 'Cele',
    endpoint: 'goals',
    fields: [
      { key: 'goalType', label: 'Cel', type: 'text' },
      { key: 'targetWeightKg', label: 'Waga docelowa (kg)', type: 'number' },
      { key: 'description', label: 'Opis', type: 'text' },
      { key: 'userProfileId', label: 'Profil', type: 'number' },
    ],
    displayFields: ['goalType', 'targetWeightKg', 'description'],
  },
  {
    key: 'meals',
    title: 'Posiłki',
    endpoint: 'meals',
    fields: [
      { key: 'name', label: 'Nazwa', type: 'text' },
      { key: 'description', label: 'Opis', type: 'text' },
      { key: 'categoryId', label: 'Kategoria', type: 'number' },
      { key: 'calories', label: 'Kalorie', type: 'number' },
      { key: 'protein', label: 'Białko (g)', type: 'number' },
      { key: 'carbs', label: 'Węgle (g)', type: 'number' },
      { key: 'fat', label: 'Tłuszcze (g)', type: 'number' },
      { key: 'sugar', label: 'Cukry (g)', type: 'number' },
    ],
    displayFields: ['description', 'categoryId', 'calories', 'protein', 'carbs', 'fat', 'sugar'],
  },
  {
    key: 'ingredients',
    title: 'Produkty',
    endpoint: 'ingredients',
    fields: [
      { key: 'name', label: 'Nazwa', type: 'text' },
      { key: 'calories', label: 'Kalorie', type: 'number' },
      { key: 'protein', label: 'Białko (g)', type: 'number' },
      { key: 'carbs', label: 'Węgle (g)', type: 'number' },
      { key: 'fat', label: 'Tłuszcze (g)', type: 'number' },
      { key: 'sugar', label: 'Cukry (g)', type: 'number' },
    ],
    displayFields: ['calories', 'protein', 'carbs', 'fat', 'sugar'],
  },
  {
    key: 'waterintakes',
    title: 'Nawodnienie',
    endpoint: 'waterintakes',
    fields: [
      { key: 'drinkDate', label: 'Data i godzina', type: 'date' },
      { key: 'amountMl', label: 'Ilość (ml)', type: 'number' },
      { key: 'notes', label: 'Notatki', type: 'text' },
      { key: 'userProfileId', label: 'Profil', type: 'number' },
    ],
    displayFields: ['drinkDate', 'amountMl', 'notes'],
  },
  {
    key: 'appointments',
    title: 'Rezerwacje',
    endpoint: 'appointments',
    fields: [
      { key: 'patientName', label: 'Pacjent', type: 'text' },
      { key: 'appointmentDate', label: 'Data wizyty', type: 'date' },
      { key: 'dietitianId', label: 'Dietetyk', type: 'number' },
      { key: 'userProfileId', label: 'Profil', type: 'number' },
    ],
    displayFields: ['patientName', 'appointmentDate', 'dietitianId'],
  },
];

const dayPlanEntity: EntityConfig = {
  key: 'dayplans',
  title: 'Plan dnia',
  endpoint: 'dayplans',
  fields: [
    { key: 'planDate', label: 'Data i godzina', type: 'date' },
    { key: 'mealTime', label: 'Rodzaj posiłku', type: 'text' },
    { key: 'mealId', label: 'Posiłek', type: 'number' },
    { key: 'notes', label: 'Notatki', type: 'text' },
    { key: 'userProfileId', label: 'Profil', type: 'number' },
  ],
  displayFields: ['mealTime', 'mealId', 'notes'],
};

function formatDateForDisplay(value: string) {
  return String(value || '').replace('T', ' ').slice(0, 16);
}

function formatDateForApi(value: string) {
  return value.includes('T') ? value : value.replace(' ', 'T');
}

function createEmptyForm(entity: EntityConfig, selectedProfile: any | null): FormData {
  const form: FormData = {};

  entity.fields.forEach(field => {
    if (field.key === 'userProfileId' && selectedProfile?.id) {
      form[field.key] = String(selectedProfile.id);
    } else if (field.key === 'patientName' && selectedProfile?.fullName) {
      form[field.key] = selectedProfile.fullName;
    } else if (
      field.key === 'planDate' ||
      field.key === 'appointmentDate' ||
      field.key === 'measurementDate' ||
      field.key === 'drinkDate'
    ) {
      form[field.key] = '2026-05-10 10:00';
    } else if (field.type === 'boolean') {
      form[field.key] = 'true';
    } else {
      form[field.key] = '';
    }
  });

  return form;
}

function preparePayload(entity: EntityConfig, form: FormData, editedItem: any, selectedProfile: any | null) {
  const payload: Record<string, any> = {};

  if (editedItem?.id) {
    payload.id = editedItem.id;
  }

  entity.fields.forEach(field => {
    let value = form[field.key];

    if (field.key === 'userProfileId' && selectedProfile?.id) {
      value = String(selectedProfile.id);
    }

    if (field.type === 'number') {
      payload[field.key] = value === '' ? null : Number(value);
    } else if (field.type === 'boolean') {
      payload[field.key] = value === 'true';
    } else if (field.type === 'date') {
      payload[field.key] = formatDateForApi(value);
    } else {
      payload[field.key] = value;
    }
  });

  return payload;
}

function getFieldLabel(entity: EntityConfig, fieldKey: string) {
  const field = entity.fields.find(item => item.key === fieldKey);
  return field?.label || fieldKey;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [selectedEntityKey, setSelectedEntityKey] = useState('bodymeasurements');
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [dayPlans, setDayPlans] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState('2026-05-11');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editedItem, setEditedItem] = useState<any | null>(null);
  const [form, setForm] = useState<FormData>({});
  const [modalEntity, setModalEntity] = useState<EntityConfig | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [lookups, setLookups] = useState({
    categories: [] as any[],
    dietitians: [] as any[],
    meals: [] as any[],
  });

  const selectedEntity = useMemo(
    () => entities.find(entity => entity.key === selectedEntityKey) || entities[0],
    [selectedEntityKey],
  );

  const activeEntity = modalEntity || selectedEntity;

  async function loadProfiles() {
    try {
      const response = await fetch(`${API_URL}/userprofiles`);
      const data = await response.json();
      setProfiles(data);
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się pobrać profili.');
    }
  }

  async function loadLookups() {
    try {
      const [categoriesResponse, dietitiansResponse, mealsResponse] = await Promise.all([
        fetch(`${API_URL}/categories`),
        fetch(`${API_URL}/dietitians`),
        fetch(`${API_URL}/meals`),
      ]);

      const [categories, dietitians, meals] = await Promise.all([
        categoriesResponse.json(),
        dietitiansResponse.json(),
        mealsResponse.json(),
      ]);

      setLookups({ categories, dietitians, meals });
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się pobrać danych do formularzy.');
    }
  }

  async function loadItems() {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${selectedEntity.endpoint}`);
      const data = await response.json();

      if (selectedProfile && ['bodymeasurements', 'goals', 'appointments', 'waterintakes'].includes(selectedEntity.key)) {
        setItems(data.filter((item: any) => item.userProfileId === selectedProfile.id));
      } else {
        setItems(data);
      }
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się pobrać danych z API.');
    } finally {
      setLoading(false);
    }
  }

  async function loadDayPlans() {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/dayplans`);
      const data = await response.json();
      const filtered = data.filter((item: any) => {
        const itemDate = String(item.planDate).slice(0, 10);
        return item.userProfileId === selectedProfile?.id && itemDate === selectedDate;
      });
      setDayPlans(filtered);
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się pobrać planu dnia.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfiles();
    loadLookups();
  }, []);

  useEffect(() => {
    if (screen === 'manager') {
      loadItems();
      loadLookups();
    }
  }, [selectedEntityKey, selectedProfile, screen]);

  useEffect(() => {
    if (screen === 'dayPlanner') {
      loadDayPlans();
      loadLookups();
    }
  }, [selectedDate, selectedProfile, screen]);

  function getOptionsForField(fieldKey: string) {
    if (fieldKey === 'mealTime') {
      return [
        { label: 'Śniadanie', value: 'Śniadanie' },
        { label: 'Drugie śniadanie', value: 'Drugie śniadanie' },
        { label: 'Lunch', value: 'Lunch' },
        { label: 'Obiad', value: 'Obiad' },
        { label: 'Podwieczorek', value: 'Podwieczorek' },
        { label: 'Przekąska', value: 'Przekąska' },
        { label: 'Kolacja', value: 'Kolacja' },
      ];
    }

    if (fieldKey === 'categoryId') {
      return lookups.categories.map(category => ({ label: category.name, value: String(category.id) }));
    }

    if (fieldKey === 'dietitianId') {
      return lookups.dietitians.map(dietitian => ({ label: dietitian.fullName, value: String(dietitian.id) }));
    }

    if (fieldKey === 'mealId') {
      return lookups.meals.map(meal => ({ label: meal.name, value: String(meal.id) }));
    }

    return [];
  }

  function isSelectField(fieldKey: string) {
    return fieldKey === 'categoryId' || fieldKey === 'dietitianId' || fieldKey === 'mealId' || fieldKey === 'mealTime';
  }

  function getDefaultValue(fieldKey: string) {
    const options = getOptionsForField(fieldKey);
    return options[0]?.value || '';
  }

  function openModal(entity: EntityConfig, item: any | null = null) {
    const nextForm: FormData = item ? {} : createEmptyForm(entity, selectedProfile);

    entity.fields.forEach(field => {
      if (item) {
        nextForm[field.key] = field.type === 'date' ? formatDateForDisplay(item[field.key]) : String(item[field.key] ?? '');
      }

      if (!item && isSelectField(field.key)) {
        nextForm[field.key] = getDefaultValue(field.key);
      }
    });

    setModalEntity(entity);
    setEditedItem(item);
    setForm(nextForm);
    setModalVisible(true);
  }

  async function saveItem() {
    if (!modalEntity) {
      return;
    }

    try {
      const payload = preparePayload(modalEntity, form, editedItem, selectedProfile);
      const isEditing = Boolean(editedItem?.id);

      const response = await fetch(
        isEditing
          ? `${API_URL}/${modalEntity.endpoint}/${editedItem.id}`
          : `${API_URL}/${modalEntity.endpoint}`,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error('Save failed');
      }

      setModalVisible(false);
      setModalEntity(null);
      await loadProfiles();

      if (screen === 'dayPlanner') {
        await loadDayPlans();
      } else {
        await loadItems();
      }
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się zapisać danych.');
    }
  }

  function confirmDelete(entity: EntityConfig, item: any) {
    Alert.alert('Usuwanie', 'Czy na pewno chcesz usunąć ten element?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: () => deleteItem(entity, item),
      },
    ]);
  }

  async function deleteItem(entity: EntityConfig, item: any) {
    try {
      const response = await fetch(`${API_URL}/${entity.endpoint}/${item.id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      if (entity.key === 'userprofiles' && selectedProfile?.id === item.id) {
        setSelectedProfile(null);
        setScreen('profileSelect');
      }

      await loadProfiles();

      if (screen === 'dayPlanner') {
        await loadDayPlans();
      } else {
        await loadItems();
      }
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się usunąć elementu.');
    }
  }

  function formatFieldValue(item: any, fieldKey: string) {
    if (fieldKey === 'categoryId') {
      return item.category?.name || 'Brak kategorii';
    }

    if (fieldKey === 'dietitianId') {
      return item.dietitian?.fullName || 'Brak dietetyka';
    }

    if (fieldKey === 'mealId') {
      return item.meal?.name || 'Brak posiłku';
    }

    if (['planDate', 'appointmentDate', 'measurementDate', 'drinkDate'].includes(fieldKey)) {
      return formatDateForDisplay(item[fieldKey]);
    }

    return String(item[fieldKey] ?? '');
  }

  function getItemTitle(item: any, entity: EntityConfig) {
    if (entity.key === 'bodymeasurements') {
      return `Pomiar z dnia ${formatDateForDisplay(item.measurementDate)}`;
    }

    if (entity.key === 'goals') {
      return item.goalType || `Cel #${item.id}`;
    }

    if (entity.key === 'appointments') {
      return `${item.patientName} - ${formatDateForDisplay(item.appointmentDate)}`;
    }

    if (entity.key === 'waterintakes') {
      return `${item.amountMl} ml - ${formatDateForDisplay(item.drinkDate)}`;
    }

    if (entity.key === 'dayplans') {
      return `${item.mealTime} - ${item.meal?.name || 'Posiłek'}`;
    }

    const firstField = entity.displayFields[0];
    return item.name || item.fullName || item[firstField] || `Element #${item.id}`;
  }

  function changeDate(offset: number) {
    const date = new Date(`${selectedDate}T12:00:00`);
    date.setDate(date.getDate() + offset);
    setSelectedDate(date.toISOString().slice(0, 10));
  }

  const dayTotals = dayPlans.reduce(
    (total, item) => {
      total.calories += item.meal?.calories || 0;
      total.protein += item.meal?.protein || 0;
      total.carbs += item.meal?.carbs || 0;
      total.fat += item.meal?.fat || 0;
      total.sugar += item.meal?.sugar || 0;
      return total;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 },
  );

  if (screen === 'profileSelect') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.logo}>Diet Planner</Text>
          <Text style={styles.title}>Wybierz profil</Text>
          <Text style={styles.description}>Prowadź dietę dla siebie lub bliskiej osoby.</Text>

          {profiles.map(profile => (
            <View key={profile.id} style={styles.dataCard}>
              <Text style={styles.cardTitle}>{profile.fullName}</Text>
              <Text style={styles.dataText}>Płeć: {profile.gender}</Text>
              <Text style={styles.dataText}>Wiek: {profile.age}</Text>
              <Text style={styles.dataText}>Wzrost: {profile.heightCm} cm</Text>

              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setSelectedProfile(profile);
                  setScreen('manager');
                }}>
                <Text style={styles.buttonText}>Wybierz profil</Text>
              </TouchableOpacity>

              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.editButton} onPress={() => openModal(profileEntity, profile)}>
                  <Text style={styles.actionText}>Edytuj</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(profileEntity, profile)}>
                  <Text style={styles.actionText}>Usuń</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.button} onPress={() => openModal(profileEntity)}>
            <Text style={styles.buttonText}>Dodaj profil</Text>
          </TouchableOpacity>
        </ScrollView>

        {renderModal()}
      </SafeAreaView>
    );
  }

  if (screen === 'dayPlanner') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadDayPlans} />}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.logo}>Diet Planner</Text>
              <Text style={styles.title}>Plan dnia</Text>
              <Text style={styles.description}>{selectedProfile?.fullName}</Text>
            </View>
            <TouchableOpacity style={styles.smallButton} onPress={() => setScreen('manager')}>
              <Text style={styles.smallButtonText}>Panel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateNavigator}>
            <TouchableOpacity style={styles.dateButton} onPress={() => changeDate(-1)}>
              <Text style={styles.dateButtonText}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={styles.dateTitle}>{selectedDate}</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => changeDate(1)}>
              <Text style={styles.dateButtonText}>{'>'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => openModal(dayPlanEntity)}>
            <Text style={styles.buttonText}>Dodaj posiłek do dnia</Text>
          </TouchableOpacity>

          {dayPlans.map(item => (
            <View key={item.id} style={styles.dataCard}>
              <Text style={styles.cardTitle}>{getItemTitle(item, dayPlanEntity)}</Text>
              <Text style={styles.dataText}>Data i godzina: {formatDateForDisplay(item.planDate)}</Text>
              <Text style={styles.dataText}>Notatki: {item.notes || 'Brak'}</Text>
              <Text style={styles.dataText}>Kalorie: {item.meal?.calories || 0} kcal</Text>

              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.editButton} onPress={() => openModal(dayPlanEntity, item)}>
                  <Text style={styles.actionText}>Edytuj</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(dayPlanEntity, item)}>
                  <Text style={styles.actionText}>Usuń</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Podsumowanie dnia</Text>
            <Text style={styles.dataText}>Kalorie: {dayTotals.calories} kcal</Text>
            <Text style={styles.dataText}>Białko: {dayTotals.protein} g</Text>
            <Text style={styles.dataText}>Węgle: {dayTotals.carbs} g</Text>
            <Text style={styles.dataText}>Tłuszcze: {dayTotals.fat} g</Text>
            <Text style={styles.dataText}>Cukry: {dayTotals.sugar} g</Text>
          </View>
        </ScrollView>

        {renderModal()}
      </SafeAreaView>
    );
  }

  if (screen === 'manager') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadItems} />}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.logo}>Diet Planner</Text>
              <Text style={styles.title}>Panel diety</Text>
              <Text style={styles.description}>{selectedProfile?.fullName}</Text>
            </View>
            <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(!menuVisible)}>
              <Text style={styles.menuButtonText}>...</Text>
            </TouchableOpacity>
          </View>

          {menuVisible && (
            <View style={styles.menuBox}>
              <TouchableOpacity onPress={() => openModal(profileEntity, selectedProfile)}>
                <Text style={styles.menuItem}>Twój profil</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setScreen('profileSelect')}>
                <Text style={styles.menuItem}>Przełącz profil</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => selectedProfile && confirmDelete(profileEntity, selectedProfile)}>
                <Text style={styles.menuItem}>Usuń profil</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.profileSummaryCard}>
            <Text style={styles.profileSummaryIcon}>🥗</Text>
            <View style={styles.profileSummaryText}>
              <Text style={styles.cardTitle}>Plan dla: {selectedProfile?.fullName}</Text>
              <Text style={styles.text}>Kontroluj posiłki, pomiary, cele i nawodnienie w jednym miejscu.</Text>
            </View>
          </View>

          <View style={styles.entityGrid}>
            <TouchableOpacity style={styles.entityTile} onPress={() => setScreen('dayPlanner')}>
              <Text style={styles.entityTileText}>Plan dnia</Text>
            </TouchableOpacity>
            {entities.map(entity => (
              <TouchableOpacity
                key={entity.key}
                style={[styles.entityTile, selectedEntity.key === entity.key && styles.activeEntityTile]}
                onPress={() => setSelectedEntityKey(entity.key)}>
                <Text style={[styles.entityTileText, selectedEntity.key === entity.key && styles.activeEntityTileText]}>
                  {entity.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.button} onPress={() => openModal(selectedEntity)}>
            <Text style={styles.buttonText}>Dodaj: {selectedEntity.title}</Text>
          </TouchableOpacity>

          {items.map(item => (
            <View key={item.id} style={styles.dataCard}>
              <Text style={styles.cardTitle}>{getItemTitle(item, selectedEntity)}</Text>

              {selectedEntity.displayFields.map(field => (
                <Text key={field} style={styles.dataText}>
                  {getFieldLabel(selectedEntity, field)}: {formatFieldValue(item, field)}
                </Text>
              ))}

              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.editButton} onPress={() => openModal(selectedEntity, item)}>
                  <Text style={styles.actionText}>Edytuj</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(selectedEntity, item)}>
                  <Text style={styles.actionText}>Usuń</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {renderModal()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.logo}>Diet Planner</Text>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Twój plan zdrowego odżywiania</Text>
          <Text style={styles.heroText}>
            Prowadź profile domowników, kontroluj postępy i planuj zdrowe posiłki.
          </Text>
        </View>

        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeIcon}>🥗</Text>
          <View style={styles.welcomeTextBox}>
            <Text style={styles.cardTitle}>Witaj w Diet Planner</Text>
            <Text style={styles.text}>Wybierz profil, dodawaj pomiary, ustaw cele i zapisuj posiłki.</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Plan dnia</Text>
          <Text style={styles.text}>Układaj posiłki na konkretne dni i sprawdzaj kalorie oraz makro.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Konsultacje</Text>
          <Text style={styles.text}>Wybierz dietetyka i zaplanuj konsultację dla wybranego profilu.</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => setScreen('profileSelect')}>
          <Text style={styles.buttonText}>Wybierz profil</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );

  function renderModal() {
    if (!modalEntity) {
      return null;
    }

    return (
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editedItem ? 'Edytuj' : 'Dodaj'}: {modalEntity.title}
              </Text>

              {modalEntity.fields
                .filter(field => !(field.key === 'userProfileId' && selectedProfile))
                .map(field => (
                  <View key={field.key} style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{field.label}</Text>

                    {isSelectField(field.key) ? (
                      <View style={styles.selectGrid}>
                        {getOptionsForField(field.key).map(option => (
                          <TouchableOpacity
                            key={option.value}
                            style={[styles.selectOption, form[field.key] === option.value && styles.activeSelectOption]}
                            onPress={() => setForm(current => ({ ...current, [field.key]: option.value }))}>
                            <Text
                              style={[
                                styles.selectOptionText,
                                form[field.key] === option.value && styles.activeSelectOptionText,
                              ]}>
                              {option.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : (
                      <TextInput
                        style={styles.input}
                        value={form[field.key]}
                        onChangeText={value => setForm(current => ({ ...current, [field.key]: value }))}
                        keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                        placeholder={field.type === 'date' ? '2026-05-10 10:00' : field.label}
                        placeholderTextColor="#9A8F86"
                      />
                    )}
                  </View>
                ))}

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Anuluj</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={saveItem}>
                  <Text style={styles.saveButtonText}>Zapisz</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF4E6',
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: '#E65100',
    marginBottom: 8,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#E65100',
  },
  description: {
    color: '#6D4C41',
    fontSize: 14,
    marginTop: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  hero: {
    backgroundColor: '#FB8C00',
    padding: 22,
    borderRadius: 20,
    marginBottom: 18,
  },
  heroTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroText: {
    fontSize: 15,
    color: '#FFF3E0',
    lineHeight: 22,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  welcomeIcon: {
    fontSize: 42,
    marginRight: 14,
  },
  welcomeTextBox: {
    flex: 1,
  },
  profileSummaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  profileSummaryIcon: {
    fontSize: 42,
    marginRight: 14,
  },
  profileSummaryText: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  dataCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    marginBottom: 26,
    borderWidth: 2,
    borderColor: '#FB8C00',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FB8C00',
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    color: '#5D4037',
    lineHeight: 20,
  },
  dataText: {
    fontSize: 13,
    color: '#5D4037',
    marginBottom: 3,
  },
  button: {
    backgroundColor: '#E65100',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  smallButton: {
    backgroundColor: '#E65100',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  smallButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  menuButton: {
    width: 44,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#E65100',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: -8,
  },
  menuBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  menuItem: {
    color: '#E65100',
    fontWeight: '800',
    paddingVertical: 10,
  },
  entityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  entityTile: {
    width: '48%',
    minHeight: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FB8C00',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  activeEntityTile: {
    backgroundColor: '#FB8C00',
  },
  entityTileText: {
    color: '#E65100',
    fontWeight: '800',
    fontSize: 13,
    textAlign: 'center',
  },
  activeEntityTileText: {
    color: '#FFFFFF',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#FB8C00',
    padding: 11,
    borderRadius: 14,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#D84315',
    padding: 11,
    borderRadius: 14,
    alignItems: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dateNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  dateButton: {
    width: 48,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FB8C00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  dateTitle: {
    color: '#E65100',
    fontSize: 18,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(93, 64, 55, 0.45)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    maxHeight: '82%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#E65100',
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6D4C41',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFF4E6',
    borderWidth: 2,
    borderColor: '#FFE0B2',
    borderRadius: 14,
    padding: 12,
    color: '#5D4037',
    fontSize: 15,
  },
  selectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectOption: {
    minWidth: '47%',
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FB8C00',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  activeSelectOption: {
    backgroundColor: '#FB8C00',
  },
  selectOptionText: {
    color: '#E65100',
    fontWeight: '800',
    fontSize: 13,
    textAlign: 'center',
  },
  activeSelectOptionText: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 13,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FB8C00',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#E65100',
    fontWeight: '800',
  },
  saveButton: {
    flex: 1,
    padding: 13,
    borderRadius: 14,
    backgroundColor: '#E65100',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
 