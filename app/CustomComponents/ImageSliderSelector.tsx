import { Animated, Image, ImageStyle, ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { getCompressedImage } from "../HelperFiles/ClientFunctions";
import { colors, defaultStyles, screenWidth, shadowStyles, styVals } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import CustomImage from "./CustomImage";
import BloisIconButton from "../BloisComponents/BloisIconButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BloisCameraModal from "../BloisComponents/BloisCameraModal";
import Item from "../HelperFiles/Item";

type ImageInfo = {
    uri: string,
    ratio: number
}

type Props = {
    uris: string[],
    style?: ViewStyle,
    imageStyle?: ImageStyle,
    minRatio?: number,
    maxRatio?: number,
    maxNum?: number,
    showValidSelection: boolean,
    showInitialValidity: boolean,
    onChange?: (uris: {
        all: string[],
        new: string[],
        deleted: string[]
    }) => void,
    onImagesLoaded?: () => void,
    onRatiosLoaded?: () => void
}

type State = {
    showGalleryIcon: boolean,
    images: ImageInfo[],
    newImages: ImageInfo[],
    deletedImages: string[],
    galleryWidth?: number,
    galleryHeight?: number,
    cameraOpen: boolean,
    maxNum: number
}

export default class ImageSliderSelector extends CustomComponent<Props, State> {

    scrollViewRef: ScrollView | null = null;
    lastContentWidth = 0;
    loadCount: number;
    ratioCount: number;
    progress: Animated.Value;
    animationTime: number;

    constructor(props: Props) {
        super(props)
        this.state = {
            showGalleryIcon: true,
            images: props.uris.map((uri) => ({uri: uri, ratio: -1})),
            newImages: [],
            deletedImages: [],
            galleryWidth: undefined,
            galleryHeight: undefined,
            cameraOpen: false,
            maxNum: props.maxNum || Item.maxNumImages
        }
        let isValid = false
        if (props.showValidSelection) {
            isValid = props.uris.length > 0
        }
        this.loadCount = 0
        this.ratioCount = 0
        this.progress = new Animated.Value(props.showInitialValidity !== true ? 1 : (isValid ? 1 : 0))
        this.animationTime = 300
    }
    componentDidMount() {
        if (this.props.uris.length === 0) {
            if (this.props.onRatiosLoaded) {
                this.props.onRatiosLoaded()
            }
            if (this.props.onImagesLoaded) {
                this.props.onImagesLoaded()
            }
        } else {
            this.getImageRatios()
        }
        super.componentDidMount()
    }
    animValid = () => {
        Animated.timing(this.progress, {
            toValue: 1,
            duration: this.animationTime,
            useNativeDriver: false
        }).start()
    }

    animInvalid = () => {
        Animated.timing(this.progress, {
            toValue: 0,
            duration: this.animationTime,
            useNativeDriver: false
        }).start()
    }

    // On mount, get the aspect ratio of each image in the slider
    getImageRatios() {
        this.props.uris.forEach((uri, index) => {
            Image.getSize(uri, (width, height) => {
                // --- IMPORTANT: iOS gives width as height and vice versa ---
                const stateUpdate = this.state.images
                stateUpdate[index] = {uri: uri, ratio: width / height}

                this.setState({images: stateUpdate}, () => {
                    // Check if gallery height still needs to be set
                    if (index === 0 && this.state.galleryWidth && this.state.galleryHeight === undefined) {
                        this.setGalleryHeight()
                    }
                    this.ratioCount += 1
                    if (this.ratioCount === this.props.uris.length && this.props.onRatiosLoaded) {
                        this.props.onRatiosLoaded()
                    }
                })
            }, (e) => {
                this.ratioCount += 1
                if (this.ratioCount === this.props.uris.length && this.props.onRatiosLoaded) {
                    this.props.onRatiosLoaded()
                }
                console.error(e)
            })
            
        })
    }
    // Format the gallery height to match the aspect ratio of the first gallery image
    setGalleryHeight() {
        
        // Check for gallery width
        if (this.state.galleryWidth === undefined) {
            return
        }
        if (this.state.images.length === 0) {
            this.setState({galleryHeight: undefined})
        }
        // Get ratio of first image
        let ratio = this.state.images.length > 0 ? this.state.images[0].ratio : -1
        if (ratio === -1) {
            return
        }
        
        // Set the gallery height
        if (this.props.maxRatio && ratio > this.props.maxRatio) {
            ratio = this.props.maxRatio
        } else if (this.props.minRatio && ratio < this.props.minRatio) {
            ratio = this.props.minRatio
        }
        let galleryHeight = ((this.state.galleryWidth - 2*styVals.mediumPadding) / ratio) + styVals.mediumPadding*2
        this.setState({galleryHeight: galleryHeight})
    }
    // Append an image to the end of the selector
    addImage(uri: string) {
        getCompressedImage(uri, (newURI, width, height) => {
            const ratio = height / width
            const images = this.state.images
            const newImages = this.state.newImages
            images.push({uri: newURI, ratio: ratio})
            newImages.push({uri: newURI, ratio: ratio})
            // Update the URIs and images
            this.setState({images: images, newImages: newImages}, () => {
                // Check if this is the first image to be added
                if (this.state.images.length === 1) {
                    // Update the gallery height
                    this.setGalleryHeight()
                }
                if (this.props.onChange) {
                    this.props.onChange({
                        all: this.state.images.map(({uri}) => uri),
                        new: this.state.newImages.map(({uri}) => uri),
                        deleted: this.state.deletedImages
                    })
                }
                if (this.props.showValidSelection) {
                    this.animValid()
                }
            })
        })
    }
    // Remove an image based on its index
    removeImage(uri: string) {
        // Check if gallery's height should be updated
        let updateHeight = false
        // Check gallery images for change
        let currentURIs = this.state.images.map(({uri}) => uri)
        let currentImages = this.state.images
        // Get deleted images
        let deleted = this.state.deletedImages
        let index = currentURIs.indexOf(uri)
        if (index > -1) {
            deleted.push(uri)
            // Update images
            currentImages.splice(index, 1)
        }
        updateHeight = index === 0
        // Check if deleted image is in newImages
        index = this.state.newImages.map(({uri}) => uri).indexOf(uri)
        let newImages = this.state.newImages
        if (index > -1) {
            newImages.splice(index, 1)
        }
        // Update gallery height
        this.setState({images: currentImages, newImages: newImages, deletedImages: deleted}, () => {
            if (updateHeight) {
                this.setGalleryHeight()
            }
            if (this.props.onChange) {
                this.props.onChange({
                    all: this.state.images.map(({uri}) => uri),
                    new: this.state.newImages.map(({uri}) => uri),
                    deleted: this.state.deletedImages
                })
            }
            if (this.props.showValidSelection && this.state.images.length === 0) {
                this.animInvalid()
            }
        })
    }

    renderImage(item: ImageInfo, index: number) {
        if (item.uri !== "" && this.state.galleryWidth && this.state.galleryHeight) {
            let ratio = item.ratio
            // Ensure that first image fills gallery
            if (index === 0) {
                ratio = (this.state.galleryWidth - styVals.mediumPadding*2) / (this.state.galleryHeight - styVals.mediumPadding*2)
            }
            return (
                <CustomImage
                    source={{uri: item.uri, priority: index === 0 ? 'high' : 'normal'}}
                    style={{
                        ...shadowStyles.small,
                        width: ratio * (this.state.galleryHeight - styVals.mediumPadding*2),
                        height: this.state.galleryHeight - styVals.mediumPadding*2,
                        borderRadius: styVals.mediumPadding,
                    }}
                    imageStyle={{
                        borderRadius: styVals.mediumPadding,
                    }}
                    onLoad={() => {
                        if (this.props.onImagesLoaded) {
                            this.loadCount += 1
                            if (this.loadCount === this.state.images.length) {
                                this.props.onImagesLoaded()
                                this.loadCount = 0
                            }
                        }
                    }}
                    imageProps={{
                        onError: () => {
                            // Remove this uri
                            const newImages = this.state.images
                            newImages[index] = {uri: "", ratio: this.state.images[index].ratio}
                            this.setState({images: newImages})
                            // Send load update anyway
                            if (this.props.onImagesLoaded) {
                                this.loadCount += 1
                                if (this.loadCount === this.state.images.length) {
                                    this.props.onImagesLoaded()
                                    this.loadCount = 0
                                }
                            }
                        }
                    }}
                    key={index.toString()}
                >
                    {/* Add a delete button */}
                    <BloisIconButton
                        icon={{
                            type: 'MaterialCommunityIcons',
                            name: 'close'
                        }}
                        style={{
                            position: "absolute",
                            width: styVals.iconLargeSize,
                            top: styVals.mediumPadding,
                            right: styVals.mediumPadding
                        }}
                        onPress={() => {
                            this.removeImage(item.uri)
                        }}
                        tooltip={{
                            text: "Remove image",
                            posX: "left",
                            posY: "below"
                        }}
                    />
                </CustomImage>
            )
        }
    }

    renderImageSlider() {
        return (
            <ScrollView
                ref={(scrollView) => {this.scrollViewRef = scrollView}}
                style={{...defaultStyles.fill, overflow: 'hidden'}}
                contentContainerStyle={{
                    padding: styVals.mediumPadding,
                    gap: styVals.mediumPadding,
                    alignItems: "center",
                    justifyContent: "center",
                }}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                horizontal={true}
                /* THIS SHOULD BE SET TO > 1 */
                scrollEnabled={this.state.images.length > 1}
                onContentSizeChange={(width) => {
                    if (this.lastContentWidth < width) {
                        this.scrollViewRef!.scrollToEnd()
                    }
                    this.lastContentWidth = width
                }}
            >
                {this.state.images.map((item, index) => this.renderImage(item, index))}
            </ScrollView>
        )
    }

    renderPlaceholder() {
        return (
            /* Placeholder */
            <Animated.View
            style={{
                ...shadowStyles.small,
                shadowOpacity: this.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, shadowStyles.small.shadowOpacity]
                }),
                shadowColor: this.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [colors.invalid, colors.black]
                }),
                width: '100%',
                height: styVals.largestHeight*2,
                borderRadius: styVals.mediumPadding,
                backgroundColor: colors.background,
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            <MaterialCommunityIcons
                name={'image-outline'}
                style={{
                    fontSize: styVals.largestTextSize,
                    color: colors.grey
                }}
            />
        </Animated.View>
        )
    }
    // Render a button to add an image
    renderAddButton() {
        return (
            <BloisIconButton
                icon={{
                    name: "camera-plus-outline",
                    type: "MaterialCommunityIcons"
                }}
                style={{
                    position: 'absolute',
                    bottom: styVals.mediumPadding,
                    right: styVals.mediumPadding*2,
                    width: styVals.iconLargestSize,
                    padding: styVals.mediumPadding,
                    borderRadius: styVals.mediumPadding,
                    backgroundColor: colors.background,
                }}
                pressableProps={{disabled: this.state.images.length >= this.state.maxNum}}
                iconStyle={{
                    color: this.state.images.length >= this.state.maxNum ? colors.lighterGrey : colors.darkerGrey
                }}
                onPress={async () => {
                    this.setState({cameraOpen: true})
                }}
                tooltip={{
                    text: "Add new image",
                    posX: "left"
                }}
            />
        )
    }

    renderCamera() {
        return (
            <BloisCameraModal
                visible={this.state.cameraOpen}
                onSave={(image) => {
                    this.addImage(image.uri);
                }}
                onClose={() => this.setState({cameraOpen: false})}
            />
        )
    }

    render() {
        // Check validity of input
        if (this.props.showValidSelection && this.props.showInitialValidity === true) {
            if (this.state.images.length > 0) {
                this.animValid()
            } else {
                this.animInvalid()
            }
        }
        return (
            <View
                style={{
                    width: "100%",
                    height: this.state.galleryHeight,
                    overflow: 'visible',
                    padding: styVals.mediumPadding,
                    ...this.props.style
                }}
                onLayout={(e) => {
                    if (this.state.galleryWidth === undefined) {
                        this.setState({galleryWidth: e.nativeEvent.layout.width}, () => {
                            if (this.state.galleryHeight === undefined) {
                                this.setGalleryHeight()
                            }
                        })
                    }
                }}
            >
                {this.state.images.length > 0 ?
                    this.renderImageSlider() : 
                    this.renderPlaceholder()
                }
            {this.renderAddButton()}
            {this.renderCamera()}
            </View>
        );
    }
}