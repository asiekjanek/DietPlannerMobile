import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  const [screen, setScreen] = useState('dashboard');

  if (screen === 'meals') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.logo}>🥗 Diet Planner</Text>
          <Text style={styles.title}>Posiłki</Text>
          <Text style={styles.description}>
            Przykładowe posiłki, które później będzie można dodawać do planu diety.
          </Text>

          <View style={styles.mealCard}>
            <Text style={styles.mealIcon}>🥗</Text>
            <View>
              <Text style={styles.subtitle}>Sałatka z kurczakiem</Text>
              <Text style={styles.text}>Zdrowy posiłek z warzywami i kurczakiem.</Text>
            </View>
          </View>

          <View style={styles.mealCard}>
            <Text style={styles.mealIcon}>🥣</Text>
            <View>
              <Text style={styles.subtitle}>Owsianka</Text>
              <Text style={styles.text}>Śniadanie z płatkami owsianymi i owocami.</Text>
            </View>
          </View>

          <View style={styles.mealCard}>
            <Text style={styles.mealIcon}>🥪</Text>
            <View>
              <Text style={styles.subtitle}>Kanapki</Text>
              <Text style={styles.text}>Lekki posiłek na szybko.</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => setScreen('dashboard')}>
            <Text style={styles.secondaryButtonText}>Wróć do ekranu głównego</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.logo}>🥗 Diet Planner</Text>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Twój plan zdrowego odżywiania</Text>
          <Text style={styles.heroText}>
            Planuj posiłki, kontroluj dietę i umawiaj konsultacje z dietetykiem.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardIcon}>📅</Text>
          <View>
            <Text style={styles.subtitle}>Dzisiejszy plan</Text>
            <Text style={styles.text}>Brak zaplanowanych posiłków</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardIcon}>👩‍⚕️</Text>
          <View>
            <Text style={styles.subtitle}>Konsultacje</Text>
            <Text style={styles.text}>Brak zaplanowanych wizyt</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardIcon}>🔥</Text>
          <View>
            <Text style={styles.subtitle}>Cel</Text>
            <Text style={styles.text}>Utrzymanie zdrowej diety</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => setScreen('meals')}>
          <Text style={styles.buttonText}>Przejdź do posiłków</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF4E6',
  },
  logo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 18,
  },
  hero: {
    backgroundColor: '#FB8C00',
    padding: 22,
    borderRadius: 20,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroText: {
    fontSize: 15,
    color: '#FFF3E0',
    lineHeight: 22,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#6D4C41',
    marginBottom: 18,
    lineHeight: 22,
  },
  card: {
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
  mealCard: {
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
  cardIcon: {
    fontSize: 30,
    marginRight: 14,
  },
  mealIcon: {
    fontSize: 34,
    marginRight: 14,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FB8C00',
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: '#5D4037',
    lineHeight: 20,
    maxWidth: 260,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#E65100',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#FB8C00',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  secondaryButtonText: {
    color: '#E65100',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
