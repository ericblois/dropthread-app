import { Octicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { AutoFocus, Camera, CameraType, FlashMode } from "expo-camera";
import { CameraCapturedPicture, ImageType } from "expo-camera/build/Camera.types";
import React from "react";
import { LayoutRectangle, Text, View } from "react-native";
import { bottomInset, colors, defaultStyles, screenWidth, shadowStyles, styVals, textStyles, topInset } from "../HelperFiles/StyleSheet";
import CustomComponent from "../CustomComponents/CustomComponent";
import BloisIconButton from "./BloisIconButton";
import CustomModal from "../CustomComponents/CustomModal";
import CustomImage from "../CustomComponents/CustomImage";
import BloisPressable from "./BloisPressable";

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

export default class BloisCameraModal extends CustomComponent<CustomCameraModalProps, State> {

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
                <View style={{paddingTop: topInset + styVals.mediumPadding, paddingBottom: bottomInset + styVals.mediumPadding}}>
                    <View style={{flex: 1, justifyContent: 'center'}}>
                        <View
                            style={{
                                width: screenWidth - styVals.mediumPadding*2,
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
                                        borderRadius: styVals.majorPadding,
                                        overflow: 'hidden',
                                        transform: [{scaleX: this.state.useFront ? -1 : 1}]
                                    }}
                                /> :
                                <View
                                    style={{
                                        ...defaultStyles.fill,
                                    }}
                                >
                                    <Text style={textStyles.large}>No camera access.</Text>
                                </View>
                            ) :
                            <CustomImage
                                source={{uri: this.state.image.uri}}
                                style={{
                                    ...defaultStyles.fill,
                                    borderRadius: styVals.majorPadding,
                                    overflow: 'hidden'
                                }}
                            />
                        }
                        {/* FLASH */}
                            <BloisIconButton
                                icon={{
                                    type: 'Ionicons',
                                    name: this.state.flashMode === FlashMode.auto
                                    ? 'ios-flash-outline'
                                    : this.state.flashMode === FlashMode.on
                                        ? 'ios-flash'
                                        : 'ios-flash-off-outline'
                                }}
                                style={{
                                    width: styVals.iconLargeSize,
                                    position: 'absolute',
                                    top: styVals.mediumPadding,
                                    left: styVals.mediumPadding
                                }}
                                iconStyle={{
                                    color: colors.white
                                }}
                                animType={'opacity'}
                                onPress={() => {
                                    if (this.state.flashMode === FlashMode.on) {
                                        this.setState({flashMode: FlashMode.off})
                                    } else {
                                        this.setState({flashMode: FlashMode.on})
                                    }
                                }}
                            />
                        </View>
                    </View>
                    {/* CONTROLS */}
                    <BlurView
                        intensity={25}
                        tint={'dark'}
                        style={{
                            width: screenWidth - 2*styVals.mediumPadding,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-around',
                            paddingVertical: styVals.mediumPadding,
                            borderRadius: styVals.majorPadding,
                            overflow: 'hidden',
                        }}
                    >
                        <BloisIconButton
                            icon={{
                                type: 'AntDesign',
                                name: 'close'
                            }}
                            style={{width: styVals.iconLargeSize}}
                            iconStyle={{color: colors.white}}
                            animType={'opacity'}
                            onPress={() => this.close()}
                        />
                        <BloisIconButton
                            icon={{
                                type: 'Feather',
                                name: 'check'
                            }}
                            style={{
                                width: styVals.largeHeight,
                                height: styVals.largeHeight,
                                borderWidth: styVals.majorBorderWidth,
                                borderColor: colors.white,
                                borderRadius: styVals.largeHeight/2,
                                padding: styVals.mediumPadding*2
                            }}
                            iconStyle={{
                                color: colors.white,
                                opacity: this.state.image ? 1 : 0,
                            }}
                            animType={'opacity'}
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
                        />
                        <BloisIconButton
                            icon={{
                                type: 'Ionicons',
                                name: !this.state.image ? 'camera-reverse-outline' : 'camera-outline'
                            }}
                            style={{
                                width: styVals.iconLargerSize
                            }}
                            iconStyle={{
                                color: colors.white
                            }}
                            animType={'opacity'}
                            onPress={() => {
                                if (!this.state.image) {
                                    this.setState({useFront: !this.state.useFront})
                                } else {
                                    this.setState({image: undefined})
                                }
                            }}
                        />
                    </BlurView>
                </View>
            </CustomModal>
        )
    }
}