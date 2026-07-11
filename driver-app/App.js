import React, { useState, useEffect, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Platform, Alert, AppState, Linking
} from 'react-native'
import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'

const LOCATION_TASK = 'nrc-background-location'
const STORAGE_KEY = '@nrc_truck_id'
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://nrc-tms-api.onrender.com'

TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
  if (error) return
  if (data) {
    const { locations } = data
    const loc = locations[locations.length - 1]
    if (loc) {
      const { latitude, longitude } = loc.coords
      const speed = loc.coords.speed ? Math.round(loc.coords.speed * 3.6) : 0
      try {
        const truckId = await AsyncStorage.getItem(STORAGE_KEY)
        if (truckId) {
          await fetch(`${API_URL}/api/location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ truck_id: Number(truckId), latitude, longitude, speed })
          })
        }
      } catch {}
    }
  }
})

export default function App() {
  const [truckId, setTruckId] = useState('')
  const [savedId, setSavedId] = useState(null)
  const [tracking, setTracking] = useState(false)
  const [status, setStatus] = useState('idle')
  const [coords, setCoords] = useState(null)
  const [speed, setSpeed] = useState(0)
  const [pings, setPings] = useState(0)
  const [bgMode, setBgMode] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const appState = useRef(AppState.currentState)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((id) => {
      if (id) { setSavedId(id); setTruckId(id) }
    }).catch(() => {}).finally(() => setReady(true))
  }, [])

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/active/) && next.match(/inactive|background/)) {
        setBgMode(true)
      } else if (next === 'active') {
        setBgMode(false)
      }
      appState.current = next
    })
    return () => sub.remove()
  }, [])

  const startTracking = async (id) => {
    setError('')
    try {
      const { status: perm } = await Location.requestForegroundPermissionsAsync()
      if (perm !== 'granted') { setError('Location permission denied'); return }
    } catch (e) {
      setError('Could not request location permission')
      return
    }

    if (Platform.OS === 'android') {
      try {
        const { status: bg } = await Location.requestBackgroundPermissionsAsync()
        if (bg !== 'granted') { setError('Background location denied'); return }
      } catch (e) {
        setError('Could not request background permission')
        return
      }
    }

    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK)
      if (hasStarted) await Location.stopLocationUpdatesAsync(LOCATION_TASK)

      await Location.startLocationUpdatesAsync(LOCATION_TASK, {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
        foregroundService: {
          notificationTitle: 'NRC Driver',
          notificationBody: 'GPS tracking active',
        },
        pausesUpdatesAutomatically: false,
      })

      setSavedId(id)
      setTracking(true)
      await AsyncStorage.setItem(STORAGE_KEY, id)

      Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
        async (loc) => {
          const { latitude, longitude } = loc.coords
          const spd = loc.coords.speed ? Math.round(loc.coords.speed * 3.6) : 0
          setCoords({ latitude, longitude })
          setSpeed(spd)
          setStatus(spd > 5 ? 'on_route' : spd > 0.5 ? 'paused' : 'idle')
          setPings((p) => p + 1)
          try {
            await fetch(`${API_URL}/api/location`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ truck_id: Number(id), latitude, longitude, speed: spd })
            })
          } catch {}
        }
      )
    } catch (e) {
      setError('Failed to start tracking: ' + e.message)
    }
  }

  const stopTracking = async () => {
    try {
      if (await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK)) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK)
      }
    } catch {}
    setTracking(false)
    setSavedId(null)
    setCoords(null)
    setPings(0)
    await AsyncStorage.removeItem(STORAGE_KEY)
  }

  const handleStart = () => {
    if (!truckId.trim() || isNaN(Number(truckId))) {
      Alert.alert('Invalid', 'Enter a valid truck ID number')
      return
    }
    startTracking(truckId.trim())
  }

  if (!ready) return null

  if (!tracking) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.loginCard}>
          <View style={s.logo}>
            <Text style={s.logoText}>NRC</Text>
          </View>
          <Text style={s.title}>Driver GPS Tracker</Text>
          <Text style={s.subtitle}>National Resolve Carrier</Text>

          {error ? <Text style={s.error}>{error}</Text> : null}

          {savedId && (
            <TouchableOpacity style={s.resumeBtn} onPress={() => startTracking(savedId)}>
              <Text style={s.resumeBtnText}>Resume tracking (Truck #{savedId})</Text>
            </TouchableOpacity>
          )}

          <Text style={s.label}>Enter your Truck ID</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. 1"
            placeholderTextColor="#5d6f8a"
            keyboardType="number-pad"
            value={truckId}
            onChangeText={setTruckId}
          />

          <TouchableOpacity style={s.btn} onPress={handleStart}>
            <Text style={s.btnText}>Start Tracking</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.statusBar}>
          <View>
            <Text style={s.truckLabel}>Truck #{savedId}</Text>
            <Text style={s.statusText}>
              {bgMode ? 'Running in background' : 'Tracking active'}
            </Text>
          </View>
          <View style={[s.badge, {
            backgroundColor: status === 'on_route' ? 'rgba(34,197,94,0.15)' :
              status === 'paused' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)'
          }]}>
            <Text style={[s.badgeText, {
              color: status === 'on_route' ? '#22c55e' :
                status === 'paused' ? '#f59e0b' : '#ef4444'
            }]}>{status}</Text>
          </View>
        </View>

        <View style={s.grid}>
          <View style={s.gridItem}>
            <Text style={s.gridLabel}>Latitude</Text>
            <Text style={s.gridValue}>{coords?.latitude?.toFixed(6) || '—'}</Text>
          </View>
          <View style={s.gridItem}>
            <Text style={s.gridLabel}>Longitude</Text>
            <Text style={s.gridValue}>{coords?.longitude?.toFixed(6) || '—'}</Text>
          </View>
          <View style={s.gridItem}>
            <Text style={s.gridLabel}>Speed</Text>
            <Text style={s.gridValue}>{speed} km/h</Text>
          </View>
          <View style={s.gridItem}>
            <Text style={s.gridLabel}>Pings Sent</Text>
            <Text style={s.gridValue}>{pings}</Text>
          </View>
        </View>

        {coords && (
          <TouchableOpacity style={s.mapBtn} onPress={() => {
            Linking.openURL(`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`).catch(() => {})
          }}>
            <Text style={s.mapBtnText}>Open in Google Maps</Text>
          </TouchableOpacity>
        )}

        <Text style={s.bgLabel}>
          <Text style={{ fontWeight: '700', color: '#e8edf5' }}>✓ Background mode active</Text>
          {'\n'}GPS continues tracking even when phone is locked.
        </Text>

        {error ? <Text style={s.error}>{error}</Text> : null}

        <TouchableOpacity style={s.stopBtn} onPress={stopTracking}>
          <Text style={s.stopBtnText}>Stop Tracking</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e17' },
  scroll: { padding: 20 },
  loginCard: {
    backgroundColor: '#131b2e', borderRadius: 16, padding: 32,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', margin: 20
  },
  logo: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: 16
  },
  logoText: { color: 'white', fontWeight: '800', fontSize: 18 },
  title: { color: '#e8edf5', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: '#8899b4', fontSize: 13, textAlign: 'center', marginBottom: 24 },
  label: { color: '#8899b4', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: '#1a2340', borderRadius: 8, padding: 14,
    color: '#e8edf5', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16
  },
  btn: {
    backgroundColor: '#3b82f6', borderRadius: 8, padding: 16, alignItems: 'center'
  },
  btnText: { color: 'white', fontWeight: '700', fontSize: 15 },
  resumeBtn: {
    backgroundColor: 'rgba(59,130,246,0.1)', borderRadius: 8,
    padding: 12, alignItems: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)'
  },
  resumeBtnText: { color: '#3b82f6', fontWeight: '600', fontSize: 13 },
  error: {
    color: '#ef4444', fontSize: 13, textAlign: 'center',
    backgroundColor: 'rgba(239,68,68,0.1)', padding: 10, borderRadius: 8, marginBottom: 16
  },
  statusBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#131b2e', borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 16
  },
  truckLabel: { color: '#e8edf5', fontSize: 18, fontWeight: '700' },
  statusText: { color: '#8899b4', fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    backgroundColor: '#131b2e', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 16
  },
  gridItem: {
    width: '47%', backgroundColor: '#1a2340', borderRadius: 8,
    padding: 14, alignItems: 'center'
  },
  gridLabel: {
    color: '#5d6f8a', fontSize: 10, textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: 4
  },
  gridValue: { color: '#e8edf5', fontSize: 15, fontWeight: '700' },
  mapBtn: {
    backgroundColor: '#1a2340', borderRadius: 8, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16
  },
  mapBtnText: { color: '#3b82f6', fontWeight: '600', fontSize: 14 },
  bgLabel: {
    color: '#5d6f8a', fontSize: 12, textAlign: 'center',
    marginBottom: 24, lineHeight: 18
  },
  stopBtn: {
    backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: 8,
    padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)'
  },
  stopBtnText: { color: '#ef4444', fontWeight: '700', fontSize: 15 },
})
