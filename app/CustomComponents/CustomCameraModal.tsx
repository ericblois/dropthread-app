import { Octicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { AutoFocus, Camera, CameraType, FlashMode } from "expo-camera";
import { CameraCapturedPicture, ImageType } from "expo-camera/build/Camera.types";
import React from "react";
import { LayoutRectangle, Text, View } from "react-native";
import { bottomInset, colors, defaultStyles, screenWidth, shadowStyles, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import BloisIconButton from "../BloisComponents/BloisIconButton";
import CustomModal from "./CustomModal";
import CustomImage from "./CustomImage";
import BloisPressable from "../BloisComponents/BloisPressable";

type CustomCameraModalProps = {
  visible: boolean,
  onSave?: (image: CameraCapturedPicture) => void,
  onClose?: () => void
}

type State = {
    permsGranted: boolean,
    ready: boolean,
    useFront: boolean,
    flashMode: FlashMode,
    image?: CameraCapturedPicture
}

export default class CustomCameraModal extends CustomComponent<CustomCameraModalProps, State> {

    cameraRef: Camera | null = null;

    constructor(props: CustomCameraModalProps) {
        super(props)
        this.state = {
            permsGranted: false,
            ready: false,
            useFront: false,
            flashMode: FlashMode.auto,
            image: undefined
        }
    }

    componentDidMount() {
        Camera.requestCameraPermissionsAsync().then((perms) => {
            if (!perms.granted) {
                if (perms.canAskAgain) {
                    Camera.requestCameraPermissionsAsync().then((newPerms) => {
                        if (newPerms.granted) {
                            this.setState({permsGranted: true})
                        }
                    })
                }
            } else if (perms.granted) {
                this.setState({permsGranted: true})
            }
        })
        super.componentDidMount()
    }

    close() {
        this.setState({ready: false, image: undefined});
        this.props.onClose?.()
    }

    render() {
        return (
            <CustomModal
                visible={this.props.visible}
                disableExitButton={true}
                disableBackgroundDismiss={true}
                blurProps={{
                    tint: 'dark',
                    intensity: 30
                }}
                onClose={() => this.close()}
            >
                <View
                    style={{
                        width: screenWidth - styleValues.mediumPadding*2,
                        aspectRatio: 1
                    }}
                >
                    {!this.state.image ?
                    (this.state.permsGranted ?
                        <Camera
                            ref={(camera) => {this.cameraRef = camera}}
                            autoFocus={AutoFocus.on}
                            flashMode={this.state.flashMode}
                            ratio={'1:1'}
                            type={this.state.useFront ? CameraType.front : CameraType.back}
                            useCamera2Api={true}
                            onCameraReady={() => {
                                this.setState({ready: true})
                            }}
                            style={{
                                ...defaultStyles.fill,
                                borderRadius: styleValues.majorPadding,
                                overflow: 'hidden',
                                transform: [{scaleX: this.state.useFront ? -1 : 1}]
                            }}
                        /> :
                        <View
                            style={{
                                ...defaultStyles.fill,
                            }}
                        >
                            <Text style={textStyles.medium}>No camera access.</Text>
                        </View>
                    ) :
                    <CustomImage
                        source={{uri: this.state.image.uri}}
                        style={{
                            ...defaultStyles.fill,
                            borderRadius: styleValues.majorPadding,
                            overflow: 'hidden'
                        }}
                    />
                }
                {/* FLASH */}
                    <BloisIconButton
                        name={this.state.flashMode === FlashMode.auto
                            ? 'ios-flash-outline'
                            : this.state.flashMode === FlashMode.on
                                ? 'ios-flash'
                                : 'ios-flash-off-outline'
                        }
                        type={'Ionicons'}
                        buttonStyle={{
                            width: styleValues.iconLargeSize,
                            position: 'absolute',
                            top: styleValues.mediumPadding,
                            left: styleValues.mediumPadding
                        }}
                        iconStyle={{
                            color: colors.white
                        }}
                        onPress={() => {
                            if (this.state.flashMode === FlashMode.on) {
                                this.setState({flashMode: FlashMode.off})
                            } else {
                                this.setState({flashMode: FlashMode.on})
                            }
                        }}
                    />
                </View>
                {/* CONTROLS */}
                <BlurView
                    intensity={25}
                    tint={'dark'}
                    style={{
                        position: 'absolute',
                        width: screenWidth - 2*styleValues.mediumPadding,
                        bottom: bottomInset + styleValues.mediumPadding,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-around',
                        paddingVertical: styleValues.mediumPadding,
                        borderRadius: styleValues.majorPadding,
                        overflow: 'hidden',
                    }}
                >
                    <BloisIconButton
                        name='close'
                        type='AntDesign'
                        buttonStyle={{
                            width: styleValues.iconLargeSize
                        }}
                        iconStyle={{
                            color: colors.white
                        }}
                        onPress={() => this.close()}
                    />
                    <BloisPressable
                        style={{
                            width: styleValues.largeHeight,
                            height: styleValues.largeHeight,
                            borderWidth: styleValues.majorBorderWidth,
                            borderColor: colors.white,
                            borderRadius: styleValues.largeHeight/2
                        }}
                        onPress={async () => {
                            if (!this.state.image) {
                                if (!this.cameraRef || !this.state.ready || !this.state.permsGranted) return;
                                const picture = await this.cameraRef.takePictureAsync({
                                    exif: false,
                                    imageType: ImageType.jpg,
                                    quality: 0.8
                                })
                                this.setState({image: picture})
                            } else if (this.props.onSave) {
                                this.props.onSave(this.state.image)
                                this.close()
                            }
                        }}
                    >
                        <Octicons
                            name='check'
                            style={{
                                width: styleValues.iconLargerSize,
                                fontSize: styleValues.iconLargerSize,
                                color: colors.white,
                                textAlign: 'center',
                                textAlignVertical: 'center',
                                opacity: !this.state.image ? 0 : 1
                            }}
                        />
                    </BloisPressable>
                    <BloisIconButton
                        name={!this.state.image ? 'camera-reverse-outline' : 'camera-outline'}
                        type={'Ionicons'}
                        buttonStyle={{
                            width: styleValues.iconLargerSize
                        }}
                        iconStyle={{
                            color: colors.white
                        }}
                        onPress={() => {
                            if (!this.state.image) {
                                this.setState({useFront: !this.state.useFront})
                            } else {
                                this.setState({image: undefined})
                            }
                        }}
                    />
                </BlurView>
            </CustomModal>
        )
    }
}