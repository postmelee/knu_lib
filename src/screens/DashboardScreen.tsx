import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useSeatState, useReadingRooms } from '../hooks/queries/useSeat';
import { UserState } from '../api/types/seat';
import { useAuthSession } from '../hooks/queries/useAuth';
import { useRouter } from 'expo-router';
import { ReadingRoomCard } from '../components/ReadingRoomCard';
import { ActiveSessionCard } from '../components/ActiveSessionCard';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { textColors } from '../styles/typography';

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
        requireBeacon: Boolean(room.l_flag_beacon_validation) && room.l_flag_beacon_validation !== "0" && room.l_flag_beacon_validation !== 0 ? 'true' : 'false',
      }
    });
  };

  if (!session) {
    return (
      <View style={styles.center}>
        <Text preset="t3Bold" color={textColors.primary} style={styles.titleSpacing}>Welcome to KNU Library</Text>
        <Text preset="t6Medium" color={textColors.secondary}>Please log in via the University SSO to continue</Text>
      </View>
    );
  }

  if (isSeatLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={textColors.blue} />
        <Text preset="t6Medium" color={textColors.tertiary} style={styles.loadingText}>Evaluating State...</Text>
      </View>
    );
  }

  // Branching Logic
  if (state === UserState.UNAUTHORIZED) {
    return (
      <View style={styles.center}>
        <Text preset="t3Bold" color={textColors.primary} style={styles.titleSpacing}>Session Expired</Text>
        <Text preset="t6Medium" color={textColors.secondary} style={styles.subtitleSpacing}>Could not load library seat information.</Text>
        <Button variant="fill" color="primary" onPress={() => refetchSeat()}>다시 시도</Button>
      </View>
    );
  }

  if (state === UserState.SEATED || state === UserState.AWAY) {
    return (
      <View style={styles.container}>
        <View style={styles.paddedContent}>
          <ActiveSessionCard />
        </View>
      </View>
    );
  }

  // State === IDLE
  return (
    <View style={styles.container}>
      {loadingRooms ? (
         <View style={styles.centerList}>
             <ActivityIndicator size="large" color={textColors.blue} />
         </View>
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
          style={{backgroundColor: '#f9fafb',}}
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
    backgroundColor: '#f9fafb',
    padding: 24,
  },
  titleSpacing: {
    marginBottom: 8,
  },
  subtitleSpacing: {
    marginBottom: 24,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Native header blends nicely with white
  },
  paddedContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  centerList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingTop: 16,
    paddingBottom: 40,
    gap: 12,
    backgroundColor: '#f9fafb',
  }
});
