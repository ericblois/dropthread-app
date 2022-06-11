import React from "react";
import { Image, ImageStyle, ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { accessPhotos, getCompressedImage } from "../HelperFiles/ClientFunctions";
import { colors, icons, shadowStyles, styleValues } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import GradientView from "./GradientView";
import IconButton from "./IconButton";
import ImageAnimated from "./ImageAnimated";

type ImageInfo = {
    uri: string,
    ratio: number
}

type Props = {
    uris: string[],
    style?: ViewStyle,
    imageStyle?: ImageStyle,
    placeHolderStyle?: ViewStyle,
    minRatio?: number,
    maxRatio?: number,
    fadeColor?: string,
    showWarning?: boolean,
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
    galleryHeight?: number
}

export default class ImageSliderSelector extends CustomComponent<Props, State> {

    loadCount: number
    ratioCount: number

    constructor(props: Props) {
        super(props)
        this.state = {
            showGalleryIcon: true,
            images: props.uris.map((uri) => ({uri: uri, ratio: -1})),
            newImages: [],
            deletedImages: [],
            galleryWidth: undefined,
            galleryHeight: undefined
        }
        this.loadCount = 0
        this.ratioCount = 0
    }
    componentDidMount() {
        if (this.props.uris.length === 0) {
            if (this.props.onRatiosLoaded) {
                this.props.onRatiosLoaded()
            }
            if (this.props.onImagesLoaded) {
                this.props.onImagesLoaded()
            }
        }
        this.getImageRatios()
        super.componentDidMount()
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
        let galleryHeight = ((this.state.galleryWidth - 2*styleValues.mediumPadding) / ratio) + styleValues.mediumPadding*2
        this.setState({galleryHeight: galleryHeight})
    }

    renderImage(item: ImageInfo, index: number) {
        if (item.uri !== "" && this.state.galleryWidth && this.state.galleryHeight) {
            let ratio = item.ratio
            // Ensure that first image fills gallery
            if (index === 0) {
                ratio = (this.state.galleryWidth - styleValues.mediumPadding*2) / (this.state.galleryHeight - styleValues.mediumPadding*2)
            }
            return (
                <ImageAnimated
                    source={{uri: item.uri}}
                    style={{
                        ...shadowStyles.small,
                        width: ratio * (this.state.galleryHeight - styleValues.mediumPadding*2),
                        height: this.state.galleryHeight - styleValues.mediumPadding*2,
                        borderRadius: styleValues.mediumPadding,
                        marginHorizontal: styleValues.minorPadding,
                    }}
                    imageStyle={{
                        borderRadius: styleValues.mediumPadding,
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
                            const stateUpdate = this.state.images
                            stateUpdate[index] = {uri: "", ratio: this.state.images[index].ratio}
                            this.setState({images: stateUpdate})
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
                    <IconButton
                        iconSource={icons.minus}
                        buttonStyle={{
                            position: "absolute",
                            width: styleValues.iconMediumSize,
                            height: styleValues.iconMediumSize,
                            margin: styleValues.mediumPadding,
                            top: 0,
                            right: 0,
                        }}
                        iconStyle={{
                            tintColor: colors.white
                        }}
                        buttonFunc={() => {
                            this.removeImage(item.uri)
                        }}
                        infoProps={{
                            text: "Remove image",
                            positionHorizontal: "left",
                            positionVertical: "beside"
                        }}
                    />
                </ImageAnimated>
            )
        } else {
            return (<View key={index.toString()}/>)
        }
    }
    // Render a button to add an image
    renderAddButton() {
        return (
            <IconButton
                iconSource={icons.plus}
                buttonStyle={styles.addImageButton}
                iconStyle={{tintColor: colors.white}}
                buttonFunc={async () => {
                    const result = await accessPhotos()
                    if (result) {
                        this.addImage(result)
                    }
                }}
                infoProps={{
                    text: "Add new image",
                    positionHorizontal: "right"
                }}
            />
        )
    }
    // Append an image to the end of the selector
    addImage(uri: string) {
        getCompressedImage(uri, (newURI) => {
            // Create a new image component
            Image.getSize(newURI, (height, width) => {
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
                })
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
        })
    }

    render() {
        return (
            <View
                style={{
                    ...styles.gallery,
                    width: "100%",
                    height: this.state.galleryHeight,
                    overflow: "hidden",
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
                {this.props.uris.length > 0 ?
                    /* Image scroller */
                    <><ScrollView
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0
                        }}
                        contentContainerStyle={{
                            paddingVertical: styleValues.mediumPadding,
                            paddingHorizontal: styleValues.mediumPadding/2,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        horizontal={true}
                        /* THIS SHOULD BE SET TO > 1 */
                        scrollEnabled={this.state.images.length > 1}
                    >
                        {this.state.images.map((item, index) => this.renderImage(item, index))}
                    </ScrollView>
                    <GradientView
                        fadeStartColor={this.props.fadeColor}
                        fadeEndColor={this.props.fadeColor}
                        backgroundStartColor={this.props.fadeColor}
                        backgroundEndColor={this.props.fadeColor}
                        horizontal
                    /></> : 
                    /* Placeholder */
                    <View
                        style={{
                            ...shadowStyles.medium,
                            width: styleValues.winWidth - 2*styleValues.mediumPadding,
                            height: styleValues.largestHeight*2,
                            borderRadius: styleValues.mediumPadding,
                            backgroundColor: colors.lightestGrey,
                            margin: styleValues.mediumPadding,
                            alignItems: "center",
                            justifyContent: "center",
                            ...this.props.placeHolderStyle
                        }}
                    >
                        <Image
                            source={icons.image}
                            style={{
                                width: styleValues.iconSmallSize,
                                height: styleValues.iconSmallSize,
                                tintColor: colors.lightGrey
                            }}
                            resizeMethod={"scale"}
                            resizeMode={"contain"}
                        />
                    </View>
                }
            {this.renderAddButton()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    gallery: {
        width: "100%",
        overflow: "hidden"
    },
    addImageButton: {
        width: styleValues.iconLargeSize,
        height: styleValues.iconLargeSize,
        position: "absolute",
        margin: styleValues.mediumPadding,
        bottom: styleValues.mediumPadding,
        left: styleValues.mediumPadding,
    },
});