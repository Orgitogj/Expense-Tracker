import React, { ReactNode } from "react";
import {
  TextInput,
  TextInputProps,
  TextProps,
  TouchableOpacityProps,
} from "react-native";

export type ScreenWrapperProps = {
  className?: string;
  children: React.ReactNode;
};
export type ModalWrapperProps = {
  className?: string;
  children: React.ReactNode;
};

export type TypoProps = TextProps;

export type IconComponent = React.ComponentType<{
  height?: number;
  width?: number;
  strokeWidth?: number;
  color?: string;
  fill?: string;
}>;

export type IconProps = {
  name: string;
  color?: string;
  size?: number;
  strokeWidth?: number;
  fill?: string;
};

export type HeaderProps = {
  title?: string;
  className?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export type BackButtonProps = {
  className?: string;
  iconSize?: number;
};

export interface InputProps extends TextInputProps {
  icon?: React.ReactNode;
  containerClassName?: string;
  inputRef?: React.RefObject<TextInput>;
  //   label?: string;
  //   error?: string;
}

export interface CustomButtonProps extends TouchableOpacityProps {
  onPress?: () => void;
  loading?: boolean;
  children: React.ReactNode;
}

export type ImageUploadProps = {
  file?: any;
  onSelect: (file: any) => void;
  onClear: () => void;
  containerClassName?: string;
  imageClassName?: string;
  placeholder?: string;
};
