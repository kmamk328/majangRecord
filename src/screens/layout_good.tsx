import React, { useEffect, useState } from 'react';
import { ScrollView, TextInput, StyleSheet } from 'react-native';
import { Box, Button, Center, NativeBaseProvider, VStack, HStack, Select, CheckIcon, Switch, Text } from 'native-base';
import firestore from '@react-native-firebase/firestore';
import { readFile } from 'react-native-fs';

const ScoreInputScreen = () => {
  const [members, setMembers] = useState([]);
  const [roundData, setRoundData] = useState({
    winner: '',
    winnerPoints: '',
    discarder: '',
    discarderPoints: '',
    naki: false,
    reach: false,
    tsumo: false,
  });
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const snapshot = await firestore().collection('members').get();
      const membersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembers(membersList);
    };

    fetchMembers();
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const rolesContent = await readFile('/path/to/roles.txt', 'utf8');
      const rolesArray = rolesContent.split('\n').map(line => line.trim());
      setRoles(rolesArray);
    } catch (error) {
      console.error('Failed to load roles.txt', error);
    }
  };

  const handleNext = async () => {
    try {
      await firestore().collection('rounds').add(roundData);
      setRoundData({
        winner: '',
        winnerPoints: '',
        discarder: '',
        discarderPoints: '',
        naki: false,
        reach: false,
        tsumo: false,
      });
    } catch (error) {
      console.error('Failed to add round data', error);
    }
  };

  const handlePrevious = () => {
    // Handle previous round navigation
  };

  const handleFinish = () => {
    // Handle finish action
  };

  const handleChange = (key, value) => {
    setRoundData(prevState => ({
      ...prevState,
      [key]: value,
    }));
  };

  return (
    <NativeBaseProvider>
      <ScrollView>
        <Box p={4}>
          <VStack space={4}>
            <Select
              selectedValue={roundData.winner}
              minWidth={200}
              placeholder="和了者"
              onValueChange={value => handleChange('winner', value)}
              _selectedItem={{
                bg: "teal.600",
                endIcon: <CheckIcon size={5} />,
              }}
            >
              {members.map(member => (
                <Select.Item key={member.id} label={member.name} value={member.name} />
              ))}
            </Select>
            <TextInput
              style={styles.input}
              placeholder="和了点"
              value={roundData.winnerPoints}
              onChangeText={text => handleChange('winnerPoints', text)}
              keyboardType="numeric"
            />
            <Select
              selectedValue={roundData.discarder}
              minWidth={200}
              placeholder="放銃者"
              onValueChange={value => handleChange('discarder', value)}
              _selectedItem={{
                bg: "teal.600",
                endIcon: <CheckIcon size={5} />,
              }}
            >
              {members.map(member => (
                <Select.Item key={member.id} label={member.name} value={member.name} />
              ))}
            </Select>
            <TextInput
              style={styles.input}
              placeholder="放銃点"
              value={roundData.discarderPoints}
              onChangeText={text => handleChange('discarderPoints', text)}
              keyboardType="numeric"
            />
            <HStack space={4} alignItems="center">
              <Text>ツモ:</Text>
              <Switch value={roundData.tsumo} onValueChange={value => handleChange('tsumo', value)} />
              <Text>鳴き:</Text>
              <Switch value={roundData.naki} onValueChange={value => handleChange('naki', value)} />
              <Text>リーチ:</Text>
              <Switch value={roundData.reach} onValueChange={value => handleChange('reach', value)} />
            </HStack>
            <Button onPress={() => console.log('Roles:', roles)}>役を選択</Button>
            <HStack space={3} mb={4}>
              <Button flex={1} onPress={handlePrevious}>前へ</Button>
              <Button flex={1} onPress={handleNext}>次へ</Button>
              <Button flex={1} onPress={handleFinish}>終了</Button>
            </HStack>
          </VStack>
        </Box>
      </ScrollView>
    </NativeBaseProvider>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
  },
});

export default ScoreInputScreen;
