import React, { useState } from 'react';
import { View, ScrollView, TextInput, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Box, GluestackUIProvider, Input, ButtonText, ButtonIcon, Divider} from '@gluestack-ui/themed';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { db } from '../../firebaseConfig';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { config } from '@gluestack-ui/config';

import Gradient from '../../assets/Icons/Gradient';
import DocumentData from '../../assets/Icons/DocumentData';
import LightBulbPerson from '../../assets/Icons/LightbulbPerson';
import Rocket from '../../assets/Icons/Rocket';
import Logo from '../../assets/Icons/Logo';


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
    <ScrollView flex={1}>
    <Box
      style={styles.memberInputBox}
      borderWidth={0.5}
      borderColor="gray.300"
      padding={10}
      marginBottom={2}
    >

      <Text style={styles.getTitleText}>メンバーを入力してください</Text>
      <Divider bg="$trueGray300" $dark-bg="$backgroundDark700" />
      {members.map((member, index) => (
        <TextInput
          key={index}
          style={styles.input}
          value={member}
          onChangeText={(text) => handleChange(text, index)}
          placeholder={`メンバー ${index + 1}`}
      />
      ))}
      <Button title="次へ" onPress={handleNext} />
      {/* <Box>
        <Button
            style={styles.nextButton}
            size="md"
            variant="solid"
            action="primary"
            isDisabled={false}
            isFocusVisible={false}
            onPress={handleNext}
        />
        <ButtonText
          style={styles.nextButtonText}
        >
          次へ
        </ButtonText>
        <ButtonIcon as={Icon} name="navigate-next" mr="$2" />
      </Box> */}
    </Box>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    backgroundColor: '#fff',
    // 影のスタイルを追加
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  getTitleText: {
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 5,
  },
  nextButtonIcon: {
    marginLeft: 5,
  },
  memberInputBox: {
    marginBottom: 16,
    marginHorizontal: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000', // 影の色
    shadowOffset: { width: 0, height: 2 }, // 影のオフセット
    shadowOpacity: 0.25, // 影の不透明度
    shadowRadius: 3.84, // 影のぼかし範囲
    elevation: 5, // Androidのための影の高さ
  },

});

export default MemberInputScreen;
