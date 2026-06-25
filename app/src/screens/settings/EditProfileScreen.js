/**
 * Wedring Matrimony — EditProfileScreen Component (Premium Redesign)
 * Tabbed editor for Personal, Family, and Lifestyle details.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { colors } from '../../theme';
import { borderRadius, layout } from '../../theme/spacing';
import shadows from '../../theme/shadows';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import SearchablePicker from '../../components/common/SearchablePicker';
import useProfileStore from '../../store/useProfileStore';
import useAuthStore from '../../store/useAuthStore';
import useToastStore from '../../store/useToastStore';
import { uploadProfilePhoto, deleteProfilePhoto, setPrimaryProfilePhoto } from '../../api/profiles';
import { HEIGHT_OPTIONS, FOOD_HABITS, MARITAL_STATUS, STARS, RAASIS } from '../../utils/constants';

const TABS = [
  { id: 'personal', label: 'Personal' },
  { id: 'family', label: 'Family' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'horoscope', label: 'Horoscope' },
  { id: 'photos', label: 'Photos' },
];

const EditProfileScreen = ({ route, navigation }) => {
  const user = useAuthStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const horoscope = useProfileStore((s) => s.horoscope);
  const photos = useProfileStore((s) => s.photos);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const saveHoroscope = useProfileStore((s) => s.saveHoroscope);
  const addPhoto = useProfileStore((s) => s.addPhoto);
  const removePhoto = useProfileStore((s) => s.removePhoto);
  const setPrimaryPhoto = useProfileStore((s) => s.setPrimaryPhoto);

  const initialTab = route?.params?.initialTab || 'personal';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const showToast = useToastStore((state) => state.showToast);

  // Personal Fields
  const [displayName, setDisplayName] = useState(profile?.name || '');
  const [aboutMe, setAboutMe] = useState(profile?.about_me || '');
  const [city, setCity] = useState(profile?.city || '');
  const [occupation, setOccupation] = useState(profile?.occupation || '');
  const [heightCm, setHeightCm] = useState(profile?.height_cm ? String(profile.height_cm) : '');
  const [maritalStatus, setMaritalStatus] = useState(profile?.marital_status || '');

  // Family Fields
  const [familyType, setFamilyType] = useState(profile?.family_type || '');
  const [familyStatus, setFamilyStatus] = useState(profile?.family_status || '');
  const [fatherOcc, setFatherOcc] = useState(profile?.father_occupation || '');
  const [motherOcc, setMotherOcc] = useState(profile?.mother_occupation || '');

  // Lifestyle Fields
  const [foodHabit, setFoodHabit] = useState(profile?.food_habit || '');

  // Horoscope Fields
  const [star, setStar] = useState(horoscope?.nakshatra || '');
  const [raasi, setRaasi] = useState(horoscope?.rasi || '');
  const [lagnam, setLagnam] = useState(horoscope?.lagnam || '');
  const [gothram, setGothram] = useState(horoscope?.gothram || '');
  const [dasaBalance, setDasaBalance] = useState(horoscope?.dasa_balance || '');

  // Synchronize local states with store data when loaded asynchronously
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.name || '');
      setAboutMe(profile.about_me || '');
      setCity(profile.city || '');
      setOccupation(profile.occupation || '');
      setHeightCm(profile.height_cm ? String(profile.height_cm) : '');
      setMaritalStatus(profile.marital_status || '');
      setFamilyType(profile.family_type || '');
      setFamilyStatus(profile.family_status || '');
      setFatherOcc(profile.father_occupation || '');
      setMotherOcc(profile.mother_occupation || '');
      setFoodHabit(profile.food_habit || '');
    }
  }, [profile]);

  useEffect(() => {
    if (horoscope) {
      setStar(horoscope.nakshatra || '');
      setRaasi(horoscope.rasi || '');
      setLagnam(horoscope.lagnam || '');
      setGothram(horoscope.gothram || '');
      setDasaBalance(horoscope.dasa_balance || '');
    }
  }, [horoscope]);

  const handleSave = async () => {
    if (!displayName.trim()) {
      showToast('error', 'Required field', 'Please specify your display name');
      return;
    }

    try {
      setIsSaving(true);
      await updateProfile(user.id, {
        name: displayName,
        about_me: aboutMe,
        city,
        occupation,
        height_cm: heightCm ? parseInt(heightCm, 10) : null,
        marital_status: maritalStatus,
        family_type: familyType,
        family_status: familyStatus,
        father_occupation: fatherOcc,
        mother_occupation: motherOcc,
        food_habit: foodHabit,
      });

      await saveHoroscope({
        user_id: user.id,
        nakshatra: star || null,
        rasi: raasi || null,
        lagnam: lagnam || null,
        gothram: gothram.trim() || null,
        dasa_balance: dasaBalance.trim() || null,
      });
      setIsSaving(false);
      showToast('success', 'Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (err) {
      setIsSaving(false);
      showToast('error', 'Error', err.message || 'Failed to update profile');
    }
  };

  const handleAddPhoto = async () => {
    if (photos.length >= 4) {
      showToast('warning', 'Limit Reached', 'You can only upload up to 4 photos.');
      return;
    }

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showToast('warning', 'Permission Required', 'Please allow access to your photos to upload a picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const fileUri = result.assets[0].uri;
        setIsUploading(true);

        const isFirstPhoto = photos.length === 0;
        const newPhotoRecord = await uploadProfilePhoto(user.id, fileUri, {
          replacePrimary: false,
          isPrimary: isFirstPhoto
        });

        if (newPhotoRecord) {
          addPhoto(newPhotoRecord);
        }
        setIsUploading(false);
      }
    } catch (error) {
      setIsUploading(false);
      console.error('Error in handleAddPhoto:', error);
      showToast('error', 'Upload Failed', `Error: ${error.message || 'There was an issue uploading your photo. Please try again.'}`);
    }
  };

  const handleSetPrimary = async (photo) => {
    if (photo.is_primary) return;
    try {
      await setPrimaryProfilePhoto(user.id, photo.id);
      setPrimaryPhoto(photo.id);
      showToast('success', 'Photo Updated', 'Primary photo set successfully.');
    } catch (error) {
      showToast('error', 'Error', 'Failed to set primary photo.');
    }
  };

  const handleDeletePhoto = (photo) => {
    Alert.alert('Delete Photo', 'Are you sure you want to delete this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProfilePhoto(photo.id, photo.storage_path);
            removePhoto(photo.id);
            showToast('success', 'Deleted', 'Photo removed.');
          } catch (error) {
            showToast('error', 'Error', 'Failed to delete photo.');
          }
        }
      }
    ]);
  };

  const renderPersonalTab = () => (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.tabContent}>
      <Input
        label="Display Name"
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Enter your full name"
      />
      <Input
        label="About Me"
        value={aboutMe}
        onChangeText={setAboutMe}
        placeholder="Describe yourself, your interests and background..."
        multiline
        numberOfLines={4}
        style={styles.textArea}
      />
      <View style={styles.row}>
        <View style={styles.flex1}>
          <Input
            label="City"
            value={city}
            onChangeText={setCity}
            placeholder="e.g. Chennai"
          />
        </View>
        <View style={styles.flex1}>
          <SearchablePicker
            label="Height"
            placeholder="Select"
            searchPlaceholder="Search height"
            options={HEIGHT_OPTIONS}
            value={heightCm ? parseInt(heightCm, 10) : ''}
            onChange={(val) => setHeightCm(val ? String(val) : '')}
          />
        </View>
      </View>
      <Input
        label="Occupation"
        value={occupation}
        onChangeText={setOccupation}
        placeholder="e.g. Software Engineer"
      />
      <SearchablePicker
        label="Marital Status"
        placeholder="Select Marital Status"
        options={MARITAL_STATUS}
        value={maritalStatus}
        onChange={setMaritalStatus}
        searchable={false}
      />
    </Animated.View>
  );

  const renderFamilyTab = () => (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.tabContent}>
      <Input
        label="Father's Occupation"
        value={fatherOcc}
        onChangeText={setFatherOcc}
        placeholder="e.g. Business, Retired, etc."
      />
      <Input
        label="Mother's Occupation"
        value={motherOcc}
        onChangeText={setMotherOcc}
        placeholder="e.g. Homemaker, Teacher, etc."
      />
      <View style={styles.row}>
        <View style={styles.flex1}>
          <SearchablePicker
            label="Family Type"
            placeholder="Select"
            searchable={false}
            options={[
              { label: 'Nuclear', value: 'nuclear' },
              { label: 'Joint', value: 'joint' }
            ]}
            value={familyType}
            onChange={setFamilyType}
          />
        </View>
        <View style={styles.flex1}>
          <SearchablePicker
            label="Family Status"
            placeholder="Select"
            searchable={false}
            options={[
              { label: 'Middle Class', value: 'middle_class' },
              { label: 'Upper Middle', value: 'upper_middle_class' },
              { label: 'Rich', value: 'rich' },
              { label: 'Affluent', value: 'affluent' }
            ]}
            value={familyStatus}
            onChange={setFamilyStatus}
          />
        </View>
      </View>
    </Animated.View>
  );

  const renderLifestyleTab = () => (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.tabContent}>
      <SearchablePicker
        label="Dietary Habit"
        placeholder="Select Food Habit"
        options={FOOD_HABITS}
        value={foodHabit}
        onChange={setFoodHabit}
        searchable={false}
      />
    </Animated.View>
  );

  const renderHoroscopeTab = () => (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.tabContent}>
      <SearchablePicker
        label="Star / Nakshatra"
        placeholder="Select Star"
        options={STARS}
        value={star}
        onChange={setStar}
      />
      <SearchablePicker
        label="Raasi / Moon Sign"
        placeholder="Select Raasi"
        options={RAASIS}
        value={raasi}
        onChange={setRaasi}
      />
      <SearchablePicker
        label="Lagnam"
        placeholder="Select Lagnam"
        options={RAASIS}
        value={lagnam}
        onChange={setLagnam}
      />
      <Input
        label="Gothram"
        value={gothram}
        onChangeText={setGothram}
        placeholder="Enter your gothram"
      />
      <Input
        label="Dasa Balance"
        value={dasaBalance}
        onChangeText={setDasaBalance}
        placeholder="e.g. Rahu 2 years"
      />
    </Animated.View>
  );

  const renderPhotosTab = () => (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.tabContent}>
      <Text style={styles.sectionDesc}>
        Upload up to 4 photos. We recommend clear, front-facing portraits. Your first photo will be your primary profile picture.
      </Text>

      <View style={styles.photoGrid}>
        {photos?.map((photo) => (
          <View key={photo.id} style={styles.photoCard}>
            <Image source={{ uri: photo.storage_path }} style={styles.photoImage} />
            {photo.is_primary && (
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryBadgeText}>Primary</Text>
              </View>
            )}
            <View style={styles.photoActions}>
              {!photo.is_primary && (
                <TouchableOpacity style={styles.photoActionBtn} onPress={() => handleSetPrimary(photo)}>
                  <Text style={styles.photoActionText}>★ Primary</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.photoActionBtnDel} onPress={() => handleDeletePhoto(photo)}>
                <Text style={styles.photoActionTextDel}>🗑 Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {photos?.length < 4 && (
          <TouchableOpacity style={styles.addPhotoBtn} onPress={handleAddPhoto} disabled={isUploading}>
            {isUploading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Text style={styles.addPhotoIcon}>+</Text>
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Custom Tabs */}
        <View style={styles.tabContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tabButton, isActive && styles.tabButtonActive]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {activeTab === 'personal' && renderPersonalTab()}
          {activeTab === 'family' && renderFamilyTab()}
          {activeTab === 'lifestyle' && renderLifestyleTab()}
          {activeTab === 'horoscope' && renderHoroscopeTab()}
          {activeTab === 'photos' && renderPhotosTab()}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={isSaving}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: 14,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backText: {
    fontSize: 24,
    color: colors.textPrimary,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  
  // ── Tabs ──
  tabContainer: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tabScroll: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    gap: 24,
  },
  tabButton: {
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.primary,
  },

  scroll: {
    padding: layout.screenPaddingHorizontal,
    paddingBottom: 40,
  },
  tabContent: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  
  footer: {
    padding: layout.screenPaddingHorizontal,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.bottomNav,
  },
  sectionDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  photoCard: {
    width: '47%',
    aspectRatio: 0.8,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  photoImage: {
    width: '100%',
    height: '75%',
    backgroundColor: colors.background,
  },
  primaryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  primaryBadgeText: {
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: '700',
  },
  photoActions: {
    flexDirection: 'row',
    height: '25%',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  photoActionBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.borderLight,
  },
  photoActionText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  photoActionBtnDel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoActionTextDel: {
    fontSize: 11,
    color: colors.error,
    fontWeight: '600',
  },
  addPhotoBtn: {
    width: '47%',
    aspectRatio: 0.8,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoIcon: {
    fontSize: 32,
    color: colors.textMuted,
    marginBottom: 8,
  },
  addPhotoText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
});

export default EditProfileScreen;
