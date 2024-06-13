import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { db } from '../../firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const ResultScreen = () => {
  const [result, setResult] = useState([]);
  const route = useRoute();
  const { gameId } = route.params;

  useEffect(() => {
    const fetchData = async () => {
      const roundsRef = collection(db, 'games', gameId, 'rounds');
      const roundsSnapshot = await getDocs(roundsRef);
      const rounds = roundsSnapshot.docs.map(doc => doc.data());

      const gameRef = doc(db, 'games', gameId);
      const gameData = await getDoc(gameRef);
      const members = gameData.data().members;

      const memberScores = {};

      for (const memberId of members) {
        const memberRef = doc(db, 'members', memberId);
        const memberData = await getDoc(memberRef);
        memberScores[memberId] = { name: memberData.data().name, totalPoints: memberData.data().totalPoints || 0 };
      }

      setResult(memberScores);
    };
    fetchData();
  }, [gameId]);

  return (
    <View style={styles.container}>
      <Text>結果:</Text>
      {Object.keys(result).map((memberId, index) => (
        <Text key={index}>{`${result[memberId].name}: ${result[memberId].totalPoints}`}</Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 }
});

export default ResultScreen;
