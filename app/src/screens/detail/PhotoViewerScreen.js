/**
 * Wedring Matrimony — PhotoViewerScreen Component
 * Full-screen zoomable photo gallery previewer
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PhotoViewerScreen = ({ route, navigation }) => {
  const { photos = [], initialPhotoId } = route.params || {};
  const [activeId, setActiveId] = useState(initialPhotoId);

  const initialIndex = photos.findIndex(p => p.id === initialPhotoId);
  const [currentIndex, setCurrentIndex] = useState(initialIndex !== -1 ? initialIndex : 0);

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
    if (photos[index]) {
      setActiveId(photos[index].id);
    }
  };

  return (
    <View style={styles.container}>
      {/* Close button */}
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      {/* Slide Counter */}
      {photos.length > 0 && (
        <Text style={styles.counter}>
          {currentIndex + 1} / {photos.length}
        </Text>
      )}

      {/* Main horizontal scrolling */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        contentOffset={{ x: currentIndex * SCREEN_WIDTH, y: 0 }}
      >
        {photos.map((photo) => (
          <View key={photo.id} style={styles.slide}>
            <Image
              source={{ uri: photo.storage_path }}
              style={styles.image}
              contentFit="contain"
              transition={200}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  closeButton: {
    position: 'absolute',
    top: 48,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  counter: {
    position: 'absolute',
    top: 56,
    right: 20,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    zIndex: 10,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
});

export default PhotoViewerScreen;
