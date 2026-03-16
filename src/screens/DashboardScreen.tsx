import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Button, Alert } from 'react-native';
import { useSeatState, useReadingRooms } from '../hooks/queries/useSeat';
import { UserState } from '../api/types/seat';
import { useAuthSession } from '../hooks/queries/useAuth';
import { useRouter } from 'expo-router';
import { ReadingRoomCard } from '../components/ReadingRoomCard';
import { ActiveSessionCard } from '../components/ActiveSessionCard';

export const DashboardScreen: React.FC = () => {
  const router = useRouter();
  const { data: session } = useAuthSession();
  const { data: seatData, isLoading: isSeatLoading, refetch: refetchSeat } = useSeatState();
  
  // Only fetch rooms if state is IDLE
  const state = seatData?.currentState ?? UserState.UNAUTHORIZED;
  
  const { 
      data: rooms, 
      isLoading: loadingRooms, 
      refetch: refetchRooms,
      isFetching: isFetchingRooms 
  } = useReadingRooms();

  const handleRoomPress = (room: any) => {
    // Navigate to Reservation Screen, passing critical parameters
    router.push({
      pathname: '/(tabs)/seat-reservation',
      params: {
        roomId: room.l_id,
        roomName: room.l_room_name,
        requireBeacon: room.l_flag_beacon_validation === "1" || room.l_flag_beacon_validation === 1 ? 'true' : 'false',
      }
    });
  };

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Welcome to KNU Library</Text>
        <Text style={styles.subtitle}>Please log in via the University SSO to continue</Text>
      </View>
    );
  }

  if (isSeatLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Evaluating State...</Text>
      </View>
    );
  }

  // Branching Logic
  if (state === UserState.UNAUTHORIZED) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Session Expired</Text>
        <Text style={styles.subtitle}>Could not load library seat information.</Text>
        <Button title="Retry" onPress={() => refetchSeat()} />
      </View>
    );
  }

  if (state === UserState.SEATED || state === UserState.AWAY) {
    return (
      <View style={styles.container}>
        <Text style={styles.headerTitle}>My Reservation</Text>
        <ActiveSessionCard />
        <Button title="Refresh Status" onPress={() => refetchSeat()} />
      </View>
    );
  }

  // State === IDLE
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Available Reading Rooms</Text>
      {loadingRooms ? (
         <View style={{ padding: 20 }}><ActivityIndicator /></View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.l_id}
          renderItem={({ item }) => (
            <ReadingRoomCard room={item} onPress={handleRoomPress} />
          )}
          contentContainerStyle={styles.listContainer}
          refreshing={isFetchingRooms}
          onRefresh={refetchRooms}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: '#fff',
    color: '#333',
  },
  listContainer: {
    paddingBottom: 20,
  }
});
