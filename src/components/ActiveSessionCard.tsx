import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSeatState, useExtendSeat, useReleaseSeat } from '../hooks/queries/useSeat';
import { useLogout } from '../hooks/queries/useAuth';

export const ActiveSessionCard: React.FC = () => {
  const { data } = useSeatState();
  const raw = data?.raw;

  const extendMutation = useExtendSeat();
  const releaseMutation = useReleaseSeat();
  const logoutMutation = useLogout();

  const handleExtend = () => {
      extendMutation.mutate(undefined, {
          onSuccess: () => {
              Alert.alert("Success", "Seat extended successfully.");
          },
          onError: (error: any) => {
              Alert.alert("Extension Failed", error.message);
          }
      });
  };

  const handleRelease = () => {
      Alert.alert(
        "Release Seat",
        "Are you sure you want to release this seat?",
        [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Confirm", 
              style: "destructive",
              onPress: () => {
                 releaseMutation.mutate(undefined, {
                     onSuccess: () => {
                         Alert.alert("Success", "Seat released successfully.");
                     },
                     onError: (error: any) => {
                         Alert.alert("Release Failed", error.message);
                     }
                 });
              }
            }
        ]
      )
  };

  const handleLogout = () => {
       Alert.alert(
        "Logout",
        "Warning: Seat will be released on logout. Continue?",
        [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Logout", 
              style: "destructive",
              onPress: () => {
                // If seated, release first then logout
                releaseMutation.mutate(undefined, {
                    onSettled: () => logoutMutation.mutate()
                });
              }
            }
        ]
      )
  };

  if (!raw) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Active Session</Text>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>Room:</Text>
        <Text style={styles.value}>{raw.l_clicker_user_status_seat_room_name || 'Unknown'}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Seat No:</Text>
        <Text style={styles.value}>{raw.l_clicker_user_status_seat_number || 'N/A'}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Started:</Text>
        <Text style={styles.value}>{raw.l_clicker_user_status_seat_time_start || 'N/A'}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Ends:</Text>
        <Text style={styles.value}>{raw.l_clicker_user_status_seat_time_stop || 'N/A'}</Text>
      </View>

      <View style={styles.actionContainer}>
        {data.canExtend && (
            <TouchableOpacity style={styles.primaryButton} onPress={handleExtend} disabled={extendMutation.isPending}>
                <Text style={styles.buttonText}>{extendMutation.isPending ? 'Extending...' : 'Extend Seat'}</Text>
            </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.secondaryButton} onPress={handleRelease} disabled={releaseMutation.isPending}>
            <Text style={styles.buttonText}>{releaseMutation.isPending ? 'Releasing...' : 'Release Seat'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2e7d32', // green for active
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#1976d2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#e53935',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  logoutText: {
    color: '#d32f2f',
    fontSize: 14,
    textDecorationLine: 'underline',
  }
});
