import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { StyleSheet, Text, View} from 'react-native';
import { format } from 'date-fns';

import { useNavigation } from '@react-navigation/native';
import { ScrollView, Box, Spinner, HStack, VStack } from '@gluestack-ui/themed';
// import { Text,View } from '../components/Themed';
import Icon from 'react-native-vector-icons/Feather';


import { getFirestore, collection, getDocs, doc, getDoc, query, orderBy, startAfter, limit } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import Gradient from '../../assets/Icons/Gradient';
import DocumentData from '../../assets/Icons/DocumentData';
import LightBulbPerson from '../../assets/Icons/LightbulbPerson';
import Rocket from '../../assets/Icons/Rocket';
import Logo from '../../assets/Icons/Logo';

const InquireScreen = () => {
    const navigation = useNavigation();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastVisible, setLastVisible] = useState(null);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    // const formattedDate = format(new Date(game.createdAt), 'yyyy年MM月dd日');

    const fetchData = async (loadMore = false) => {
        try {
            const gamesCollection = collection(db, 'games');
            const gamesQuery = query(gamesCollection, orderBy('createdAt', 'desc'), limit(10), ...(lastVisible ? [startAfter(lastVisible)] : []));
            const gamesSnapshot = await getDocs(gamesQuery);

            const gamesList = [];
            for (const gameDoc of gamesSnapshot.docs) {
                const gameData = gameDoc.data();
                const membersNames = await Promise.all(
                    gameData.members.map(async (memberId) => {
                    const memberDoc = await getDoc(doc(db, 'members', memberId));
                    return memberDoc.exists() ? memberDoc.data().name : 'Unknown Member';
                    })
                );
                gamesList.push({
                    id: gameDoc.id,
                    createdAt: gameData.createdAt.toDate().toLocaleString(),
                    members: membersNames,
                });
            }

            if (loadMore) {
                setGames((prevGames) => [...prevGames, ...gamesList]);
            } else {
                setGames(gamesList);
            }

            setLastVisible(gamesSnapshot.docs[gamesSnapshot.docs.length - 1]);
        } catch (error) {
            console.error('Error fetching games:', error);
        } finally {
            setLoading(false);
            setIsFetchingMore(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
            backgroundColor: '#FFFFFF',
            },
            headerTintColor: '#000',
            headerTitle: '戦績照会',
        });
    }, [navigation]);

    const handleLoadMore = () => {
        if (!isFetchingMore) {
            setIsFetchingMore(true);
            fetchData(true);
        }
    };

    if (loading) {
        return (
        <Box flex={1} justifyContent="center" alignItems="center">
            <Spinner size="large" />
            <Text>Loading...</Text>
        </Box>
    );
    }

    return (
        <ScrollView
            onScroll={({ nativeEvent }) => {
            if (isCloseToBottom(nativeEvent)) {
                handleLoadMore();
            }
            }}
            scrollEventThrottle={400}
        >
        <Box padding={4} >
            {games.map((game) => (
            <Box style={styles.inquirebox} key={game.id} borderWidth={1} borderColor="gray.300" padding={4} marginBottom={4} >
                <Text style={styles.getDateText}>{game.createdAt}</Text>
                <View style={styles.membersContainer}>
                {game.members.map((member, index) => (
                <View key={index} style={styles.member}>
                    <Icon name="user" size={20} color="black" />
                    <Text
                        key={index}
                        style={styles.getStartedText}
                        // lightColor="rgba(0,0,0,0.8)"
                        // darkColor="rgba(255,255,255,0.8)"
                    >
                        {member}
                    </Text>
                </View>
                ))}
                </View>
            </Box>
            ))}
            {isFetchingMore && (
            <Box flex={1} justifyContent="center" alignItems="center" >
                <Spinner size="large" />
                <Text>Loading more...</Text>
            </Box>
            )}
        </Box>
        </ScrollView>
    );
};

const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
};

const styles = StyleSheet.create({
    box: {
        flex: 1,
        padding: 16, // コンテナのパディング
        backgroundColor: '#F5FCFF',
    },
    inquirebox: {
        marginBottom: 16,
        marginHorizontal: 10,
        backgroundColor: '#ffffff',
        shadowColor: '#000', // 影の色
        shadowOffset: { width: 0, height: 2 }, // 影のオフセット
        shadowOpacity: 0.25, // 影の不透明度
        shadowRadius: 3.84, // 影のぼかし範囲
        elevation: 5, // Androidのための影の高さ
    },
    getStartedContainer: {
        alignItems: 'center',
        marginHorizontal: 50,
    },
    homeScreenFilename: {
        marginVertical: 7,
    },
    codeHighlightContainer: {
        borderRadius: 3,
        paddingHorizontal: 4,
    },
    getDateText: {
        fontSize: 17,
        lineHeight: 24,
        textAlign: 'center',
    },
    getStartedText: {
        fontSize: 17,
        lineHeight: 24,
        textAlign: 'left',
    },
    helpContainer: {
        marginTop: 15,
        marginHorizontal: 20,
        alignItems: 'center',
    },
    helpLink: {
        paddingVertical: 15,
    },
    helpLinkText: {
        textAlign: 'center',
    },
    membersContainer: {
        flexDirection: 'row', // 横一列に配置
        justifyContent: 'space-around', // 均等にスペースを配置
        marginTop: 10,
        },
    member: {
        alignItems: 'center', // アイコンと名前を中央揃え
    },
});

export default InquireScreen;
