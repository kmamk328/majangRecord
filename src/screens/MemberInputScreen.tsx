import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db } from '../../firebaseConfig';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';

const MemberInputScreen = () => {
  const [members, setMembers] = useState(['', '', '', '']);
  const navigation = useNavigation();

  const handleChange = (text, index) => {
    const newMembers = [...members];
    newMembers[index] = text;
    setMembers(newMembers);
  };

  const handleNext = async () => {
    const membersCollection = collection(db, 'members');
    const memberIds = [];

    for (const member of members) {
      // メンバーが既に存在するか確認
      const q = query(membersCollection, where("name", "==", member));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // メンバーが存在しない場合、新規作成
        const newMemberRef = doc(membersCollection);
        await setDoc(newMemberRef, { name: member });
        memberIds.push(newMemberRef.id);
      } else {
        // メンバーが存在する場合、そのIDを使用
        querySnapshot.forEach((doc) => {
          memberIds.push(doc.id);
        });
      }
    }

    // 新しいゲームドキュメントを作成
    const gameRef = doc(collection(db, 'games'));
    await setDoc(gameRef, { createdAt: new Date(), members: memberIds });

    // スコア入力画面にゲームIDを渡して移動
    navigation.navigate('ScoreInput', { gameId: gameRef.id, members: memberIds });
  };

  return (
    <View style={styles.container}>
      <Text>メンバーを入力してください:</Text>
      {members.map((member, index) => (
        <TextInput
          key={index}
          style={styles.input}
          value={member}
          onChangeText={(text) => handleChange(text, index)}
        />
      ))}
      <Button title="次へ" onPress={handleNext} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 10 }
});

export default MemberInputScreen;
