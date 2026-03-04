import { ImageSourcePropType } from 'react-native';

export const getImageSource = (url?: string, name?: string, category?: string): ImageSourcePropType => {
    if (url) return { uri: url };
    return { uri: 'https://via.placeholder.com/150' };
};
