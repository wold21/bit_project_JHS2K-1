/** @format */

import React, { useState } from 'react';
import { SimpleLineIcons } from '@expo/vector-icons';
import ToggleButton from 'react-native-toggle-element';

const ChangeFemale = ({ onPress }) => {
	const [toggleValue, setToggleValue] = useState(false);
	return (
		<ToggleButton
			onPress={onPress}
			value={toggleValue}
			onToggle={(newState) => setToggleValue(newState)}
			thumbActiveComponent={
				<SimpleLineIcons name='symbol-male' color='cyan' size={25} />
			}
			thumbInActiveComponent={
				<SimpleLineIcons name='symbol-female' color='red' size={25} />
			}
			thumbButton={{
				width: 40,
				height: 40,
				radius: 20,
			}}
			trackBar={{
				activeBackgroundColor: 'lightgray',
				inActiveBackgroundColor: 'lightgray',
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
