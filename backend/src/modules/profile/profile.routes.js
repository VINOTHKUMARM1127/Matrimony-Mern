/**
 * Wedring Backend — Profile Routes
 */
import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import auth from '../../middleware/auth.js';
import * as profileController from './profile.controller.js';

const router = Router();

// --- Validation schemas ---
const personalSchema = z.object({
  full_name: z.string().min(1).optional(),
  gender: z.enum(['Male', 'Female']).optional(),
  dob: z.string().optional(),
  height_cm: z.number().int().min(100).max(250).optional(),
  marital_status: z.string().optional(),
});

const religionSchema = z.object({
  religion: z.string().min(1),
  caste: z.string().optional(),
});

const educationSchema = z.object({
  highest_qualification: z.string().min(1),
  occupation: z.string().min(1),
  annual_income: z.string().optional(),
});

const familyLocationSchema = z.object({
  family_details: z.any().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  about_me: z.string().optional(),
});

const horoscopeSchema = z.object({
  rasi: z.string().optional(),
  nakshatra: z.string().optional(),
  lagnam: z.string().optional(),
  gothram: z.string().optional(),
  dosham: z.string().optional(),
});

const additionalSchema = z.object({
  languages_known: z.array(z.string()).optional(),
  hobbies: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  lifestyle_prefs: z.any().optional(),
});

const partnerPrefSchema = z.object({
  age_min: z.number().int().optional(),
  age_max: z.number().int().optional(),
  height_min_cm: z.number().int().optional(),
  height_max_cm: z.number().int().optional(),
  marital_status: z.array(z.string()).optional(),
  religion: z.array(z.string()).optional(),
  caste: z.array(z.string()).optional(),
  education: z.array(z.string()).optional(),
  occupation: z.array(z.string()).optional(),
  food_habits: z.array(z.string()).optional(),
});

// --- Routes ---
router.get('/', auth, profileController.getOwnProfile);
router.patch('/', auth, profileController.updateGeneric);

router.post('/personal', auth, validate(personalSchema), profileController.updatePersonal);
router.post('/religion', auth, validate(religionSchema), profileController.updateReligion);
router.post('/education', auth, validate(educationSchema), profileController.updateEducation);
router.post('/family-location', auth, validate(familyLocationSchema), profileController.updateFamilyLocation);
router.post('/horoscope', auth, validate(horoscopeSchema), profileController.updateHoroscope);
router.post('/additional', auth, validate(additionalSchema), profileController.updateAdditional);
router.post('/partner-preferences', auth, validate(partnerPrefSchema), profileController.updatePartnerPreferences);

router.get('/search', auth, profileController.searchProfiles);
router.post('/:userId/view', auth, profileController.logProfileView);
router.put('/active', auth, profileController.updateLastActive);

router.get('/location/states', profileController.getStates);
router.get('/location/districts/:state', profileController.getDistricts);
router.get('/location/cities/:district', profileController.getCities);
router.get('/religion/castes/:religion', profileController.getCastes);

// Must be last (catches :userId)
router.get('/:userId', auth, profileController.getPublicProfile);

export default router;
