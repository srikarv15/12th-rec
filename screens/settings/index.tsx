import React, { useState } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from '@react-navigation/native';
import { UserCredential, getAuth } from "firebase/auth"
import { getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import * as ImagePicker from 'expo-image-picker';

import { db } from "../../firebase/firebaseConfig";
import useImagePicker from "../../utils/useImagePicker";
import { VStack,  Heading, Button, Center, Image, Box, Skeleton } from "native-base";

import useAppStore from "../../store/useAppStore";

interface Props {
    navigation: NativeStackNavigationProp<any, any>
    route: RouteProp<{ params: { user: UserCredential } }, 'params'>
}

const SettingsScreen: React.FC<Props> = ({ route, navigation }) => {
    const auth = getAuth();
    const storage = getStorage();

    const currentUser = useAppStore((state) => state.currentUser)
    const setCurrentUser = useAppStore((state) => state.setCurrentUser)
    const getImage = useImagePicker()

    const [profilePicURL, setProfilePicURL] = useState<unknown>(currentUser.profilePicURL);

    const handleLogOut = async () => {
        await auth.signOut();
    }

    const uploadImage = async () => {
        const newFile = await getImage()

        if(!newFile) return

        setProfilePicURL(null);
        const storageRef = ref(storage, currentUser.uid);
        await uploadBytesResumable(storageRef, newFile)

        const url = `https://firebasestorage.googleapis.com/v0/b/threc-e1518.appspot.com/o/${currentUser.uid}?alt=media&token=`
        const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
                profilePicURL: profilePicURL
        })
        setProfilePicURL(url);
        setCurrentUser({ name: currentUser.name, classification: currentUser.classification, email: currentUser.email, uid: currentUser.uid, profilePicURL: url })
    }

    return (
        <VStack height="full" width="full" alignItems="center" justifyContent="space-around" safeArea >
            <Center>
                <Box onTouchEnd={uploadImage} >
                    { profilePicURL ? (
                        <Image source={{
                            uri: (profilePicURL as string)
                        }} alt="Alternate Text" size="xl" borderRadius={100} />
                    ): (
                        <>
                            <Skeleton borderWidth={1} borderColor="coolGray.200" endColor="#A24857" size="20" rounded="full" marginY={4} />
                        </>
                    )  }
                </Box>
                <Heading fontSize="4xl" color="maroon">{currentUser.name}</Heading>
            </Center>

            <VStack justifyContent="space-around" width="75%" >
                <Button width="100%" marginY={4} backgroundColor="maroon"onPress={() => navigation.navigate("PersonalInformation")}>Personal Information</Button>
                <Button width="100%" marginY={4} backgroundColor="maroon">How It Works</Button>
                <Button width="100%"marginY={4} backgroundColor="maroon">Help</Button>
            </VStack>

            <Button width="75%" colorScheme="light" onPress={handleLogOut} >Log Out</Button>
        </VStack>
    )
}

export default SettingsScreen