import AsyncStorage from '@react-native-async-storage/async-storage';

const Storage = {
    USER_DETAILS: 'USER_DETAILS',
    USER_LANGUAGE: 'USER_LANGUAGE',

    async save(key: string, value: string): Promise<boolean> {
        try {
            const res = await AsyncStorage.setItem(key, value ?? '');
            return true
        } catch (error) {
            console.log('error', error)
            return false
        }
    },
    async get(key: string): Promise<string | null> {
        try {
            const result = await AsyncStorage.getItem(key);
            return result
        } catch (error) {
            console.log('error', error)
            return null
        }
    },
    async clear() {
        const result = await AsyncStorage.clear()
        return result
    },
}

export {
    Storage,
}
