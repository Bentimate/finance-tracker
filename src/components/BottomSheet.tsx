import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import {styles} from './styles/BottomSheet.styles';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeight?: number;
  topContent?: React.ReactNode; // New prop for content above the sheet/backdrop
}

const {height} = Dimensions.get('window');

const DURATION = 280;
const easing = Easing.bezier(0.25, 0.1, 0.25, 1); // cubic-bezier ease

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  maxHeight = height * 0.7,
  topContent,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(visible);
  const translateY = useSharedValue(height);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setIsModalVisible(true);
      translateY.value = height;
      backdropOpacity.value = 0;

      translateY.value = withTiming(0, {duration: DURATION, easing});
      backdropOpacity.value = withTiming(1, {duration: DURATION, easing});
    } else {
      translateY.value = withTiming(height, {duration: DURATION, easing});
      backdropOpacity.value = withTiming(0, {duration: DURATION, easing}, finished => {
        // Unmount modal only after animation completes, called on JS thread
        if (finished) runOnJS(setIsModalVisible)(false);
      });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{translateY: translateY.value}],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <Modal
      transparent
      visible={isModalVisible}
      onRequestClose={onClose}
      animationType="none"
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {backgroundColor: 'rgba(0,0,0,0.5)'},
          backdropStyle,
        ]}
        pointerEvents="none"
      />

      <View style={styles.container} pointerEvents="box-none">
        {topContent}
        <TouchableOpacity
          style={{flex: 1}}
          onPress={onClose}
          activeOpacity={1}
          accessibilityLabel="Close Modal"
        />

        <Animated.View
          pointerEvents="auto"
          style={[styles.sheet, {maxHeight}, sheetStyle]}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};
