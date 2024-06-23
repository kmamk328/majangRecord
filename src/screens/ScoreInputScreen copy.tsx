import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getFirestore, collection, addDoc, doc, updateDoc, getDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { View, Text, Button, Select, Switch, Checkbox, XStack, YStack, Sheet, ScrollView, styled, PortalProvider, Dialog, DialogContent, DialogTitle, DialogDescription, DialogActions } from 'tamagui';

const StyledScrollView = styled(ScrollView, {
  flex: 1,
});

const StyledView = styled(View, {
  flex: 1,
  justifyContent: 'center',
  padding: '$4',
});

const StyledButton = styled(Button, {
  margin: '$2',
});

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
    isOya: false,
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    try {
      const roundsRef = collection(db, 'games', gameId, 'rounds');
      await addDoc(roundsRef, {
        ...currentRound,
        isTsumo: isTsumo,
        isNaki: isNaki,
        isReach: isReach,
        discarder: discarder,
        discarderPoints: discarderPoints,
        roles: selectedRoles,
        isOya: currentRound.isOya
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

      setIsDialogOpen(true);
      
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

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    navigation.navigate('ScoreInput', { gameId }, { animation: 'slide_from_right' });
    setCurrentRound({
      discarder: '',
      discarderPoints: '',
      isNaki: false,
      isReach: false,
      roundNumber: { round: '1', place: '東', honba: '0' },
      winner: '',
      winnerPoints: '',
      isTsumo: false,
      isOya: false,
      roles: []
    });
    setIsTsumo(false);
    setIsNaki(false);
    setIsReach(false);
    setDiscarder('');
    setDiscarderPoints('');
    setSelectedRoles([]);
    setPreviousRoundInfo(fetchPreviousRoundInfo());
  };

  const handleOyaChange = (value) => {
    setCurrentRound({ ...currentRound, isOya: value });
    updateFilteredPoints(selectedRoles, isTsumo, value);
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
    <PortalProvider>
      <StyledScrollView>
        <StyledView>
          <Text>{previousRoundInfo}</Text>
          <Text>局ごとの成績を入力してください:</Text>
          <YStack space="$4">
            <XStack space="$4">
              <Select
                value={currentRound.roundNumber.place}
                onValueChange={(itemValue) => handleRoundNumberChange('place', itemValue)}
                placeholder="場所"
                width={100}
              >
                {['東', '南', '西', '北'].map((place) => (
                  <Select.Item key={place} label={place} value={place} />
                ))}
              </Select>
              <Text> 場 </Text>
              <Select
                value={currentRound.roundNumber.round}
                onValueChange={(itemValue) => handleRoundNumberChange('round', itemValue)}
                placeholder="局"
                width={60}
              >
                {[1, 2, 3, 4].map((round) => (
                  <Select.Item key={round} label={round.toString()} value={round.toString()} />
                ))}
              </Select>
              <Text> 局 </Text>
              <Select
                value={currentRound.roundNumber.honba}
                onValueChange={(itemValue) => handleRoundNumberChange('honba', itemValue)}
                placeholder="本場"
                width={60}
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((honba) => (
                  <Select.Item key={honba} label={honba.toString()} value={honba.toString()} />
                ))}
              </Select>
              <Text> 本場 </Text>
            </XStack>
            <XStack space="$4" alignItems="center">
              <Select
                value={currentRound.winner}
                onValueChange={(itemValue) => handleChange('winner', itemValue)}
                placeholder="あがった人"
                width={240}
              >
                {members.map((member) => (
                  <Select.Item key={member.id} label={member.name} value={member.id} />
                ))}
              </Select>
              <Checkbox
                value={currentRound.isOya}
                checked={currentRound.isOya}
                onCheckedChange={handleOyaChange}
              >
                <Text>親</Text>
              </Checkbox>
            </XStack>
            <XStack space="$4" alignItems="center">
              <Text>ツモ:</Text>
              <Switch checked={isTsumo} onCheckedChange={() => setIsTsumo(!isTsumo)} />
              <Text>鳴き:</Text>
              <Switch checked={isNaki} onCheckedChange={() => setIsNaki(!isNaki)} />
              <Text>リーチ:</Text>
              <Switch checked={isReach} onCheckedChange={() => setIsReach(!isReach)} />
            </XStack>
            <Select
              value={currentRound.winnerPoints}
              onValueChange={(itemValue) => handleChange('winnerPoints', itemValue)}
              placeholder="あがり点"
            >
              {availablePoints.map((point, index) => (
                <Select.Item key={index} label={point.toString()} value={point.toString()} />
              ))}
            </Select>
            <Text>あがった役:</Text>
            <ScrollView horizontal={true} marginVertical="$2">
              {selectedRoles.map((role, index) => (
                <StyledButton
                  key={index}
                  variant="outline"
                >
                  {role}
                </StyledButton>
              ))}
            </ScrollView>
            <StyledButton onPress={() => setModalVisible(true)}>あがった役を選択</StyledButton>
            <Sheet modal open={modalVisible} onOpenChange={setModalVisible}>
              <Sheet.Overlay />
              <Sheet.Frame>
                <Sheet.Handle />
                <Sheet.Header>
                  <Text>あがった役を選択</Text>
                </Sheet.Header>
                <Sheet.ScrollView>
                  {rolesOptions.map((roleObj, index) => (
                    <StyledButton
                      key={index}
                      variant={selectedRoles.includes(roleObj.role) ? "solid" : "outline"}
                      onPress={() => toggleRoleSelection(roleObj.role)}
                    >
                      {roleObj.role}
                    </StyledButton>
                  ))}
                </Sheet.ScrollView>
                <Sheet.Footer>
                  <StyledButton onPress={confirmRolesSelection}>OK</StyledButton>
                </Sheet.Footer>
              </Sheet.Frame>
            </Sheet>
            {!isTsumo && (
              <Select
                value={currentRound.discarder}
                onValueChange={(itemValue) => handleChange('discarder', itemValue)}
                placeholder="放銃した人"
                width={240}
              >
                {members.map((member) => (
                  <Select.Item key={member.id} label={member.name} value={member.id} />
                ))}
              </Select>
            )}
            <XStack space="$4" alignItems="center">
              <StyledButton onPress={handlePrevious}>前へ</StyledButton>
              <StyledButton onPress={handleFinish}>終了</StyledButton>
              <StyledButton onPress={handleNext}>次へ</StyledButton>
            </XStack>
          </YStack>
        </StyledView>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Dialog.Content>
            <Dialog.Title>保存成功</Dialog.Title>
            <Dialog.Description>
              データが保存されました。
            </Dialog.Description>
            <Dialog.Actions>
              <StyledButton onPress={handleDialogClose}>OK</StyledButton>
            </Dialog.Actions>
          </Dialog.Content>
        </Dialog>
      </StyledScrollView>
    </PortalProvider>
  );
};

export default ScoreInputScreen;
