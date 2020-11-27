/** @format */

import React, { useState } from 'react';
import { SimpleLineIcons } from '@expo/vector-icons';
import { Image } from 'react-native';
import ToggleButton from 'react-native-toggle-element';

const ChangeFemale = ({ onPress }) => {
    const [toggleValue, setToggleValue] = useState(false);

    return (
        <ToggleButton
            onPress={onPress}
            value={toggleValue}
            onToggle={(newState) => setToggleValue(newState)}
            thumbActiveComponent={
                <Image
                    source={require('./Gender/man.png')}
                    style={{
                        width: 40,
                        height: 40,
                        // marginTop: -10,
                        resizeMode: 'contain',
                    }}
                />
            }
            thumbInActiveComponent={
                <Image
                    source={require('./Gender/woman.png')}
                    style={{
                        width: 40,
                        height: 40,
                        // marginTop: -10,
                        resizeMode: 'contain',
                    }}
                />
            }
            thumbButton={{
                width: 50,
                height: 40,
                radius: 0,
            }}
            trackBar={{
                activeBackgroundColor: 'transparent',
                inActiveBackgroundColor: 'transparent',
                borderActiveColor: 'white',
                borderInActiveColor: 'white',
                width: 50,
                height: 30,
            }}
            trackBarStyle={{
                opacity: 0.9,
            }}
        />
    );
};
export default ChangeFemale;
