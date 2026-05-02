import React from 'react';
import {
  View,
  ScrollView,
  ViewStyle,
  StyleProp,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView, Edge} from 'react-native-safe-area-context';
import {styles} from './styles/Screen.styles';

interface ScreenProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: Edge[];
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  withKeyboardAvoidingView?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  footer,
  header,
  scrollable = false,
  style,
  contentStyle,
  edges = ['top', 'left', 'right', 'bottom'],
  keyboardShouldPersistTaps = 'handled',
  withKeyboardAvoidingView = false,
}) => {
  const content = (
    <>
      {header}
      {scrollable ? (
        <ScrollView
          style={[styles.content, contentStyle]}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, contentStyle]}>
          {children}
        </View>
      )}
      {footer && <View style={styles.footer}>{footer}</View>}
    </>
  );

  return (
    <SafeAreaView style={[styles.container, style]} edges={edges}>
      {withKeyboardAvoidingView ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{flex: 1}}>
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
};
