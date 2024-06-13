import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { ScrollView, Alert } from 'react-native';
import { StyleSheet } from 'react-native';
import { GluestackUIProvider, Box, Text, Button, Modal, Select, Switch, HStack, Checkbox, VStack, AlertDialog, Spinner } from '@gluestack-ui/themed';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db } from '../../firebaseConfig';
import { getFirestore, collection, addDoc, doc, updateDoc, getDoc, getDocs, query, orderBy } from 'firebase/firestore';

const ScoreInputScreen = () => {
  const [currentRound, setCurrentRound] = useState({
    discarder: '',
    discarderPoints: '',
    isNaki: false,
    isReach: false,
    roundNumber: { round: '1', place: '東', honba: '0' },
    winner: '',
    winnerPoints: '',
    isTsumo: false,
    isOya: false, // 親かどうかの状態を追加
    roles: []
  });
  const [members, setMembers] = useState([]);
  const [rolesOptions, setRolesOptions] = useState([
    { role: 'リーチ', points: 1 },
    { role: '一発(イッパツ)', points: 1 },
    { role: 'ツモ', points: 1 },
    { role: '平和(ピンフ)', points: 1 },
    { role: '断么九(タンヤオ)', points: 1 },
    { role: '飜牌(ファンパイ)/役牌(やくはい)', points: 1 },
    { role: '一盃口(イーペーコー)', points: 1 },
    { role: '嶺上開花(リンシャンカイホー)', points: 1 },
    { role: '槍槓(チャンカン)', points: 1 },
    { role: '海底(ハイテイ)/河底(ホーテイ)', points: 1 },
    { role: 'ダブルリーチ', points: 1 },
    { role: '三色同順(サンショクドウジュン)', points: 1 },
    { role: '三色同刻(サンショクドウコー)', points: 1 },
    { role: '一気通貫(イッキツウカン)', points: 1 },
    { role: '対々和(トイトイホー)', points: 1 },
    { role: '三暗刻(サンアンコー)', points: 1 },
    { role: '三槓子(サンカンツ)', points: 1 },
    { role: '全帯么(チャンタ)', points: 1 },
    { role: '混老頭(ホンロートー)', points: 1 },
    { role: '小三元(ショウサンゲン)', points: 1 },
    { role: '七対子(チートイツ)', points: 1 },
    { role: '二盃口(リャンペーコー)', points: 1 },
    { role: '混一色(ホンイツ)', points: 1 },
    { role: '純全帯么(ジュンチャンタ)', points: 1 },
    { role: '清一色（チンイツ）', points: 1 },
  ]);
  const [availablePoints, setAvailablePoints] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const [filteredPoints, setFilteredPoints] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [rounds, setRounds] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const { gameId } = route.params;
  const [isTsumo, setIsTsumo] = useState(false);
  const [isNaki, setIsNaki] = useState(false);
  const [isReach, setIsReach] = useState(false);
  const [discarder, setDiscarder] = useState('');
  const [discarderPoints, setDiscarderPoints] = useState('');
  const firestore = getFirestore();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [previousRoundInfo, setPreviousRoundInfo] = useState('開局');
  const cancelRef = useRef(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#FFFFFF',
      },
      headerTintColor: '#000',
      headerTitle: 'スコア入力',
    });
  }, [navigation]);

  useEffect(() => {
    const fetchMembers = async () => {
      const gameDoc = await getDoc(doc(db, 'games', gameId));
      const memberIds = gameDoc.data().members;
      const memberNames = [];
      for (const memberId of memberIds) {
        const memberDoc = await getDoc(doc(db, 'members', memberId));
        memberNames.push({ id: memberId, name: memberDoc.data().name });
      }
      setMembers(memberNames);
    };

    const fetchRounds = async () => {
      const roundsRef = collection(db, 'games', gameId, 'rounds');
      const roundsQuery = query(roundsRef, orderBy('roundNumber'));
      const roundsSnapshot = await getDocs(roundsQuery);
      const roundsData = roundsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRounds(roundsData);
      if (roundsData.length > 0) {
        setCurrentRound(roundsData[0]);
        setCurrentRoundIndex(0);
      }
    };

    fetchMembers();
    fetchRounds();
  }, [gameId]);

  useEffect(() => {
    updateAvailablePoints();
  }, [isTsumo, currentRound.isOya]);

  const handleChange = (key, value) => {
    setCurrentRound({ ...currentRound, [key]: value });
  };

  const handleRoundNumberChange = (key, value) => {
    setCurrentRound({
      ...currentRound,
      roundNumber: {
        ...currentRound.roundNumber,
        [key]: value
      }
    });
  };

  const toggleRoleSelection = (role) => {
    const updatedRoles = selectedRoles.includes(role)
      ? selectedRoles.filter(r => r !== role)
      : [...selectedRoles, role];
    setSelectedRoles(updatedRoles);
    updateFilteredPoints(updatedRoles);
  };

  const updateFilteredPoints = (updatedRoles) => {
    const totalPoints = updatedRoles.reduce((sum, role) => {
      const roleObj = rolesOptions.find(r => r.role === role);
      return sum + (roleObj ? roleObj.points : 0);
    }, 0);

    let newFilteredPoints = availablePoints;
    if (totalPoints >= 2) {
      newFilteredPoints = newFilteredPoints.filter(point => point >= 2000);
    }
    if (totalPoints >= 4) {
      newFilteredPoints = newFilteredPoints.filter(point => point >= 8000);
    }

    setFilteredPoints(newFilteredPoints);
  };

  const updateAvailablePoints = () => {
    let points = [];
    if (currentRound.isOya && isTsumo) {
      points = [
        500, 700, 800, 1000, 1200, 1300, 1500, 1600, 2000, 2300, 2600,
        2900, 3200, 3600, 4000, 6000, 8000, 12000, 16000, 32000
      ].map(p => `${p}オール`);
    } else if (currentRound.isOya && !isTsumo) {
      points = [
        1500, 2000, 2400, 2900, 3400, 3900, 4400, 4800, 5300, 5800, 6800,
        7700, 8700, 9600, 10600, 12000, 18000, 24000, 36000, 48000, 96000
      ];
    } else if (!currentRound.isOya && isTsumo) {
      points = [
        '子(300) 親(500)', '子(400) 親(700)', '子(400) 親(800)', '子(500) 親(1000)',
        '子(600) 親(1200)', '子(700) 親(1300)', '子(800) 親(1500)', '子(800) 親(1600)',
        '子(1000) 親(1600)', '子(1000) 親(2000)', '子(1200) 親(2300)', '子(1300) 親(2600)',
        '子(1500) 親(2900)', '子(1600) 親(3200)', '子(1800) 親(3600)', '子(2000) 親(3900)',
        '子(2000) 親(4000)', '子(3000) 親(6000)', '子(4000) 親(8000)', '子(8000) 親(16000)',
        '子(16000) 親(32000)'
      ];
    } else {
      points = [
        1300, 1600, 2000, 2300, 2600, 2900, 3200, 3600, 3900, 4500, 5200,
        5800, 6400, 7100, 7700, 8000, 12000, 16000, 24000, 32000, 64000
      ];
    }
    setAvailablePoints(points);
  };

  const handleNext = async () => {
    if (currentRound.winner === discarder) {
      Alert.alert("エラー", "放銃した人と上がった人は同じにできません");
      return;
    }

    if (isReach && !selectedRoles.find(role => role === 'リーチ')) {
      Alert.alert("エラー", "リーチが選択されていません");
      return;
    }

    try {
      const roundsRef = collection(db, 'games', gameId, 'rounds');
      await addDoc(roundsRef, {
        ...currentRound,
        isTsumo: isTsumo,
        isNaki: isNaki,
        isReach: isReach,
        discarder: discarder,
        discarderPoints: discarderPoints,
        roles: selectedRoles, // 役を保存
        isOya: currentRound.isOya // 親かどうかを保存
      });

      if (currentRound.winner) {
        const winnerRef = doc(db, 'members', currentRound.winner);
        await updateDoc(winnerRef, {
          totalPoints: (await getDoc(winnerRef)).data().totalPoints + parseInt(currentRound.winnerPoints, 10)
        });
      }

      if (discarder) {
        const discarderRef = doc(db, 'members', discarder);
        await updateDoc(discarderRef, {
          totalPoints: (await getDoc(discarderRef)).data().totalPoints - parseInt(discarderPoints, 10)
        });
      }

      setIsAlertOpen(true);
      
    } catch (error) {
      console.error("Error saving round data: ", error);
    }
  };

  const handlePrevious = () => {
    if (currentRoundIndex > 0) {
      const newIndex = currentRoundIndex - 1;
      setCurrentRound(rounds[newIndex]);
      setPreviousRoundInfo(
        `<${rounds[newIndex].roundNumber.place}場${rounds[newIndex].roundNumber.round}局${rounds[newIndex].roundNumber.honba}本場>`
      );
      setCurrentRoundIndex(newIndex);
    } else {
      setPreviousRoundInfo('開局');
    }
  };

  const handleFinish = () => {
    navigation.navigate('Result', { gameId });
  };

  const confirmRolesSelection = () => {
    setCurrentRound({ ...currentRound, roles: selectedRoles });
    setModalVisible(false);
  };

  const handleAlertClose = () => {
    setIsAlertOpen(false);
    navigation.navigate('ScoreInput', { gameId }, { animation: 'slide_from_right' });
    const nextRoundNumber = getNextRoundNumber(currentRound.roundNumber, currentRound.isOya);
    setCurrentRound({
      discarder: '',
      discarderPoints: '',
      isNaki: false,
      isReach: false,
      roundNumber: nextRoundNumber,
      winner: '',
      winnerPoints: '',
      isTsumo: false,
      isOya: false, // 初期化
      roles: []
    });
    setIsTsumo(false);
    setIsNaki(false);
    setIsReach(false);
    setDiscarder('');
    setDiscarderPoints('');
    setSelectedRoles([]);
    setPreviousRoundInfo(fetchPreviousRoundInfo()); // 前のラウンド情報を更新
  };
  
  const handleOyaChange = (value) => {
    setCurrentRound({ ...currentRound, isOya: value });
    updateFilteredPoints(selectedRoles, isTsumo, value);
  };

  const handleTsumoToggle = () => {
    if (isNaki) {
      setIsNaki(false);
    }
    setIsTsumo(!isTsumo);
  };

  const handleNakiToggle = () => {
    if (isTsumo) {
      setIsTsumo(false);
    }
    setIsNaki(!isNaki);
  };

  const handleReachToggle = () => {
    const newIsReach = !isReach;
    setIsReach(newIsReach);
    if (newIsReach && !selectedRoles.includes('リーチ')) {
      setSelectedRoles([...selectedRoles, 'リーチ']);
    }
  };

  const getNextRoundNumber = (currentRoundNumber, isOya) => {
    let { round, place, honba } = currentRoundNumber;
    honba = parseInt(honba, 10);

    if (isOya) {
      honba += 1;
    } else {
      honba = 0;
      round = parseInt(round, 10) + 1;
      if (round > 4) {
        round = 1;
        const places = ['東', '南', '西', '北'];
        const currentIndex = places.indexOf(place);
        place = places[(currentIndex + 1) % places.length];
      }
    }
    return { round: round.toString(), place, honba: honba.toString() };
  };

  const fetchPreviousRoundInfo = () => {
    const previousRound = rounds[currentRoundIndex];
    if (previousRound) {
        const { place, round, honba } = previousRound.roundNumber;
        return `＜${place}場${round}局${honba}本場`;
    }
    return "開局";
  };

  return (
    <ScrollView flex={1}>
      <Box flex={1} justifyContent="center" padding={4}>
      <Text>{previousRoundInfo}</Text>
        <Text>局ごとの成績を入力してください:</Text>
        <VStack space={4}>
          <HStack space={4}>
            <Box width="20%">
              <Select
                selectedValue={currentRound.roundNumber.place}
                onValueChange={(itemValue) => handleRoundNumberChange('place', itemValue)}
                placeholder="場所"
              >
                {['東', '南', '西', '北'].map((place) => (
                  <Select.Item key={place} label={place} value={place} />
                ))}
              </Select>
            </Box>
            <Text> 場 </Text>
            <Box width="20%">
              <Select
                selectedValue={currentRound.roundNumber.round}
                onValueChange={(itemValue) => handleRoundNumberChange('round', itemValue)}
                placeholder="局"
              >
                {[1, 2, 3, 4].map((round) => (
                  <Select.Item key={round} label={round.toString()} value={round.toString()} />
                ))}
              </Select>
            </Box>
            <Text> 局 </Text>
            <Box width="20%">
              <Select
                selectedValue={currentRound.roundNumber.honba}
                onValueChange={(itemValue) => handleRoundNumberChange('honba', itemValue)}
                placeholder="本場"
              >
                {Array.from({ length: 11 }, (_, i) => i).map((honba) => (
                  <Select.Item key={honba} label={honba.toString()} value={honba.toString()} />
                ))}
              </Select>
            </Box>
            <Text> 本場 </Text>
          </HStack>
          <HStack space={4} alignItems="center">
            <Box width="80%">
              <Select
                selectedValue={currentRound.winner}
                onValueChange={(itemValue) => handleChange('winner', itemValue)}
                placeholder="あがった人"
              >
                {members.map((member) => (
                  <Select.Item key={member.id} label={member.name} value={member.id} />
                ))}
              </Select>
            </Box>
            <Checkbox
              value="isOya"
              isChecked={currentRound.isOya}
              onChange={(value) => handleOyaChange(value)}
            >
              親
            </Checkbox>
          </HStack>
          <HStack space={4} alignItems="center">
            <Text>ツモ:</Text>
            <Switch isChecked={isTsumo} onToggle={handleTsumoToggle} />
            <Text>鳴き:</Text>
            <Switch isChecked={isNaki} onToggle={handleNakiToggle} />
            <Text>リーチ:</Text>
            <Switch isChecked={isReach} onToggle={handleReachToggle} />
          </HStack>
          <Select
            selectedValue={currentRound.winnerPoints}
            onValueChange={(itemValue) => handleChange('winnerPoints', itemValue)}
            placeholder="あがり点"
          >
            {availablePoints.map((point, index) => (
              <Select.Item key={index} label={point.toString()} value={point.toString()} />
            ))}
          </Select>
          <Text>あがった役:</Text>
          <ScrollView horizontal={true} style={{ marginVertical: 10 }}>
            {selectedRoles.map((role, index) => (
              <Button
                key={index}
                variant="outline"
                margin={1}
              >
                {role}
              </Button>
            ))}
          </ScrollView>
          <Button onPress={() => setModalVisible(true)}>あがった役を選択</Button>
          <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)}>
            <Modal.Content maxWidth="400px">
              <Modal.CloseButton />
              <Modal.Header>あがった役を選択</Modal.Header>
              <Modal.Body>
                <ScrollView>
                  {rolesOptions.map((roleObj, index) => (
                    <Button
                      key={index}
                      variant={selectedRoles.includes(roleObj.role) ? "solid" : "outline"}
                      margin={1}
                      onPress={() => toggleRoleSelection(roleObj.role)}
                    >
                      {roleObj.role}
                    </Button>
                  ))}
                </ScrollView>
              </Modal.Body>
              <Modal.Footer>
                <Button onPress={confirmRolesSelection}>OK</Button>
              </Modal.Footer>
            </Modal.Content>
          </Modal>
          {!isTsumo && (
            <VStack space={4}>
              <Select
                selectedValue={currentRound.discarder}
                onValueChange={(itemValue) => handleChange('discarder', itemValue)}
                placeholder="放銃した人"
              >
                {members.map((member) => (
                  <Select.Item key={member.id} label={member.name} value={member.id} />
                ))}
              </Select>
            </VStack>
          )}
          <HStack space={4} alignItems="center">
            <Box width="30%">
              <Button onPress={handlePrevious}>前へ</Button>
            </Box>
            <Box width="30%">
              <Button onPress={handleFinish}>終了</Button>
            </Box>
            <Box width="30%">
              <Button onPress={handleNext}>次へ</Button>
            </Box>
          </HStack>
        </VStack>
      </Box>
      <AlertDialog leastDestructiveRef={cancelRef} isOpen={isAlertOpen} onClose={handleAlertClose}>
        <AlertDialog.Content>
          <AlertDialog.Header>保存成功</AlertDialog.Header>
          <AlertDialog.Body>データが保存されました。</AlertDialog.Body>
          <AlertDialog.Footer>
            <Button onPress={handleAlertClose}>OK</Button>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default ScoreInputScreen;
