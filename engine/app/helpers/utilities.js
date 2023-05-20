import { Platform } from 'react-native'
export const getDeepLink = (path = "") => {
    const scheme = 'musicengine'
    const prefix = Platform.OS === 'android' ? `${scheme}://musicengine-host/` : `${scheme}://`
    return prefix + path
}
