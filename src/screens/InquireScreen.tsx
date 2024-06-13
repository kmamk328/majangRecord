import React, { useState, useEffect } from 'react';
import { ScrollView, Box, Text, Spinner } from '@gluestack-ui/themed';
import { getFirestore, collection, getDocs, doc, getDoc, query, orderBy, startAfter, limit } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const InquireScreen = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastVisible, setLastVisible] = useState(null);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

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
        <Box padding={4}>
            {games.map((game) => (
            <Box key={game.id} borderWidth={1} borderColor="gray.300" padding={4} marginBottom={4}>
                <Text fontWeight="bold">Created At: {game.createdAt}</Text>
                <Text>Members:</Text>
                {game.members.map((member, index) => (
                <Text key={index}>- {member}</Text>
                ))}
            </Box>
            ))}
            {isFetchingMore && (
            <Box flex={1} justifyContent="center" alignItems="center">
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

export default InquireScreen;
